const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Authenticated fetch wrapper. Attaches Bearer token to all requests.
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    headers,
    ...fetchOptions,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }

  return json.data as T;
}
