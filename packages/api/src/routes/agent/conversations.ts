import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { ConversationStore } from '../../services/agent/ConversationStore.js';

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

export const conversationsApp = new OpenAPIHono();

conversationsApp.openapi(listRoute, async (c) => {
  const { status, limit, offset } = c.req.valid('query');
  const convs = await conversationStore.listConversations({
    status,
    limit,
    offset,
  });

  return c.json({ success: true as const, data: convs }, HttpStatusCodes.OK);
});

conversationsApp.openapi(createConvRoute, async (c) => {
  const body = c.req.valid('json');
  const conv = await conversationStore.createConversation(body);

  return c.json(
    { success: true as const, data: conv },
    HttpStatusCodes.CREATED,
  );
});

conversationsApp.openapi(getRoute, async (c) => {
  const { id } = c.req.valid('param');
  const conv = await conversationStore.getConversation(id);

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
