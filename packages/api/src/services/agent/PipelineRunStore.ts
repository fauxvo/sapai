import { eq, desc, and, lt, isNull, inArray } from 'drizzle-orm';
import { db as defaultDb, type DB } from '../../db/index.js';
import { pipelineRuns, pipelineStages } from '../../db/schema.js';
import { createLogger } from '../../utils/logger.js';
import type {
  PipelineRun,
  PipelineStageRecord,
  PipelineProgressItem,
  PipelineRunCostEstimate,
  PipelineStageName,
  PipelineRunStatus,
  PipelineStageStatus,
  RunMode,
  RunWithStages,
} from '@sapai/shared';

const log = createLogger('PipelineRunStore');

const STAGE_ORDER: PipelineStageName[] = [
  'parsing',
  'validating',
  'resolving',
  'planning',
  'executing',
];

export class PipelineRunStore {
  constructor(private readonly db: DB = defaultDb) {}

  async createRun(params: {
    inputMessage: string;
    mode?: RunMode;
    conversationId?: string;
    userId?: string;
  }): Promise<RunWithStages> {
    const now = new Date().toISOString();
    const runId = crypto.randomUUID();
    const mode = params.mode ?? 'auto';

    log.debug('createRun', { runId, mode });

    const stageRows: Array<{
      id: string;
      runId: string;
      stage: string;
      status: string;
      order: number;
      startedAt: string | null;
      completedAt: string | null;
      durationMs: number | null;
      detail: string | null;
      input: string | null;
      output: string | null;
      progressItems: string | null;
      error: string | null;
      costEstimate: string | null;
    }> = STAGE_ORDER.map((stage, i) => ({
      id: crypto.randomUUID(),
      runId,
      stage,
      status: 'pending',
      order: i,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      detail: null,
      input: null,
      output: null,
      progressItems: null,
      error: null,
      costEstimate: null,
    }));

    // bun-sqlite transactions are synchronous, but await defensively
    await this.db.transaction((tx) => {
      tx.insert(pipelineRuns)
        .values({
          id: runId,
          conversationId: params.conversationId ?? null,
          inputMessage: params.inputMessage,
          status: 'running',
          mode,
          currentStage: null,
          result: null,
          error: null,
          userId: params.userId ?? null,
          startedAt: now,
          completedAt: null,
          createdAt: now,
          durationMs: null,
        })
        .run();

      for (const stageRow of stageRows) {
        tx.insert(pipelineStages).values(stageRow).run();
      }
    });

    log.info('Run created', { runId, stages: stageRows.length });

    const run = this.toRun({
      id: runId,
      conversationId: params.conversationId ?? null,
      inputMessage: params.inputMessage,
      status: 'running',
      mode,
      currentStage: null,
      result: null,
      error: null,
      userId: params.userId ?? null,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      durationMs: null,
    });

    const stages = stageRows.map((r) =>
      this.toStage(r as typeof pipelineStages.$inferSelect),
    );

    return { run, stages };
  }

  async getById(id: string): Promise<PipelineRun | undefined> {
    log.debug('getById', { id });
    const rows = await this.db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.id, id))
      .limit(1);

    if (rows.length === 0) return undefined;
    return this.toRun(rows[0]);
  }

  async getRunWithStages(id: string): Promise<RunWithStages | undefined> {
    log.debug('getRunWithStages', { id });
    const runRows = await this.db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.id, id))
      .limit(1);

    if (runRows.length === 0) return undefined;

    const stageRows = await this.db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.runId, id))
      .orderBy(pipelineStages.order);

    return {
      run: this.toRun(runRows[0]),
      stages: stageRows.map((r) => this.toStage(r)),
    };
  }

  async listRuns(filters?: {
    status?: PipelineRunStatus;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PipelineRun[]> {
    log.debug('listRuns', { filters });
    const conditions = [];
    if (filters?.status)
      conditions.push(eq(pipelineRuns.status, filters.status));
    if (filters?.userId)
      conditions.push(eq(pipelineRuns.userId, filters.userId));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select()
      .from(pipelineRuns)
      .where(whereClause)
      .orderBy(desc(pipelineRuns.createdAt))
      .limit(filters?.limit ?? 50)
      .offset(filters?.offset ?? 0);

    return rows.map((r) => this.toRun(r));
  }

  async updateRun(
    id: string,
    updates: Partial<{
      status: PipelineRunStatus;
      currentStage: PipelineStageName | null;
      result: unknown;
      error: string | null;
      completedAt: string | null;
      durationMs: number | null;
      conversationId: string | null;
    }>,
  ): Promise<void> {
    log.debug('updateRun', { id, updates: Object.keys(updates) });
    const setValues: Record<string, unknown> = {};
    if (updates.status !== undefined) setValues.status = updates.status;
    if (updates.currentStage !== undefined)
      setValues.currentStage = updates.currentStage;
    if (updates.result !== undefined)
      setValues.result =
        updates.result != null ? JSON.stringify(updates.result) : null;
    if (updates.error !== undefined) setValues.error = updates.error;
    if (updates.completedAt !== undefined)
      setValues.completedAt = updates.completedAt;
    if (updates.durationMs !== undefined)
      setValues.durationMs = updates.durationMs;
    if (updates.conversationId !== undefined)
      setValues.conversationId = updates.conversationId;

    if (Object.keys(setValues).length === 0) return;

    await this.db
      .update(pipelineRuns)
      .set(setValues)
      .where(eq(pipelineRuns.id, id));
  }

  async updateStage(
    stageId: string,
    updates: Partial<{
      status: PipelineStageStatus;
      startedAt: string | null;
      completedAt: string | null;
      durationMs: number | null;
      detail: string | null;
      input: unknown;
      output: unknown;
      progressItems: PipelineProgressItem[];
      error: string | null;
      costEstimate: PipelineRunCostEstimate | null;
    }>,
  ): Promise<void> {
    log.debug('updateStage', { stageId, updates: Object.keys(updates) });
    const setValues: Record<string, unknown> = {};
    if (updates.status !== undefined) setValues.status = updates.status;
    if (updates.startedAt !== undefined)
      setValues.startedAt = updates.startedAt;
    if (updates.completedAt !== undefined)
      setValues.completedAt = updates.completedAt;
    if (updates.durationMs !== undefined)
      setValues.durationMs = updates.durationMs;
    if (updates.detail !== undefined) setValues.detail = updates.detail;
    if (updates.input !== undefined)
      setValues.input =
        updates.input != null ? JSON.stringify(updates.input) : null;
    if (updates.output !== undefined)
      setValues.output =
        updates.output != null ? JSON.stringify(updates.output) : null;
    if (updates.progressItems !== undefined)
      setValues.progressItems =
        updates.progressItems != null
          ? JSON.stringify(updates.progressItems)
          : null;
    if (updates.error !== undefined) setValues.error = updates.error;
    if (updates.costEstimate !== undefined)
      setValues.costEstimate =
        updates.costEstimate != null
          ? JSON.stringify(updates.costEstimate)
          : null;

    if (Object.keys(setValues).length === 0) return;

    await this.db
      .update(pipelineStages)
      .set(setValues)
      .where(eq(pipelineStages.id, stageId));
  }

  async appendProgressItem(
    stageId: string,
    item: PipelineProgressItem,
  ): Promise<void> {
    log.debug('appendProgressItem', { stageId, item: item.item });
    // bun-sqlite transactions are synchronous, but await defensively
    await this.db.transaction((tx) => {
      const rows = tx
        .select({ progressItems: pipelineStages.progressItems })
        .from(pipelineStages)
        .where(eq(pipelineStages.id, stageId))
        .limit(1)
        .all();

      if (rows.length === 0) return;

      const existing: PipelineProgressItem[] = rows[0].progressItems
        ? JSON.parse(rows[0].progressItems)
        : [];

      // Upsert: replace if same item key, else append
      const idx = existing.findIndex((e) => e.item === item.item);
      if (idx >= 0) {
        existing[idx] = item;
      } else {
        existing.push(item);
      }

      tx.update(pipelineStages)
        .set({ progressItems: JSON.stringify(existing) })
        .where(eq(pipelineStages.id, stageId))
        .run();
    });
  }

  async getStage(
    runId: string,
    stageName: PipelineStageName,
  ): Promise<PipelineStageRecord | undefined> {
    log.debug('getStage', { runId, stageName });
    const rows = await this.db
      .select()
      .from(pipelineStages)
      .where(
        and(
          eq(pipelineStages.runId, runId),
          eq(pipelineStages.stage, stageName),
        ),
      )
      .limit(1);

    if (rows.length === 0) return undefined;
    return this.toStage(rows[0]);
  }

  async findStaleRuns(olderThanMs: number): Promise<PipelineRun[]> {
    const cutoff = new Date(Date.now() - olderThanMs).toISOString();
    log.debug('findStaleRuns', { cutoff });

    const activeStatuses: string[] = [
      'running',
      'awaiting_approval',
      'paused_at_parsing',
      'paused_at_validating',
      'paused_at_resolving',
      'paused_at_planning',
      'paused_at_executing',
    ];

    const staleRows = await this.db
      .select()
      .from(pipelineRuns)
      .where(
        and(
          lt(pipelineRuns.startedAt, cutoff),
          inArray(pipelineRuns.status, activeStatuses),
          isNull(pipelineRuns.completedAt),
        ),
      );

    return staleRows.map((r) => this.toRun(r));
  }

  private toRun(row: typeof pipelineRuns.$inferSelect): PipelineRun {
    return {
      id: row.id,
      conversationId: row.conversationId,
      inputMessage: row.inputMessage,
      status: row.status as PipelineRun['status'],
      mode: row.mode as PipelineRun['mode'],
      currentStage: row.currentStage as PipelineRun['currentStage'],
      result: row.result ? JSON.parse(row.result) : null,
      error: row.error,
      userId: row.userId,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      durationMs: row.durationMs,
    };
  }

  private toStage(
    row: typeof pipelineStages.$inferSelect,
  ): PipelineStageRecord {
    return {
      id: row.id,
      runId: row.runId,
      stage: row.stage as PipelineStageRecord['stage'],
      status: row.status as PipelineStageRecord['status'],
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      durationMs: row.durationMs,
      detail: row.detail,
      input: row.input ? JSON.parse(row.input) : null,
      output: row.output ? JSON.parse(row.output) : null,
      progressItems: row.progressItems ? JSON.parse(row.progressItems) : [],
      error: row.error,
      costEstimate: row.costEstimate ? JSON.parse(row.costEstimate) : null,
      order: row.order,
    };
  }
}
