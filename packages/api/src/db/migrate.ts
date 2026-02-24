import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function runMigrations() {
  console.log('Running database migrations...');
  migrate(db, { migrationsFolder: resolve(__dirname, 'migrations') });
  console.log('Migrations complete.');
}
