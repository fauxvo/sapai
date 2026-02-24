import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiReference } from '@scalar/hono-api-reference';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { sapHealthApp } from './routes/sap/health.js';
import { purchaseOrderApp } from './routes/sap/purchase-orders.js';
import { poNotesApp } from './routes/sap/po-notes.js';
import { poScheduleLinesApp } from './routes/sap/po-schedule-lines.js';
import { poAccountAssignmentsApp } from './routes/sap/po-account-assignments.js';
import { poPricingElementsApp } from './routes/sap/po-pricing-elements.js';
import { agentApp } from './routes/agent/index.js';
import { clerkAuth } from './middleware/auth.js';
import { anthropicGuard } from './middleware/anthropic-guard.js';
import { agentRateLimiter } from './middleware/rate-limiter.js';
import { createLogger } from './utils/logger.js';

const log = createLogger('app');

const app = new OpenAPIHono();

// Middleware
app.use('*', logger());
// TODO: Restrict CORS origins via env var (e.g. CORS_ORIGIN) — currently allows all origins.
app.use('*', cors());

// Clerk JWT auth — skipped when CLERK_SECRET_KEY is not configured (local dev mode)
app.use('/sap/*', clerkAuth);
app.use('/api/agent/*', clerkAuth);

// Anthropic API key guard — 503 when ANTHROPIC_API_KEY is not set
app.use('/api/agent/parse', anthropicGuard);
app.use('/api/agent/parse/stream', anthropicGuard);
app.use('/api/agent/execute', anthropicGuard);

// Rate limiting for AI endpoints
app.use('/api/agent/parse', agentRateLimiter);
app.use('/api/agent/parse/stream', agentRateLimiter);

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
app.route('/api/agent', agentApp);

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
  log.error('Unhandled error', {
    method: c.req.method,
    path: c.req.path,
    error: err.message,
    stack: err.stack,
    name: err.name,
  });
  return c.json(
    { message: err.message },
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
  );
});

export { app };
export type AppType = typeof app;
