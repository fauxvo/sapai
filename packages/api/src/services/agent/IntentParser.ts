import Anthropic from '@anthropic-ai/sdk';
import type {
  ParseResult,
  ParsedIntent,
  AgentConversationContext,
} from '@sapai/shared';
import type { TokenUsage } from '../../utils/cost-estimator.js';
import { env } from '../../config/environment.js';
import { intentRegistry } from './intents/registry.js';
import {
  buildSystemPrompt,
  buildToolSchema,
} from './intents/prompt-builder.js';

export class IntentParser {
  private client: Anthropic;

  constructor(client?: Anthropic) {
    this.client = client ?? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async parse(
    message: string,
    context?: AgentConversationContext,
  ): Promise<ParseResult & { tokenUsage?: TokenUsage }> {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is not configured. Cannot parse intents.',
      );
    }

    const systemPrompt = buildSystemPrompt(intentRegistry);
    const tool = buildToolSchema(intentRegistry);

    const messages: Anthropic.MessageParam[] = [];

    // Include conversation history for multi-turn context
    if (context?.messages) {
      const recentMessages = context.messages.slice(-20);
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'agent') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      }
    }

    // Add current message
    let userContent = message;
    if (context?.activeEntities && context.activeEntities.length > 0) {
      const entityContext = context.activeEntities
        .map((e) => `${e.entityType}: ${e.entityValue}`)
        .join(', ');
      userContent = `[Active context: ${entityContext}]\n\n${message}`;
    }
    messages.push({ role: 'user', content: userContent });

    const response = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools: [tool as unknown as Anthropic.Tool],
      tool_choice: { type: 'tool', name: 'parse_sap_intent' },
      messages,
    });

    // Extract token usage
    const tokenUsage: TokenUsage | undefined = response.usage
      ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          model: env.ANTHROPIC_MODEL,
        }
      : undefined;

    // Extract tool use result
    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse) {
      return {
        intents: [],
        unhandledContent: 'Failed to parse intent',
        tokenUsage,
      };
    }

    const result = toolUse.input as {
      intents: ParsedIntent[];
      unhandledContent?: string;
    };

    return {
      intents: result.intents ?? [],
      unhandledContent: result.unhandledContent,
      tokenUsage,
    };
  }
}
