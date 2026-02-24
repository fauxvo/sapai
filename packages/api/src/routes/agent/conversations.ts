import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { ConversationStore } from '../../services/agent/ConversationStore.js';
import { getAuth } from '../../middleware/auth.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('conversations');
const conversationStore = new ConversationStore();

const ConversationSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  sourceType: z.string(),
  sourceId: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// List conversations
const listRoute = createRoute({
  tags: ['Agent'],
  method: 'get',
  path: '/conversations',
  request: {
    query: z.object({
      status: z.enum(['active', 'archived']).optional(),
      limit: z.coerce.number().positive().optional(),
      offset: z.coerce.number().nonnegative().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(ConversationSchema),
      }),
      'Conversation list',
    ),
  },
});

// Create conversation
const createConvRoute = createRoute({
  tags: ['Agent'],
  method: 'post',
  path: '/conversations',
  request: {
    body: jsonContent(
      z.object({
        title: z.string().optional(),
        sourceType: z.enum(['chat', 'ticket', 'email']).optional(),
        sourceId: z.string().optional(),
      }),
      'New conversation',
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.literal(true),
        data: ConversationSchema,
      }),
      'Created conversation',
    ),
  },
});

// Get conversation with full context
const getRoute = createRoute({
  tags: ['Agent'],
  method: 'get',
  path: '/conversations/{id}',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.object({
          conversation: ConversationSchema,
          messages: z.array(
            z.object({
              id: z.string(),
              role: z.string(),
              content: z.string(),
              metadata: z.unknown().nullable(),
              createdAt: z.string(),
            }),
          ),
          activeEntities: z.array(
            z.object({
              entityType: z.string(),
              entityValue: z.string(),
              entityLabel: z.string().optional(),
            }),
          ),
        }),
      }),
      'Full conversation context',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Not found',
    ),
  },
});

// Update conversation
const updateRoute = createRoute({
  tags: ['Agent'],
  method: 'patch',
  path: '/conversations/{id}',
  request: {
    params: z.object({ id: z.string() }),
    body: jsonContent(
      z.object({
        title: z.string().optional(),
        status: z.enum(['active', 'archived']).optional(),
      }),
      'Update fields',
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: ConversationSchema,
      }),
      'Updated conversation',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Not found',
    ),
  },
});

// Delete conversation (cascade deletes messages, entities, plans, audit logs)
const deleteRoute = createRoute({
  tags: ['Agent'],
  method: 'delete',
  path: '/conversations/{id}',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Deleted',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Not found',
    ),
  },
});

export const conversationsApp = new OpenAPIHono();

conversationsApp.openapi(listRoute, async (c) => {
  const { status, limit, offset } = c.req.valid('query');
  const auth = getAuth(c);
  log.debug('LIST conversations', { status, limit, offset, userId: auth?.userId });
  const convs = await conversationStore.listConversations({
    status,
    userId: auth?.userId,
    limit,
    offset,
  });
  log.debug('LIST conversations result', { count: convs.length });

  return c.json({ success: true as const, data: convs }, HttpStatusCodes.OK);
});

conversationsApp.openapi(createConvRoute, async (c) => {
  log.debug('CREATE conversation - parsing request body');
  const body = c.req.valid('json');
  const auth = getAuth(c);
  log.info('CREATE conversation', { body, userId: auth?.userId });
  const conv = await conversationStore.createConversation({
    ...body,
    userId: auth?.userId,
  });
  log.info('CREATE conversation success', { id: conv.id, title: conv.title });

  return c.json(
    { success: true as const, data: conv },
    HttpStatusCodes.CREATED,
  );
});

conversationsApp.openapi(getRoute, async (c) => {
  const { id } = c.req.valid('param');
  const auth = getAuth(c);
  log.debug('GET conversation', { id, userId: auth?.userId });
  const conv = await conversationStore.getConversation(id, auth?.userId);

  if (!conv) {
    return c.json(
      { success: false as const, error: `Conversation ${id} not found` },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const msgs = await conversationStore.getMessages(id);
  const entities = await conversationStore.getActiveEntities(id);

  return c.json(
    {
      success: true as const,
      data: {
        conversation: conv,
        messages: msgs.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata ?? null,
          createdAt: msg.createdAt,
        })),
        activeEntities: entities,
      },
    },
    HttpStatusCodes.OK,
  );
});

conversationsApp.openapi(updateRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const auth = getAuth(c);
  log.debug('UPDATE conversation', { id, body, userId: auth?.userId });
  const updated = await conversationStore.updateConversation(
    id,
    body,
    auth?.userId,
  );

  if (!updated) {
    return c.json(
      { success: false as const, error: `Conversation ${id} not found` },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    { success: true as const, data: updated },
    HttpStatusCodes.OK,
  );
});

conversationsApp.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid('param');
  const auth = getAuth(c);
  log.debug('DELETE conversation', { id, userId: auth?.userId });
  const conv = await conversationStore.getConversation(id, auth?.userId);

  if (!conv) {
    return c.json(
      { success: false as const, error: `Conversation ${id} not found` },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  await conversationStore.deleteConversation(id, auth?.userId);
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});
