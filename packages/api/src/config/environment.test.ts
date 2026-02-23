import { describe, it, expect, afterEach, vi } from 'vitest';

describe('environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  function stubRequiredEnv() {
    vi.stubEnv('SAP_BASE_URL', 'https://sap.example.com:44300');
    vi.stubEnv('SAP_CLIENT', '100');
    vi.stubEnv('SAP_USERNAME', 'testuser');
    vi.stubEnv('SAP_PASSWORD', 'testpass');
  }

  it('parses valid env correctly', async () => {
    stubRequiredEnv();
    vi.stubEnv('SAP_LANGUAGE', 'DE');
    vi.stubEnv('SAP_TIMEOUT_MS', '60000');
    vi.stubEnv('SAP_MAX_RETRIES', '5');
    vi.stubEnv('PORT', '8080');

    const { loadEnv } = await import('./environment.js');
    const env = loadEnv();

    expect(env.SAP_BASE_URL).toBe('https://sap.example.com:44300');
    expect(env.SAP_CLIENT).toBe('100');
    expect(env.SAP_USERNAME).toBe('testuser');
    expect(env.SAP_PASSWORD).toBe('testpass');
    expect(env.SAP_LANGUAGE).toBe('DE');
    expect(env.SAP_TIMEOUT_MS).toBe(60000);
    expect(env.SAP_MAX_RETRIES).toBe(5);
    expect(env.PORT).toBe(8080);
  });

  it('throws on missing required vars', async () => {
    // Don't stub any SAP vars — they should be missing
    delete process.env.SAP_BASE_URL;
    delete process.env.SAP_CLIENT;
    delete process.env.SAP_USERNAME;
    delete process.env.SAP_PASSWORD;

    const { loadEnv } = await import('./environment.js');
    expect(() => loadEnv()).toThrow();
  });

  it('applies defaults for optional vars', async () => {
    stubRequiredEnv();

    const { loadEnv } = await import('./environment.js');
    const env = loadEnv();

    expect(env.SAP_LANGUAGE).toBe('EN');
    expect(env.SAP_TIMEOUT_MS).toBe(30000);
    expect(env.SAP_MAX_RETRIES).toBe(3);
    expect(env.PORT).toBe(3000);
  });

  it('coerces string numbers correctly', async () => {
    stubRequiredEnv();
    vi.stubEnv('PORT', '3000');
    vi.stubEnv('SAP_TIMEOUT_MS', '15000');

    const { loadEnv } = await import('./environment.js');
    const env = loadEnv();

    expect(env.PORT).toBe(3000);
    expect(typeof env.PORT).toBe('number');
    expect(env.SAP_TIMEOUT_MS).toBe(15000);
    expect(typeof env.SAP_TIMEOUT_MS).toBe('number');
  });
});
