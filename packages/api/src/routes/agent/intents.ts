import { OpenAPIHono } from '@hono/zod-openapi';
import { intentRegistry } from '../../services/agent/intents/registry.js';

export const intentsApp = new OpenAPIHono();

intentsApp.get('/intents', (c) => {
  return c.json({
    success: true,
    data: intentRegistry,
  });
});
