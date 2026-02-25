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

  const fullUrl = `${API_BASE}${url}`;
  if (import.meta.env.DEV) {
    console.debug(`[api-client] ${fetchOptions.method ?? 'GET'} ${fullUrl}`);
  }

  const res = await fetch(fullUrl, {
    headers,
    ...fetchOptions,
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`[api-client] Non-JSON response from ${fullUrl}:`, text.slice(0, 500));
    throw new Error(`Non-JSON response: ${res.status} ${res.statusText}`);
  }

  if (!res.ok || json.success === false) {
    const errorMsg = (json.error as string) ?? (json.message as string) ?? `Request failed: ${res.status}`;
    console.error(`[api-client] Error from ${fullUrl}:`, { status: res.status, error: errorMsg, body: json });
    throw new Error(errorMsg);
  }

  return json.data as T;
}
