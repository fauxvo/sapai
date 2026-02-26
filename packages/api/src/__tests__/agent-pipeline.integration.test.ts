import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../db/schema.js';

// Mock modules that pull in bun:sqlite or require env vars at import time
vi.mock('../db/index.js', () => ({ db: null }));
vi.mock('../config/environment.js', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test-key',
    ANTHROPIC_MODEL: 'claude-sonnet-4-5-20250514',
    AGENT_CONFIDENCE_THRESHOLD: 0.6,
    SAP_BASE_URL: 'http://mock',
    SAP_CLIENT: '100',
    SAP_USERNAME: 'user',
    SAP_PASSWORD: 'pass',
  },
}));
vi.mock('../config/destination.js', () => ({
  getSapDestination: () => ({ url: 'http://mock' }),
}));
vi.mock('../utils/sap-health.js', () => ({
  checkSapHealth: vi.fn().mockResolvedValue({
    status: 'connected',
    authenticated: true,
    responseTimeMs: 10,
  }),
}));

import { AgentOrchestrator } from '../services/agent/AgentOrchestrator.js';
import { ConversationStore } from '../services/agent/ConversationStore.js';
import { IntentParser } from '../services/agent/IntentParser.js';
import { Validator } from '../services/agent/Validator.js';
import { EntityResolver } from '../services/agent/EntityResolver.js';
import { PlanBuilder } from '../services/agent/PlanBuilder.js';
import { PlanStore } from '../services/agent/PlanStore.js';
import { Executor } from '../services/agent/Executor.js';
import { AuditLogger } from '../services/agent/AuditLogger.js';
import { PipelineRunStore } from '../services/agent/PipelineRunStore.js';
import { createLogger } from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: './src/db/migrations' });
  // drizzle API is identical between bun-sqlite and better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db as any;
}

function createMockPOService() {
  return {
    getById: vi.fn().mockResolvedValue({
      success: true,
      data: { PurchaseOrder: '4500000001', Supplier: '17300001' },
    }),
    getAll: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getItems: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getItem: vi.fn().mockResolvedValue({
      success: true,
      data: { purchaseOrderItem: '00010' },
    }),
    updateItem: vi.fn().mockResolvedValue({ success: true, data: {} }),
    updateHeader: vi.fn().mockResolvedValue({ success: true, data: {} }),
    create: vi.fn().mockResolvedValue({ success: true, data: {} }),
    addItem: vi.fn().mockResolvedValue({ success: true, data: {} }),
    delete: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    deleteItem: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Agent Pipeline Integration (parse -> validate -> resolve -> plan -> execute)', () => {
  let orchestrator: AgentOrchestrator;
  let intentParser: IntentParser;
  let executor: Executor;
  let auditLogger: AuditLogger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;

  beforeEach(() => {
    db = createTestDb();

    const conversationStore = new ConversationStore(db);
    // IntentParser with a dummy Anthropic client -- we spy on `parse` below
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intentParser = new IntentParser({} as any);
    const validator = new Validator();
    const mockPOService = createMockPOService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityResolver = new EntityResolver(mockPOService as any);
    const planBuilder = new PlanBuilder();
    const planStore = new PlanStore(db);
    auditLogger = new AuditLogger(db);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executor = new Executor(mockPOService as any, auditLogger);
    const logger = createLogger('test');

    const pipelineRunStore = new PipelineRunStore(db);

    orchestrator = new AgentOrchestrator({
      conversationStore,
      intentParser,
      validator,
      entityResolver,
      planBuilder,
      planStore,
      executor,
      auditLogger,
      logger,
      pipelineRunStore,
    });
  });

  // -----------------------------------------------------------------------
  // 1. Happy path: read-only auto-execution
  // -----------------------------------------------------------------------
  it('auto-executes a read-only GET_PURCHASE_ORDER request', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
      ],
    });

    const result = await orchestrator.processMessage({
      message: 'Get purchase order 4500000001',
      userId: 'user-1',
    });

    expect(result.type).toBe('executed');
    if (result.type !== 'executed') throw new Error('unexpected type');

    expect(result.conversationId).toBeDefined();
    expect(result.messageId).toBeDefined();
    expect(result.result.overallSuccess).toBe(true);
    expect(result.result.results).toHaveLength(1);
    expect(result.result.results[0].intentId).toBe('GET_PURCHASE_ORDER');
    expect(result.result.results[0].success).toBe(true);
    expect(result.plan.requiresApproval).toBe(false);

    // Verify audit log was written (at least the parse phase)
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    expect(auditRows.length).toBeGreaterThanOrEqual(1);
    const parseEntry = auditRows.find((e) => e.phase === 'parse');
    expect(parseEntry).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // 2. Happy path: write operation requires approval
  // -----------------------------------------------------------------------
  it('returns plan_pending for a CREATE_PURCHASE_ORDER request', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'CREATE_PURCHASE_ORDER',
          confidence: 0.9,
          extractedFields: {
            companyCode: '1710',
            orderType: 'NB',
            supplier: '100',
            purchasingOrg: '1710',
            purchasingGroup: '001',
            currency: 'USD',
            items: [],
          },
        },
      ],
    });

    const result = await orchestrator.processMessage({
      message: 'Create a PO for vendor 100',
      userId: 'user-1',
    });

    expect(result.type).toBe('plan_pending');
    if (result.type !== 'plan_pending') throw new Error('unexpected type');

    expect(result.plan.requiresApproval).toBe(true);
    expect(result.plan.intents).toHaveLength(1);
    expect(result.plan.intents[0].intentId).toBe('CREATE_PURCHASE_ORDER');

    // Verify audit log for parse phase
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    const parseEntry = auditRows.find((e) => e.phase === 'parse');
    expect(parseEntry).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // 3. Multi-intent: both intents resolved and planned
  // -----------------------------------------------------------------------
  it('handles multi-intent messages with both intents planned', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
        {
          intentId: 'LIST_PURCHASE_ORDERS',
          confidence: 0.9,
          extractedFields: {},
        },
      ],
    });

    const result = await orchestrator.processMessage({
      message: 'Get PO 4500000001 and list all POs',
      userId: 'user-1',
    });

    // Both intents are read-only (confirmation: 'never'), so auto-execute
    expect(result.type).toBe('executed');
    if (result.type !== 'executed') throw new Error('unexpected type');

    expect(result.plan.intents).toHaveLength(2);
    expect(result.result.results).toHaveLength(2);
    expect(result.result.overallSuccess).toBe(true);

    const intentIds = result.result.results.map((r) => r.intentId);
    expect(intentIds).toContain('GET_PURCHASE_ORDER');
    expect(intentIds).toContain('LIST_PURCHASE_ORDERS');

    // Audit log should have at least the parse entry
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    expect(auditRows.length).toBeGreaterThanOrEqual(1);
  });

  // -----------------------------------------------------------------------
  // 4. Clarification flow: missing required fields
  // -----------------------------------------------------------------------
  it('returns clarification when required fields are missing', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'UPDATE_PO_ITEM',
          confidence: 0.9,
          extractedFields: { poNumber: '4500000001' },
          missingRequiredFields: ['itemIdentifier'],
        },
      ],
    });

    const result = await orchestrator.processMessage({
      message: 'Update the quantity on PO 4500000001',
      userId: 'user-1',
    });

    expect(result.type).toBe('clarification');
    if (result.type !== 'clarification') throw new Error('unexpected type');

    expect(result.clarification.missingFields).toContain('itemIdentifier');
    expect(result.clarification.message).toBeTruthy();

    // Audit log should still record the parse phase
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    const parseEntry = auditRows.find((e) => e.phase === 'parse');
    expect(parseEntry).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // 5. Low confidence: ambiguous message
  // -----------------------------------------------------------------------
  it('returns clarification when confidence is below threshold', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.3,
          // Include poNumber so validation passes and the confidence check
          // is actually reached (validation runs before confidence check)
          extractedFields: { poNumber: '4500000001' },
        },
      ],
    });

    const result = await orchestrator.processMessage({
      message: 'something about orders maybe',
      userId: 'user-1',
    });

    expect(result.type).toBe('clarification');
    if (result.type !== 'clarification') throw new Error('unexpected type');

    expect(result.clarification.message).toContain('GET_PURCHASE_ORDER');
    expect(result.clarification.message).toMatch(/rephrase/i);

    // Audit log for parse
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    expect(auditRows.some((e) => e.phase === 'parse')).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 6. SAP error: service throws 403 Forbidden
  // -----------------------------------------------------------------------
  it('propagates SAP 403 error in execution result', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
      ],
    });

    // Override the executor's internal poService.getById to throw
    const executorPOService = (
      executor as unknown as {
        poService: ReturnType<typeof createMockPOService>;
      }
    ).poService;
    executorPOService.getById.mockRejectedValue(new Error('Forbidden'));

    const result = await orchestrator.processMessage({
      message: 'Get purchase order 4500000001',
      userId: 'user-1',
    });

    // The executor catches errors and wraps them; the orchestrator still
    // returns an 'executed' result with overallSuccess: false
    expect(result.type).toBe('executed');
    if (result.type !== 'executed') throw new Error('unexpected type');

    expect(result.result.overallSuccess).toBe(false);
    expect(result.result.results[0].success).toBe(false);
    expect(result.result.results[0].error).toBe('Forbidden');

    // Audit log should contain an error-phase entry from the executor
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    expect(auditRows.some((e) => e.phase === 'error')).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 7. SAP timeout: service throws timeout error
  // -----------------------------------------------------------------------
  it('handles SAP timeout error gracefully', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
      ],
    });

    const executorPOService = (
      executor as unknown as {
        poService: ReturnType<typeof createMockPOService>;
      }
    ).poService;
    executorPOService.getById.mockRejectedValue(
      new Error('Request timeout after 30000ms'),
    );

    const result = await orchestrator.processMessage({
      message: 'Get purchase order 4500000001',
      userId: 'user-1',
    });

    expect(result.type).toBe('executed');
    if (result.type !== 'executed') throw new Error('unexpected type');

    expect(result.result.overallSuccess).toBe(false);
    expect(result.result.results[0].success).toBe(false);
    expect(result.result.results[0].error).toContain('timeout');

    // Verify the pipeline didn't crash -- we have audit entries
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    expect(auditRows.length).toBeGreaterThanOrEqual(1);
  });

  // -----------------------------------------------------------------------
  // 8. Malformed LLM response: no intents returned
  // -----------------------------------------------------------------------
  it('returns clarification when IntentParser returns no intents', async () => {
    vi.spyOn(intentParser, 'parse').mockResolvedValue({
      intents: [],
      unhandledContent: 'Failed to parse intent',
    });

    const result = await orchestrator.processMessage({
      message: 'asdjkf random gibberish',
      userId: 'user-1',
    });

    expect(result.type).toBe('clarification');
    if (result.type !== 'clarification') throw new Error('unexpected type');

    expect(result.clarification.missingFields).toEqual([]);
    expect(result.parseResult.intents).toHaveLength(0);

    // Audit log for parse
    const auditRows = await auditLogger.getEntries({
      conversationId: result.conversationId,
    });
    expect(auditRows.some((e) => e.phase === 'parse')).toBe(true);
  });
});
