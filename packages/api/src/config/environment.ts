import { z } from 'zod';

const envSchema = z.object({
  SAP_BASE_URL: z.string().min(1),
  SAP_CLIENT: z.string().min(1),
  SAP_USERNAME: z.string().min(1),
  SAP_PASSWORD: z.string().min(1),
  SAP_LANGUAGE: z.string().default('EN'),
  SAP_TIMEOUT_MS: z.coerce.number().positive().default(30000),
  SAP_MAX_RETRIES: z.coerce.number().nonnegative().default(3),
  PORT: z.coerce.number().positive().default(3000),
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
