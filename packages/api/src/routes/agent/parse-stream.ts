import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { streamSSE } from 'hono/streaming';
import { getOrchestrator } from '../../services/agent/orchestrator-instance.js';
import { getAuth } from '../../middleware/auth.js';
import type { StageUpdate } from '../../services/agent/AgentOrchestrator.js';

const ParseStreamSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export const parseStreamApp = new OpenAPIHono();

parseStreamApp.post('/parse/stream', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = ParseStreamSchema.safeParse(raw);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      },
      400,
    );
  }

  const body = parsed.data;
  const auth = getAuth(c);
  const orchestrator = getOrchestrator();

  return streamSSE(c, async (stream) => {
    let eventId = 0;

    const onStageUpdate = async (update: StageUpdate) => {
      await stream.writeSSE({
        id: String(eventId++),
        event: 'stage',
        data: JSON.stringify(update),
      });
    };

    try {
      const result = await orchestrator.processMessage({
        message: body.message,
        conversationId: body.conversationId,
        userId: auth?.userId,
        onStageUpdate,
      });

      await stream.writeSSE({
        id: String(eventId++),
        event: 'result',
        data: JSON.stringify(result),
      });
    } catch (err) {
      await stream.writeSSE({
        id: String(eventId++),
        event: 'error',
        data: JSON.stringify({
          message: err instanceof Error ? err.message : 'Unknown error',
        }),
      });
    }
  });
});
