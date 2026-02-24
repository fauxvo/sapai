import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';
import { apiReference } from '@scalar/hono-api-reference';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { env } from './config/environment.js';
import { sapHealthApp } from './routes/sap/health.js';
import { purchaseOrderApp } from './routes/sap/purchase-orders.js';
import { poNotesApp } from './routes/sap/po-notes.js';
import { poScheduleLinesApp } from './routes/sap/po-schedule-lines.js';
import { poAccountAssignmentsApp } from './routes/sap/po-account-assignments.js';
import { poPricingElementsApp } from './routes/sap/po-pricing-elements.js';
import { agentApp } from './routes/agent/index.js';

const app = new OpenAPIHono();

// Middleware
app.use('*', logger());
// TODO: Restrict CORS origins via env var (e.g. CORS_ORIGIN) — currently allows all origins.
app.use('*', cors());

// Agent API key guard — when AGENT_API_KEY is set, all /agent/* routes require Bearer auth.
// When unset (local dev), agent routes are open.
app.use('/agent/*', async (c, next) => {
  const key = env.AGENT_API_KEY;
  if (!key) return next();
  const middleware = bearerAuth({ token: key });
  return middleware(c, next);
});

// Infrastructure health check (for load balancers / probes)
app.get('/health', (c) => c.json({ status: 'ok' }));

// SAP routes
app.route('/sap', sapHealthApp);
app.route('/sap', purchaseOrderApp);
app.route('/sap', poNotesApp);
app.route('/sap', poScheduleLinesApp);
app.route('/sap', poAccountAssignmentsApp);
app.route('/sap', poPricingElementsApp);

// Agent routes
app.route('/agent', agentApp);

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
  'x-tagGroups': [
    {
      name: 'Purchase Orders',
      tags: [
        'Purchase Orders',
        'Purchase Order Notes',
        'Purchase Order Item Notes',
        'Schedule Lines',
        'Subcontracting Components',
        'Account Assignments',
        'Pricing Elements',
      ],
    },
    {
      name: 'AI Agent',
      tags: ['Agent'],
    },
    {
      name: 'Infrastructure',
      tags: ['SAP'],
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
