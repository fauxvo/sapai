import 'dotenv/config';
import { env } from './config/environment.js';
import { app } from './app.js';
import { runMigrations } from './db/migrate.js';

runMigrations();

console.log(`SAP System: ${env.SAP_BASE_URL} (client ${env.SAP_CLIENT})`);
console.log(`Starting SAP Integration API on port ${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
