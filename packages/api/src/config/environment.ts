import { z } from 'zod';

// Treats empty strings as undefined — useful for env vars set to '' in
// docker-compose or .env templates where "unset" is expressed as empty.
const optionalNonEmpty = z
  .string()
  .min(1)
  .optional()
  .or(z.literal('').transform(() => undefined));

const envSchema = z.object({
  SAP_BASE_URL: z.string().min(1),
  SAP_CLIENT: z.string().min(1),
  SAP_USERNAME: z.string().min(1),
  SAP_PASSWORD: z.string().min(1),
  SAP_LANGUAGE: z.string().default('EN'),
  SAP_TIMEOUT_MS: z.coerce.number().positive().default(30000),
  SAP_MAX_RETRIES: z.coerce.number().nonnegative().default(3),
  SAP_TRUST_ALL_CERTS: z
    .enum(['true', 'false', '1', '0'])
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  PORT: z.coerce.number().positive().default(3000),

  // Environment
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),

  // Database
  DB_PATH: z.string().default('./data/sapai.db'),

  // Agent / Claude API
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-5-20250929'),
  AGENT_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),

  // Clerk authentication (auth disabled when not set)
  // Empty strings are treated as unset (common in docker-compose / .env templates)
  CLERK_SECRET_KEY: optionalNonEmpty,
  CLERK_PUBLISHABLE_KEY: optionalNonEmpty,
  CLERK_JWT_KEY: optionalNonEmpty,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(10),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}

let _env: Env | undefined;

export function getEnv(): Env {
  if (!_env) {
    _env = loadEnv();
  }
  return _env;
}

// Proxy that lazily initializes on first property access — fail-fast on startup
// but testable without side effects on import
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
