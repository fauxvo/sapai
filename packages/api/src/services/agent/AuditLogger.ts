import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db as defaultDb, type DB } from '../../db/index.js';
import { auditLog } from '../../db/schema.js';
import type { AuditLogEntry, AuditPhase } from '@sapai/shared';

const MAX_FIELD_BYTES = 10240;

export class AuditLogger {
  constructor(private readonly db: DB = defaultDb) {}

  async log(entry: {
    conversationId?: string;
    planId?: string;
    phase: AuditPhase;
    input: unknown;
    output: unknown;
    userId?: string;
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
  }): Promise<AuditLogEntry> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await this.db.insert(auditLog).values({
      id,
      conversationId: entry.conversationId,
      planId: entry.planId,
      phase: entry.phase,
      input: entry.input != null
        ? this.truncateField(entry.input, MAX_FIELD_BYTES)
        : null,
      output: entry.output != null
        ? this.truncateField(entry.output, MAX_FIELD_BYTES)
        : null,
      userId: entry.userId,
      durationMs: entry.durationMs,
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      estimatedCost: entry.estimatedCost,
      createdAt: now,
    });

    return {
      id,
      timestamp: now,
      conversationId: entry.conversationId,
      planId: entry.planId,
      phase: entry.phase,
      input: entry.input,
      output: entry.output,
      userId: entry.userId,
      durationMs: entry.durationMs,
    };
  }

  async getEntries(filters?: {
    conversationId?: string;
    phase?: AuditPhase;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    const conditions = [];

    if (filters?.conversationId) {
      conditions.push(eq(auditLog.conversationId, filters.conversationId));
    }
    if (filters?.phase) {
      conditions.push(eq(auditLog.phase, filters.phase));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLog.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLog.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select()
      .from(auditLog)
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0);

    return rows.map((r) => ({
      id: r.id,
      timestamp: r.createdAt,
      conversationId: r.conversationId ?? undefined,
      planId: r.planId ?? undefined,
      phase: r.phase as AuditPhase,
      input: r.input ? JSON.parse(r.input) : null,
      output: r.output ? JSON.parse(r.output) : null,
      userId: r.userId ?? undefined,
      durationMs: r.durationMs ?? 0,
    }));
  }

  private truncateField(value: unknown, maxBytes: number): string {
    const serialized = JSON.stringify(value);
    if (serialized.length <= maxBytes) return serialized;
    return serialized.slice(0, maxBytes - 15) + '...[truncated]"';
  }
}
