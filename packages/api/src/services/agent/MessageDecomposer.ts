import Anthropic from '@anthropic-ai/sdk';
import type {
  DecompositionResult,
  AgentConversationContext,
} from '@sapai/shared';
import type { TokenUsage } from '../../utils/cost-estimator.js';
import { env } from '../../config/environment.js';

// ---------------------------------------------------------------------------
// Complexity Detection Heuristics
//
// These run BEFORE any LLM call. If the message is simple ("change qty to 75
// on line 6 of PO 123"), we skip decomposition entirely — no latency, no cost.
// ---------------------------------------------------------------------------

const TEMPORAL_WORDS =
  /\b(already|received|delivered|remaining|outstanding|last|previous|original(?:ly)?|currently|still|left|prior|existing)\b/i;

const MATH_WORDS =
  /\b(total|minus|plus|leaving|subtract|net|difference|sum|less|more|additional|extra|deduct)\b/i;

const RELATIVE_CHANGE =
  /\b(increase|decrease|double|triple|half|halve|reduce|raise|lower|bump|cut)\b/i;

const PERCENTAGE = /\d+\s*%/;

const FROM_TO = /from\s+\d[\d,.]*\s*(?:\w+\s+)?to\s+\d/i;

const MULTI_LINE_REFS = /\b(?:line|item|row)\s*#?\s*\d+/gi;

/**
 * Determine whether a message is complex enough to warrant LLM decomposition.
 * This is a cheap heuristic — no LLM call.
 */
export function shouldDecompose(message: string): boolean {
  const numbers = message.match(/\d+(?:\.\d+)?/g) ?? [];
  const lineRefs = message.match(MULTI_LINE_REFS) ?? [];

  // 4+ numbers strongly suggests embedded math/specs
  if (numbers.length >= 4) return true;

  // 3 numbers with temporal or math language
  if (numbers.length >= 3 && (TEMPORAL_WORDS.test(message) || MATH_WORDS.test(message)))
    return true;

  // Relative changes ("increase by 20%", "double the order")
  if (RELATIVE_CHANGE.test(message)) return true;

  // Percentage patterns
  if (PERCENTAGE.test(message)) return true;

  // Explicit from/to patterns with 3+ numbers
  if (FROM_TO.test(message) && numbers.length >= 3) return true;

  // Multiple line item references (multi-item message)
  if (lineRefs.length >= 2 && numbers.length >= 3) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Tool Schema
// ---------------------------------------------------------------------------

const DECOMPOSE_TOOL: Anthropic.Tool = {
  name: 'decompose_message',
  description:
    'Decompose a complex user message into structured quantity/change specifications',
  input_schema: {
    type: 'object' as const,
    properties: {
      needsDecomposition: {
        type: 'boolean',
        description:
          'Whether the message actually contains complex specifications that benefit from decomposition',
      },
      specifications: {
        type: 'array',
        description:
          'Structured change specifications — one per entity being modified',
        items: {
          type: 'object',
          properties: {
            targetEntity: {
              type: 'string',
              description:
                'How the user referenced the entity (e.g., "line 8", "the brakes", "item 00010")',
            },
            fieldChanges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    enum: [
                      'quantity',
                      'deliveryDate',
                      'plant',
                      'unit',
                      'description',
                    ],
                  },
                  originalValue: {
                    type: 'string',
                    description:
                      'The current/from value mentioned by the user, if any',
                  },
                  newValue: {
                    type: 'string',
                    description: 'The target/to value',
                  },
                  changeType: {
                    type: 'string',
                    enum: [
                      'absolute',
                      'relative_increase',
                      'relative_decrease',
                      'percentage',
                      'multiply',
                    ],
                  },
                  rawExpression: {
                    type: 'string',
                    description: 'The exact user text for this change',
                  },
                  unit: {
                    type: 'string',
                    description:
                      'Unit of measure if mentioned (e.g., "ft", "EA", "each", "kg")',
                  },
                  confidence: {
                    type: 'number',
                    description: 'How confident you are in this extraction (0-1)',
                  },
                },
                required: [
                  'field',
                  'newValue',
                  'changeType',
                  'rawExpression',
                  'confidence',
                ],
              },
            },
            materialHint: {
              type: 'string',
              description:
                'Material or description keyword if the user named the item (e.g., "brakes", "copper piping")',
            },
          },
          required: ['targetEntity', 'fieldChanges'],
        },
      },
      quantities: {
        type: 'array',
        description:
          'ALL numbers mentioned in the message with their semantic roles',
        items: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: [
                'original',
                'delivered',
                'target',
                'remaining',
                'adjustment',
              ],
            },
            value: { type: 'number' },
            context: {
              type: 'string',
              description:
                'The surrounding text that gives this number its meaning',
            },
          },
          required: ['role', 'value', 'context'],
        },
      },
      mathCheck: {
        type: 'string',
        description:
          'Verify the arithmetic is consistent. E.g., "93 ordered - 5 delivered = 88 outstanding. User wants 15 total. 15 - 5 already delivered = 10 remaining. Consistent."',
      },
      warnings: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Anything unusual: partial deliveries, large qty reductions, dimensional unit ambiguity, etc.',
      },
      normalizedMessage: {
        type: 'string',
        description:
          'A clean, unambiguous restatement of the user\'s request. E.g., "For PO 4500000006, Line 8: Change total order quantity from 93 to 15. Note: 5 units already received, 10 remaining to deliver."',
      },
      summary: {
        type: 'string',
        description: 'Brief human-readable summary of what was decomposed',
      },
    },
    required: [
      'needsDecomposition',
      'specifications',
      'quantities',
      'warnings',
      'normalizedMessage',
    ],
  },
};

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

function buildDecomposerPrompt(): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `You are a message decomposer for SAP Purchase Order operations.
Your ONLY job is to pre-process complex user messages and extract structured change specifications. You prepare the message for a downstream intent parser that will handle the actual SAP operations.

Today's date is ${today}.

## What You Do
1. Identify EVERY number in the message and label its semantic role (original, delivered, target, remaining, adjustment)
2. Extract structured field change specifications (what field, from what value, to what value, change type)
3. Verify the user's arithmetic is internally consistent
4. Flag anything unusual as a warning
5. Produce a clean, unambiguous normalized restatement of the request

## Semantic Roles for Quantities
- **original**: The current/starting quantity on the PO ("originally ordered 93")
- **delivered**: Already shipped/received ("received 5 last week", "already got 20")
- **target**: The desired new total ("change to 15", "we only need 15")
- **remaining**: What's left to deliver after the change ("leaving 10 more")
- **adjustment**: A delta, not an absolute ("increase by 20", "reduce by half")

## Change Types
- **absolute**: Direct "from X to Y" or "set to Y" with explicit new value
- **relative_increase**: "increase by 20", "add 50 more"
- **relative_decrease**: "reduce by 10", "cut by half"
- **percentage**: "increase by 20%", "reduce by 15%"
- **multiply**: "double the order", "triple it"

## Rules
1. Extract EXACTLY what the user said. Do not infer or calculate values the user did not state.
2. When the user mentions an original/current value, ALWAYS capture it as originalValue — this is critical for downstream validation.
3. The targetEntity should match exactly how the user referred to the item ("line 8", "the brakes", "item 00010").
4. If the user mentions a material name or product description (e.g., "brakes", "copper piping", "forks"), capture it in materialHint.
5. Watch for unit mentions attached to numbers: "75ft", "20mm", "100 EA". These go in the unit field.
6. For the normalizedMessage, restate the request clearly and unambiguously. Include ALL relevant context (PO number, line number, original value, new value, any delivery context).
7. Flag warnings for: partial deliveries, large quantity reductions (>50%), dimensional unit mentions (ft, mm, kg with a count-unit item), ambiguous references.
8. If the message is actually simple and doesn't need decomposition, set needsDecomposition to false and still provide a normalizedMessage.
9. When dates are mentioned without a year (e.g. "April 30th", "March 15"), ALWAYS assume the current year. Never default to a past year.
10. Messages may be EMAILS or forwarded correspondence. Ignore greetings, small talk, signatures, and filler. Focus ONLY on actionable SAP operations. A single email may request changes to multiple line items — extract ALL of them.

## Examples

### Complex: Partial delivery with quantity change
Input: "Regarding PO 4500000006, Line 8: I know we originally ordered 93 units and we already received 5 last week. However, we only need a total of 15 units now. Since we already have 5, please change the PO total quantity to 15 (leaving 10 more to be delivered)."

Output:
- needsDecomposition: true
- quantities: [{role: "original", value: 93, context: "originally ordered 93 units"}, {role: "delivered", value: 5, context: "already received 5 last week"}, {role: "target", value: 15, context: "only need a total of 15 units"}, {role: "remaining", value: 10, context: "leaving 10 more to be delivered"}]
- specifications: [{targetEntity: "Line 8", fieldChanges: [{field: "quantity", originalValue: "93", newValue: "15", changeType: "absolute", rawExpression: "change the PO total quantity to 15", confidence: 0.95}]}]
- mathCheck: "93 ordered - 5 delivered = 88 outstanding. User wants 15 total. 15 - 5 already delivered = 10 remaining to deliver. User's math is consistent."
- warnings: ["5 units already delivered — PO quantity change won't affect received goods", "Reducing from 93 to 15 is an 84% decrease"]
- normalizedMessage: "For PO 4500000006, Line 8: Change total order quantity from 93 to 15. Context: 5 units already received, 10 remaining to deliver."

### Complex: Relative change with unit ambiguity
Input: "For the copper piping on PO 4500000002, increase from 35 to 75ft"

Output:
- needsDecomposition: true
- quantities: [{role: "original", value: 35, context: "from 35"}, {role: "target", value: 75, context: "to 75ft"}]
- specifications: [{targetEntity: "the copper piping", fieldChanges: [{field: "quantity", originalValue: "35", newValue: "75", changeType: "absolute", rawExpression: "increase from 35 to 75ft", unit: "ft", confidence: 0.9}], materialHint: "copper piping"}]
- mathCheck: "35 to 75 = increase of 40 units. Unit 'ft' noted."
- warnings: ["User specified 'ft' — if the SAP item is tracked in pieces (PC/EA), this may indicate a product specification change rather than a quantity increase"]
- normalizedMessage: "For PO 4500000002, copper piping item: Change quantity from 35 to 75ft. Warning: 'ft' unit may indicate specification change."

### Simple: No decomposition needed
Input: "Show me PO 4500000001"

Output:
- needsDecomposition: false
- quantities: []
- specifications: []
- warnings: []
- normalizedMessage: "Show me PO 4500000001"`;
}

// ---------------------------------------------------------------------------
// MessageDecomposer
// ---------------------------------------------------------------------------

export class MessageDecomposer {
  private client: Anthropic;

  constructor(client?: Anthropic) {
    this.client = client ?? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  /** Heuristic check — exposed as instance method for orchestrator convenience. */
  shouldDecompose(message: string): boolean {
    return shouldDecompose(message);
  }

  /**
   * Decompose a complex user message into structured quantity/change specs.
   * Returns a DecompositionResult with quantities, specifications, warnings,
   * and a clean normalizedMessage for the downstream IntentParser.
   */
  async decompose(
    message: string,
    _context?: AgentConversationContext,
  ): Promise<DecompositionResult & { tokenUsage?: TokenUsage }> {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is not configured. Cannot decompose message.',
      );
    }

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: message },
    ];

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: buildDecomposerPrompt(),
        tools: [DECOMPOSE_TOOL],
        tool_choice: { type: 'tool', name: 'decompose_message' },
        messages,
      });
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        throw new Error(
          `Anthropic API authentication failed — check ANTHROPIC_API_KEY (${err.status})`,
          { cause: err },
        );
      }
      if (err instanceof Anthropic.RateLimitError) {
        throw new Error(
          `Anthropic API rate limited — try again shortly (${err.status})`,
          { cause: err },
        );
      }
      if (err instanceof Anthropic.APIConnectionError) {
        throw new Error(
          `Cannot connect to Anthropic API — check network connectivity (${err.message})`,
          { cause: err },
        );
      }
      if (err instanceof Anthropic.APIError) {
        throw new Error(
          `Anthropic API error — ${err.message} (${err.status})`,
          { cause: err },
        );
      }
      throw new Error(
        `Decomposition failed — ${err instanceof Error ? err.message : 'unknown error'}`,
        { cause: err },
      );
    }

    const tokenUsage: TokenUsage | undefined = response.usage
      ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          model: env.ANTHROPIC_MODEL,
        }
      : undefined;

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse) {
      // Graceful fallback — no decomposition
      return {
        needsDecomposition: false,
        specifications: [],
        quantities: [],
        warnings: [],
        normalizedMessage: message,
        tokenUsage,
      };
    }

    const raw = toolUse.input as Record<string, unknown>;

    // Defensive validation — LLM output can have unexpected shapes
    const specifications = Array.isArray(raw.specifications)
      ? (raw.specifications as DecompositionResult['specifications']).filter(
          (s) =>
            s &&
            typeof s.targetEntity === 'string' &&
            Array.isArray(s.fieldChanges),
        )
      : [];

    const quantities = Array.isArray(raw.quantities)
      ? (raw.quantities as DecompositionResult['quantities']).filter(
          (q) => q && typeof q.role === 'string' && typeof q.value === 'number',
        )
      : [];

    return {
      needsDecomposition: raw.needsDecomposition === true,
      specifications,
      quantities,
      mathCheck:
        typeof raw.mathCheck === 'string' ? raw.mathCheck : undefined,
      warnings: Array.isArray(raw.warnings)
        ? (raw.warnings as string[]).filter((w) => typeof w === 'string')
        : [],
      normalizedMessage:
        typeof raw.normalizedMessage === 'string' && raw.normalizedMessage
          ? raw.normalizedMessage
          : message,
      summary:
        typeof raw.summary === 'string' ? raw.summary : undefined,
      tokenUsage,
    };
  }
}
