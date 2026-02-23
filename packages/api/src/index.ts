import 'dotenv/config';
import { serve } from '@hono/node-server';
import { env } from './config/environment.js';
import { app } from './app.js';

console.log(`SAP System: ${env.SAP_BASE_URL} (client ${env.SAP_CLIENT})`);
console.log(`Starting SAP Integration API on port ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
