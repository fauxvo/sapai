import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    title: text('title'),
    sourceType: text('source_type').notNull().default('chat'),
    sourceId: text('source_id'),
    status: text('status').notNull().default('active'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('conversations_user_id_idx').on(table.userId)],
);

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    metadata: text('metadata'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('messages_conversation_id_idx').on(table.conversationId)],
);

export const executionPlans = sqliteTable('execution_plans', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  messageId: text('message_id').references(() => messages.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  plan: text('plan').notNull(),
  result: text('result'),
  approvedAt: text('approved_at'),
  executedAt: text('executed_at'),
  createdAt: text('created_at').notNull(),
});

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
    planId: text('plan_id').references(() => executionPlans.id, { onDelete: 'cascade' }),
    phase: text('phase').notNull(),
    input: text('input'),
    output: text('output'),
    userId: text('user_id'),
    durationMs: integer('duration_ms'),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    estimatedCost: real('estimated_cost'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('audit_log_conversation_id_idx').on(table.conversationId),
    index('audit_log_phase_idx').on(table.phase),
    index('audit_log_created_at_idx').on(table.createdAt),
  ],
);

export const conversationEntities = sqliteTable(
  'conversation_entities',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(),
    entityValue: text('entity_value').notNull(),
    entityLabel: text('entity_label'),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('conversation_entities_conversation_id_idx').on(table.conversationId),
  ],
);
