import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiReference } from '@scalar/hono-api-reference';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { sapHealthApp } from './routes/sap/health.js';

const app = new OpenAPIHono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Infrastructure health check (for load balancers / probes)
app.get('/health', (c) => c.json({ status: 'ok' }));

// SAP routes
app.route('/sap', sapHealthApp);

// Auto-generated OpenAPI 3.1 spec
app.doc31('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'SAP Integration API',
    version: '0.0.1',
    description: 'API for SAP S/4HANA integration services',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
});

// Scalar API docs
app.get(
  '/docs',
  apiReference({
    spec: { url: '/openapi.json' },
    theme: 'kepler',
    layout: 'modern',
  }),
);

// Global not-found handler
app.notFound((c) => {
  return c.json(
    { message: `Not Found - ${c.req.path}` },
    HttpStatusCodes.NOT_FOUND,
  );
});

// Global error handler
app.onError((err, c) => {
  return c.json(
    { message: err.message },
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
  );
});

export { app };
export type AppType = typeof app;
