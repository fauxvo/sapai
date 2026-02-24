import { eq } from 'drizzle-orm';
import { db as defaultDb, type DB } from '../../db/index.js';
import { executionPlans } from '../../db/schema.js';
import type { ExecutionPlan, ExecutionResult, PlanStatus } from '@sapai/shared';

export class PlanStore {
  constructor(private readonly db: DB = defaultDb) {}

  async save(
    plan: ExecutionPlan,
    conversationId: string,
    messageId?: string,
  ): Promise<void> {
    await this.db.insert(executionPlans).values({
      id: plan.planId,
      conversationId,
      messageId,
      status: 'pending',
      plan: JSON.stringify(plan),
      createdAt: new Date().toISOString(),
    });
  }

  async getById(planId: string): Promise<
    | {
        plan: ExecutionPlan;
        status: PlanStatus;
        result?: ExecutionResult;
        conversationId: string;
      }
    | undefined
  > {
    const rows = await this.db
      .select()
      .from(executionPlans)
      .where(eq(executionPlans.id, planId))
      .limit(1);

    if (rows.length === 0) return undefined;

    const row = rows[0];
    return {
      plan: JSON.parse(row.plan) as ExecutionPlan,
      status: row.status as PlanStatus,
      result: row.result
        ? (JSON.parse(row.result) as ExecutionResult)
        : undefined,
      conversationId: row.conversationId,
    };
  }

  async updateStatus(
    planId: string,
    status: PlanStatus,
    result?: ExecutionResult,
  ): Promise<void> {
    const now = new Date().toISOString();

    const update: Record<string, unknown> = { status };

    if (status === 'approved') {
      update.approvedAt = now;
    }
    if (status === 'executed' || status === 'failed') {
      update.executedAt = now;
    }
    if (result) {
      update.result = JSON.stringify(result);
    }

    await this.db
      .update(executionPlans)
      .set(update)
      .where(eq(executionPlans.id, planId));
  }
}
