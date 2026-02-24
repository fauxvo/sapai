import { eq, desc } from 'drizzle-orm';
import { db as defaultDb, type DB } from '../../db/index.js';
import {
  conversations,
  messages,
  conversationEntities,
} from '../../db/schema.js';
import type {
  AgentConversation,
  AgentMessage,
  AgentConversationContext,
  ActiveEntity,
  SourceType,
  ConversationStatus,
  MessageRole,
} from '@sapai/shared';

export class ConversationStore {
  constructor(private readonly db: DB = defaultDb) {}

  async createConversation(opts?: {
    title?: string;
    sourceType?: SourceType;
    sourceId?: string;
  }): Promise<AgentConversation> {
    const now = new Date().toISOString();
    const conversation: AgentConversation = {
      id: crypto.randomUUID(),
      title: opts?.title ?? null,
      sourceType: opts?.sourceType ?? 'chat',
      sourceId: opts?.sourceId ?? null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(conversations).values({
      id: conversation.id,
      title: conversation.title,
      sourceType: conversation.sourceType,
      sourceId: conversation.sourceId,
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });

    return conversation;
  }

  async getConversation(id: string): Promise<AgentConversation | undefined> {
    const rows = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (rows.length === 0) return undefined;
    return this.mapConversation(rows[0]);
  }

  async listConversations(opts?: {
    status?: ConversationStatus;
    limit?: number;
    offset?: number;
  }): Promise<AgentConversation[]> {
    const whereClause = opts?.status
      ? eq(conversations.status, opts.status)
      : undefined;

    const rows = await this.db
      .select()
      .from(conversations)
      .where(whereClause)
      .orderBy(desc(conversations.createdAt))
      .limit(opts?.limit ?? 50)
      .offset(opts?.offset ?? 0);

    return rows.map((r) => this.mapConversation(r));
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<AgentMessage> {
    const now = new Date().toISOString();
    const msg: AgentMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role,
      content,
      metadata,
      createdAt: now,
    };

    await this.db.insert(messages).values({
      id: msg.id,
      conversationId: msg.conversationId,
      role: msg.role,
      content: msg.content,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: msg.createdAt,
    });

    // Update conversation updatedAt
    await this.db
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    return msg;
  }

  async getMessages(conversationId: string): Promise<AgentMessage[]> {
    const rows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return rows.map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      role: r.role as MessageRole,
      content: r.content,
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
      createdAt: r.createdAt,
    }));
  }

  async getConversationContext(
    conversationId: string,
  ): Promise<AgentConversationContext | undefined> {
    const conv = await this.getConversation(conversationId);
    if (!conv) return undefined;

    const msgs = await this.getMessages(conversationId);
    const entities = await this.getActiveEntities(conversationId);

    return {
      conversationId,
      messages: msgs,
      activeEntities: entities,
    };
  }

  async getActiveEntities(conversationId: string): Promise<ActiveEntity[]> {
    const rows = await this.db
      .select()
      .from(conversationEntities)
      .where(eq(conversationEntities.conversationId, conversationId));

    return rows.map((r) => ({
      entityType: r.entityType,
      entityValue: r.entityValue,
      entityLabel: r.entityLabel ?? undefined, // normalize null → undefined
    }));
  }

  async updateActiveEntities(
    conversationId: string,
    entities: ActiveEntity[],
  ): Promise<void> {
    this.db.transaction((tx) => {
      // Delete existing entities for this conversation
      tx.delete(conversationEntities)
        .where(eq(conversationEntities.conversationId, conversationId))
        .run();

      // Insert new entities
      if (entities.length > 0) {
        const now = new Date().toISOString();
        tx.insert(conversationEntities)
          .values(
            entities.map((e) => ({
              id: crypto.randomUUID(),
              conversationId,
              entityType: e.entityType,
              entityValue: e.entityValue,
              entityLabel: e.entityLabel,
              updatedAt: now,
            })),
          )
          .run();
      }
    });
  }

  private mapConversation(
    row: typeof conversations.$inferSelect,
  ): AgentConversation {
    return {
      id: row.id,
      title: row.title,
      sourceType: row.sourceType as SourceType,
      sourceId: row.sourceId,
      status: row.status as ConversationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
