import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../../db/schema.js';

// Mock the db module to prevent bun:sqlite import in Node/vitest
vi.mock('../../db/index.js', () => ({ db: null }));

import { PipelineRunStore } from './PipelineRunStore.js';
import { ConversationStore } from './ConversationStore.js';

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: './src/db/migrations' });
  // Drizzle API is identical between bun-sqlite and better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db as any;
}

describe('PipelineRunStore', () => {
  let store: PipelineRunStore;

  beforeEach(() => {
    const db = createTestDb();
    store = new PipelineRunStore(db);
  });

  it('creates a run with 5 pending stages', async () => {
    const result = await store.createRun({
      inputMessage: 'Show me PO 4500000001',
    });

    expect(result.run).toBeDefined();
    expect(result.run.id).toBeDefined();
    expect(result.run.inputMessage).toBe('Show me PO 4500000001');
    expect(result.run.status).toBe('running');
    expect(result.run.mode).toBe('auto');

    expect(result.stages).toHaveLength(5);
    expect(result.stages.map((s) => s.stage)).toEqual([
      'parsing',
      'validating',
      'resolving',
      'planning',
      'executing',
    ]);
    for (const stage of result.stages) {
      expect(stage.status).toBe('pending');
      expect(stage.runId).toBe(result.run.id);
    }
  });

  it('creates a run with step mode', async () => {
    const result = await store.createRun({
      inputMessage: 'test',
      mode: 'step',
    });

    expect(result.run.mode).toBe('step');
  });

  it('creates a run with optional params', async () => {
    // Need a real conversation for the FK constraint
    const db = createTestDb();
    const convStore = new ConversationStore(db);
    const localStore = new PipelineRunStore(db);

    const conv = await convStore.createConversation({ title: 'test' });

    const result = await localStore.createRun({
      inputMessage: 'test',
      conversationId: conv.id,
      userId: 'user-456',
    });

    expect(result.run.conversationId).toBe(conv.id);
    expect(result.run.userId).toBe('user-456');
  });

  it('gets run by id', async () => {
    const created = await store.createRun({
      inputMessage: 'test',
    });

    const fetched = await store.getById(created.run.id);
    expect(fetched).toBeDefined();
    expect(fetched!.id).toBe(created.run.id);
    expect(fetched!.inputMessage).toBe('test');
  });

  it('returns undefined for non-existent run', async () => {
    const result = await store.getById('non-existent');
    expect(result).toBeUndefined();
  });

  it('gets run with stages in order', async () => {
    const created = await store.createRun({
      inputMessage: 'test',
    });

    const result = await store.getRunWithStages(created.run.id);
    expect(result).toBeDefined();
    expect(result!.run.id).toBe(created.run.id);
    expect(result!.stages).toHaveLength(5);

    // Verify ordering
    for (let i = 0; i < result!.stages.length; i++) {
      expect(result!.stages[i].order).toBe(i);
    }
  });

  it('returns undefined for non-existent run with stages', async () => {
    const result = await store.getRunWithStages('non-existent');
    expect(result).toBeUndefined();
  });

  it('lists runs ordered by createdAt DESC', async () => {
    await store.createRun({ inputMessage: 'first' });
    // Slight delay to ensure different timestamps
    await new Promise((r) => setTimeout(r, 10));
    await store.createRun({ inputMessage: 'second' });

    const runs = await store.listRuns();
    expect(runs).toHaveLength(2);
    expect(runs[0].inputMessage).toBe('second');
    expect(runs[1].inputMessage).toBe('first');
  });

  it('lists runs with status filter', async () => {
    const run1 = await store.createRun({ inputMessage: 'run1' });
    await store.createRun({ inputMessage: 'run2' });

    await store.updateRun(run1.run.id, { status: 'completed' });

    const completed = await store.listRuns({ status: 'completed' });
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe(run1.run.id);

    const running = await store.listRuns({ status: 'running' });
    expect(running).toHaveLength(1);
  });

  it('lists runs with limit and offset', async () => {
    for (let i = 0; i < 5; i++) {
      await store.createRun({ inputMessage: `run-${i}` });
    }

    const page1 = await store.listRuns({ limit: 2, offset: 0 });
    expect(page1).toHaveLength(2);

    const page2 = await store.listRuns({ limit: 2, offset: 2 });
    expect(page2).toHaveLength(2);

    const page3 = await store.listRuns({ limit: 2, offset: 4 });
    expect(page3).toHaveLength(1);
  });

  it('updates run fields', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const runId = created.run.id;

    await store.updateRun(runId, {
      status: 'completed',
      currentStage: 'executing',
      error: null,
      completedAt: new Date().toISOString(),
      durationMs: 1234,
    });

    const fetched = await store.getById(runId);
    expect(fetched!.status).toBe('completed');
    expect(fetched!.currentStage).toBe('executing');
    expect(fetched!.durationMs).toBe(1234);
  });

  it('updates run result as JSON', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const runId = created.run.id;

    await store.updateRun(runId, {
      result: { planId: 'plan-1', success: true },
    });

    const fetched = await store.getById(runId);
    expect(fetched!.result).toEqual({ planId: 'plan-1', success: true });
  });

  it('updates stage fields', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stageId = created.stages[0].id;

    await store.updateStage(stageId, {
      status: 'running',
      startedAt: new Date().toISOString(),
      detail: 'Processing...',
    });

    const fetched = await store.getStage(created.run.id, 'parsing');
    expect(fetched).toBeDefined();
    expect(fetched!.status).toBe('running');
    expect(fetched!.detail).toBe('Processing...');
  });

  it('updates stage JSON fields', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stageId = created.stages[0].id;

    await store.updateStage(stageId, {
      output: { intents: [{ id: 'test' }] },
      costEstimate: {
        inputTokens: 100,
        outputTokens: 50,
        totalCost: 0.01,
        model: 'claude-3-haiku',
      },
      progressItems: [
        {
          item: 'intent-1',
          detail: 'parsed',
          status: 'done',
        },
      ],
    });

    const fetched = await store.getStage(created.run.id, 'parsing');
    expect(fetched!.output).toEqual({ intents: [{ id: 'test' }] });
    expect(fetched!.costEstimate).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      totalCost: 0.01,
      model: 'claude-3-haiku',
    });
    expect(fetched!.progressItems).toHaveLength(1);
    expect(fetched!.progressItems[0].item).toBe('intent-1');
  });

  it('appends progress items (new item)', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stageId = created.stages[0].id;

    await store.appendProgressItem(stageId, {
      item: 'entity-1',
      detail: 'resolving...',
      status: 'running',
    });

    const fetched = await store.getStage(created.run.id, 'parsing');
    expect(fetched!.progressItems).toHaveLength(1);
    expect(fetched!.progressItems[0].item).toBe('entity-1');
    expect(fetched!.progressItems[0].status).toBe('running');
  });

  it('appends progress items (upsert existing)', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stageId = created.stages[0].id;

    // Add initial item
    await store.appendProgressItem(stageId, {
      item: 'entity-1',
      detail: 'resolving...',
      status: 'running',
    });

    // Update same item
    await store.appendProgressItem(stageId, {
      item: 'entity-1',
      detail: 'resolved!',
      status: 'done',
    });

    const fetched = await store.getStage(created.run.id, 'parsing');
    expect(fetched!.progressItems).toHaveLength(1);
    expect(fetched!.progressItems[0].detail).toBe('resolved!');
    expect(fetched!.progressItems[0].status).toBe('done');
  });

  it('appends multiple distinct progress items', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stageId = created.stages[0].id;

    await store.appendProgressItem(stageId, {
      item: 'entity-1',
      detail: 'done',
      status: 'done',
    });
    await store.appendProgressItem(stageId, {
      item: 'entity-2',
      detail: 'done',
      status: 'done',
    });

    const fetched = await store.getStage(created.run.id, 'parsing');
    expect(fetched!.progressItems).toHaveLength(2);
  });

  it('gets stage by run id and stage name', async () => {
    const created = await store.createRun({ inputMessage: 'test' });

    const parsing = await store.getStage(created.run.id, 'parsing');
    expect(parsing).toBeDefined();
    expect(parsing!.stage).toBe('parsing');
    expect(parsing!.order).toBe(0);

    const executing = await store.getStage(created.run.id, 'executing');
    expect(executing).toBeDefined();
    expect(executing!.stage).toBe('executing');
    expect(executing!.order).toBe(4);
  });

  it('returns undefined for non-existent stage', async () => {
    const result = await store.getStage('non-existent', 'parsing');
    expect(result).toBeUndefined();
  });

  it('finds stale runs - fresh runs are not stale', async () => {
    await store.createRun({ inputMessage: 'stale' });

    // Since we can't easily backdate startedAt, test that a fresh run
    // is NOT found as stale with a 5-minute threshold
    const staleRuns = await store.findStaleRuns(5 * 60 * 1000);
    // The run was just created so its startedAt is recent
    expect(staleRuns).toHaveLength(0);
  });

  it('finds stale runs with generous threshold', async () => {
    const created = await store.createRun({ inputMessage: 'stale' });
    const runId = created.run.id;

    // Use a very generous threshold (far into the future) so that all
    // running runs are considered "stale"
    // findStaleRuns(olderThanMs) looks for: startedAt < (now - olderThanMs)
    // So with a negative effective threshold (very large negative olderThanMs),
    // we need a different approach. Instead, we'll ensure the run appears
    // when the threshold makes any startedAt "old enough".
    //
    // Let's wait a tiny bit and use a 1ms threshold to catch the run.
    await new Promise((r) => setTimeout(r, 50));
    const staleRuns = await store.findStaleRuns(10);
    expect(staleRuns.length).toBeGreaterThanOrEqual(1);
    expect(staleRuns.some((r) => r.id === runId)).toBe(true);
  });

  it('does not find completed runs as stale', async () => {
    const created = await store.createRun({ inputMessage: 'done' });
    await store.updateRun(created.run.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    const staleRuns = await store.findStaleRuns(0);
    expect(staleRuns.some((r) => r.id === created.run.id)).toBe(false);
  });

  it('empty progressItems returns empty array', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stage = await store.getStage(created.run.id, 'parsing');
    expect(stage!.progressItems).toEqual([]);
  });

  it('null JSON fields parse as null', async () => {
    const created = await store.createRun({ inputMessage: 'test' });
    const stage = await store.getStage(created.run.id, 'parsing');
    expect(stage!.input).toBeNull();
    expect(stage!.output).toBeNull();
    expect(stage!.costEstimate).toBeNull();
  });
});
