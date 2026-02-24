import { OpenAPIHono } from '@hono/zod-openapi';
import { streamSSE } from 'hono/streaming';
import { getOrchestrator } from '../../services/agent/orchestrator-instance.js';
import { getAuth } from '../../middleware/auth.js';
import type { StageUpdate } from '../../services/agent/AgentOrchestrator.js';

export const parseStreamApp = new OpenAPIHono();

parseStreamApp.post('/parse/stream', async (c) => {
  const body = await c.req.json<{
    message: string;
    conversationId?: string;
  }>();

  if (!body.message) {
    return c.json({ success: false, error: 'message is required' }, 400);
  }

  const auth = getAuth(c);
  const orchestrator = getOrchestrator();

  return streamSSE(c, async (stream) => {
    let eventId = 0;

    const onStageUpdate = (update: StageUpdate) => {
      stream.writeSSE({
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
