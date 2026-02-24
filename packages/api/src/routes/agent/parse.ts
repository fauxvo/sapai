import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { ConversationStore } from '../../services/agent/ConversationStore.js';
import { IntentParser } from '../../services/agent/IntentParser.js';
import { Validator } from '../../services/agent/Validator.js';
import { EntityResolver } from '../../services/agent/EntityResolver.js';
import { PlanBuilder } from '../../services/agent/PlanBuilder.js';
import { PlanStore } from '../../services/agent/PlanStore.js';
import { Executor } from '../../services/agent/Executor.js';
import { AuditLogger } from '../../services/agent/AuditLogger.js';
import { env } from '../../config/environment.js';

const conversationStore = new ConversationStore();
const intentParser = new IntentParser();
const validator = new Validator();
const entityResolver = new EntityResolver();
const planBuilder = new PlanBuilder();
const planStore = new PlanStore();
const executor = new Executor();
const auditLogger = new AuditLogger();

const ParseRequestSchema = z
  .object({
    message: z.string().min(1),
    conversationId: z.string().optional(),
  })
  .openapi('AgentParseRequest');

const ParseResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      conversationId: z.string(),
      messageId: z.string(),
      parseResult: z.object({
        intents: z.array(
          z.object({
            intentId: z.string(),
            confidence: z.number(),
            extractedFields: z.record(z.string(), z.unknown()),
            missingRequiredFields: z.array(z.string()).optional(),
            ambiguousFields: z
              .array(
                z.object({
                  field: z.string(),
                  value: z.string(),
                  reason: z.string(),
                }),
              )
              .optional(),
          }),
        ),
        unhandledContent: z.string().optional(),
      }),
      plan: z
        .object({
          planId: z.string(),
          createdAt: z.string(),
          intents: z.array(z.unknown()),
          requiresApproval: z.boolean(),
          summary: z.string(),
        })
        .optional(),
      executionResult: z.unknown().optional(),
      clarification: z
        .object({
          message: z.string(),
          missingFields: z.array(z.string()),
        })
        .optional(),
    }),
  })
  .openapi('AgentParseResponse');

const parseRoute = createRoute({
  tags: ['Agent'],
  method: 'post',
  path: '/parse',
  request: { body: jsonContent(ParseRequestSchema, 'User message to parse') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ParseResponseSchema, 'Parse result'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Parse error',
    ),
  },
});

export const parseApp = new OpenAPIHono();

parseApp.openapi(parseRoute, async (c) => {
  const { message, conversationId: existingConvId } = c.req.valid('json');

  try {
    // Create or load conversation
    let conversationId = existingConvId;
    if (conversationId) {
      const existing = await conversationStore.getConversation(conversationId);
      if (!existing) {
        return c.json(
          {
            success: false as const,
            error: `Conversation ${conversationId} not found`,
          },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      const conv = await conversationStore.createConversation({
        title: message.slice(0, 100),
      });
      conversationId = conv.id;
    }

    // Save user message
    const userMsg = await conversationStore.addMessage(
      conversationId,
      'user',
      message,
    );

    // Load conversation context
    const context =
      await conversationStore.getConversationContext(conversationId);

    // Parse intent via Claude API
    const parseStart = Date.now();
    const parseResult = await intentParser.parse(message, context ?? undefined);
    const parseDuration = Date.now() - parseStart;

    await auditLogger.log({
      conversationId,
      phase: 'parse',
      input: { message },
      output: parseResult,
      durationMs: parseDuration,
    });

    // Check for no intents or unhandled content
    if (parseResult.intents.length === 0) {
      const agentMsg =
        parseResult.unhandledContent ??
        "I couldn't identify a supported operation in your message.";
      await conversationStore.addMessage(conversationId, 'agent', agentMsg);

      return c.json(
        {
          success: true as const,
          data: {
            conversationId,
            messageId: userMsg.id,
            parseResult,
          },
        },
        HttpStatusCodes.OK,
      );
    }

    // Validate intents
    const validationResults = validator.validateAll(parseResult.intents);
    const allMissing = validationResults.flatMap((v) => v.missingFields);

    if (allMissing.length > 0) {
      const clarificationMsg = `I need more information: ${allMissing.join(', ')}`;
      await conversationStore.addMessage(
        conversationId,
        'agent',
        clarificationMsg,
      );

      return c.json(
        {
          success: true as const,
          data: {
            conversationId,
            messageId: userMsg.id,
            parseResult,
            clarification: {
              message: clarificationMsg,
              missingFields: allMissing,
            },
          },
        },
        HttpStatusCodes.OK,
      );
    }

    // Check confidence threshold
    const lowConfidence = parseResult.intents.filter(
      (i) => i.confidence < env.AGENT_CONFIDENCE_THRESHOLD,
    );
    if (lowConfidence.length > 0) {
      const clarificationMsg = `I'm not confident about: ${lowConfidence.map((i) => i.intentId).join(', ')}. Could you rephrase?`;
      await conversationStore.addMessage(
        conversationId,
        'agent',
        clarificationMsg,
      );

      return c.json(
        {
          success: true as const,
          data: {
            conversationId,
            messageId: userMsg.id,
            parseResult,
            clarification: {
              message: clarificationMsg,
              missingFields: [],
            },
          },
        },
        HttpStatusCodes.OK,
      );
    }

    // Resolve entities (allSettled so one failure doesn't block the rest)
    const settledResults = await Promise.allSettled(
      parseResult.intents.map((intent) => entityResolver.resolve(intent)),
    );
    const resolved = settledResults
      .filter(
        (
          r,
        ): r is PromiseFulfilledResult<
          Awaited<ReturnType<typeof entityResolver.resolve>>
        > => r.status === 'fulfilled',
      )
      .map((r) => r.value);

    // Build execution plan
    const plan = planBuilder.build(resolved);

    // Save plan
    await planStore.save(plan, conversationId, userMsg.id);

    // Update active entities in conversation context
    const newEntities = resolved.flatMap((r) =>
      r.resolvedEntities
        .filter((e) => e.confidence === 'exact' || e.confidence === 'high')
        .map((e) => ({
          entityType: 'purchaseOrderItem',
          entityValue: e.resolvedValue,
          entityLabel: e.resolvedLabel,
        })),
    );

    // Also track PO numbers from intents
    for (const r of resolved) {
      const poNumber = r.intent.extractedFields.poNumber;
      if (poNumber) {
        newEntities.push({
          entityType: 'purchaseOrder',
          entityValue: String(poNumber),
          entityLabel: `PO ${poNumber}`,
        });
      }
    }

    if (newEntities.length > 0) {
      const existing = context?.activeEntities ?? [];
      const merged = [...existing, ...newEntities];
      // Deduplicate by entityType+entityValue
      const seen = new Set<string>();
      const deduped = merged.filter((e) => {
        const key = `${e.entityType}:${e.entityValue}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      await conversationStore.updateActiveEntities(conversationId, deduped);
    }

    // If read-only (no approval needed), execute immediately
    let executionResult;
    if (!plan.requiresApproval) {
      executionResult = await executor.execute(plan, conversationId);
      await planStore.updateStatus(
        plan.planId,
        executionResult.overallSuccess ? 'executed' : 'failed',
        executionResult,
      );

      const resultSummary = executionResult.overallSuccess
        ? `Done: ${plan.summary}`
        : `Some operations failed: ${executionResult.results
            .filter((r) => !r.success)
            .map((r) => r.error)
            .join(', ')}`;

      await conversationStore.addMessage(
        conversationId,
        'agent',
        resultSummary,
        { plan, executionResult },
      );
    } else {
      await conversationStore.addMessage(
        conversationId,
        'agent',
        `Plan ready for approval: ${plan.summary}`,
        { plan },
      );
    }

    return c.json(
      {
        success: true as const,
        data: {
          conversationId,
          messageId: userMsg.id,
          parseResult,
          plan,
          executionResult,
        },
      },
      HttpStatusCodes.OK,
    );
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : 'Unknown error during parse';
    return c.json(
      { success: false as const, error: errorMsg },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});
