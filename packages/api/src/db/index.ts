import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('db');

const DB_PATH = process.env.DB_PATH ?? './data/sapai.db';
const dbDir = dirname(DB_PATH);
const dbExists = existsSync(DB_PATH);
mkdirSync(dbDir, { recursive: true });

log.info('Opening SQLite database', { path: DB_PATH, exists: dbExists });

const sqlite = new Database(DB_PATH);
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

log.info('PRAGMA foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
export { sqlite };
