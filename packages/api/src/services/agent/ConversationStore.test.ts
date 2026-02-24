import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../../db/schema.js';
import type { ExecutionPlan } from '@sapai/shared';

// Mock the db module to prevent bun:sqlite import in Node/vitest
vi.mock('../../db/index.js', () => ({ db: null }));

import { ConversationStore } from './ConversationStore.js';
import { AuditLogger } from './AuditLogger.js';
import { PlanStore } from './PlanStore.js';

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: './src/db/migrations' });
  // Drizzle API is identical between bun-sqlite and better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db as any;
}

describe('ConversationStore', () => {
  let store: ConversationStore;

  beforeEach(() => {
    const db = createTestDb();
    store = new ConversationStore(db);
  });

  it('creates and retrieves a conversation', async () => {
    const conv = await store.createConversation({ title: 'Test Chat' });
    expect(conv.id).toBeDefined();
    expect(conv.title).toBe('Test Chat');
    expect(conv.sourceType).toBe('chat');
    expect(conv.status).toBe('active');

    const fetched = await store.getConversation(conv.id);
    expect(fetched).toBeDefined();
    expect(fetched!.id).toBe(conv.id);
  });

  it('lists conversations', async () => {
    await store.createConversation({ title: 'A' });
    await store.createConversation({ title: 'B' });

    const all = await store.listConversations();
    expect(all).toHaveLength(2);
  });

  it('filters conversations by status', async () => {
    await store.createConversation({ title: 'Active' });
    const active = await store.listConversations({ status: 'active' });
    expect(active).toHaveLength(1);

    const archived = await store.listConversations({ status: 'archived' });
    expect(archived).toHaveLength(0);
  });

  it('adds and retrieves messages', async () => {
    const conv = await store.createConversation();
    const msg = await store.addMessage(conv.id, 'user', 'Hello');
    expect(msg.id).toBeDefined();
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello');

    const msgs = await store.getMessages(conv.id);
    expect(msgs).toHaveLength(1);
    expect(msgs[0].content).toBe('Hello');
  });

  it('stores message metadata as JSON', async () => {
    const conv = await store.createConversation();
    await store.addMessage(conv.id, 'agent', 'Result', {
      intentId: 'GET_PURCHASE_ORDER',
    });

    const msgs = await store.getMessages(conv.id);
    expect(msgs[0].metadata).toEqual({ intentId: 'GET_PURCHASE_ORDER' });
  });

  it('manages active entities', async () => {
    const conv = await store.createConversation();

    await store.updateActiveEntities(conv.id, [
      {
        entityType: 'purchaseOrder',
        entityValue: '4500000001',
        entityLabel: 'PO 4500000001',
      },
    ]);

    const entities = await store.getActiveEntities(conv.id);
    expect(entities).toHaveLength(1);
    expect(entities[0].entityValue).toBe('4500000001');

    // Replacing entities
    await store.updateActiveEntities(conv.id, [
      { entityType: 'supplier', entityValue: 'ACME', entityLabel: 'ACME Corp' },
    ]);

    const updated = await store.getActiveEntities(conv.id);
    expect(updated).toHaveLength(1);
    expect(updated[0].entityType).toBe('supplier');
  });

  it('returns full conversation context', async () => {
    const conv = await store.createConversation();
    await store.addMessage(conv.id, 'user', 'Show PO');
    await store.addMessage(conv.id, 'agent', 'Here it is');
    await store.updateActiveEntities(conv.id, [
      { entityType: 'purchaseOrder', entityValue: '4500000001' },
    ]);

    const ctx = await store.getConversationContext(conv.id);
    expect(ctx).toBeDefined();
    expect(ctx!.messages).toHaveLength(2);
    expect(ctx!.activeEntities).toHaveLength(1);
  });

  it('returns undefined for non-existent conversation', async () => {
    const result = await store.getConversation('non-existent');
    expect(result).toBeUndefined();
  });
});

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    const db = createTestDb();
    logger = new AuditLogger(db);
  });

  it('logs an entry and retrieves it', async () => {
    const entry = await logger.log({
      phase: 'parse',
      input: { message: 'test' },
      output: { intents: [] },
      durationMs: 150,
    });

    expect(entry.id).toBeDefined();
    expect(entry.phase).toBe('parse');

    const entries = await logger.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].input).toEqual({ message: 'test' });
  });

  it('filters by phase', async () => {
    await logger.log({
      phase: 'parse',
      input: null,
      output: null,
      durationMs: 10,
    });
    await logger.log({
      phase: 'execute',
      input: null,
      output: null,
      durationMs: 20,
    });

    const parseOnly = await logger.getEntries({ phase: 'parse' });
    expect(parseOnly).toHaveLength(1);
    expect(parseOnly[0].phase).toBe('parse');
  });
});

describe('PlanStore', () => {
  let planStore: PlanStore;
  let convStore: ConversationStore;

  beforeEach(() => {
    const db = createTestDb();
    planStore = new PlanStore(db);
    convStore = new ConversationStore(db);
  });

  it('saves and retrieves a plan', async () => {
    const conv = await convStore.createConversation();
    const plan: ExecutionPlan = {
      planId: 'plan_123',
      createdAt: new Date().toISOString(),
      intents: [],
      requiresApproval: true,
      summary: 'Test plan',
    };

    await planStore.save(plan, conv.id);
    const result = await planStore.getById('plan_123');

    expect(result).toBeDefined();
    expect(result!.plan.summary).toBe('Test plan');
    expect(result!.status).toBe('pending');
  });

  it('updates plan status', async () => {
    const conv = await convStore.createConversation();
    const plan: ExecutionPlan = {
      planId: 'plan_456',
      createdAt: new Date().toISOString(),
      intents: [],
      requiresApproval: true,
      summary: 'To approve',
    };

    await planStore.save(plan, conv.id);
    await planStore.updateStatus('plan_456', 'approved');

    const result = await planStore.getById('plan_456');
    expect(result!.status).toBe('approved');
  });

  it('returns undefined for non-existent plan', async () => {
    const result = await planStore.getById('non-existent');
    expect(result).toBeUndefined();
  });
});
