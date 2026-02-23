import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('destination', () => {
  beforeEach(() => {
    vi.stubEnv('SAP_BASE_URL', 'https://sap.example.com:44300');
    vi.stubEnv('SAP_CLIENT', '100');
    vi.stubEnv('SAP_USERNAME', 'testuser');
    vi.stubEnv('SAP_PASSWORD', 'testpass');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('creates destination with correct shape', async () => {
    const { createSapDestination } = await import('./destination.js');
    const dest = createSapDestination();

    expect(dest.url).toBe('https://sap.example.com:44300');
    expect(dest.username).toBe('testuser');
    expect(dest.password).toBe('testpass');
    expect(dest.authentication).toBe('BasicAuthentication');
    expect(dest.sapClient).toBe('100');
  });

  it('has isTrustingAllCertificates set to true', async () => {
    const { createSapDestination } = await import('./destination.js');
    const dest = createSapDestination();

    expect(dest.isTrustingAllCertificates).toBe(true);
  });
});
