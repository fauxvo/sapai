import type {
  AgentParseRequest,
  AgentParseResponse,
  AgentExecuteRequest,
  AgentExecuteResponse,
  AgentConversation,
  AgentMessage,
  ActiveEntity,
  AuditLogEntry,
  ExecutionPlan,
} from '@sapai/shared';

// --- Generic fetch helper ---

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }
  return json.data as T;
}

// --- Agent endpoints ---

export async function parseMessage(body: AgentParseRequest): Promise<
  AgentParseResponse & {
    executionResult?: unknown;
  }
> {
  return request('/agent/parse', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function executePlan(
  body: AgentExecuteRequest,
): Promise<AgentExecuteResponse> {
  return request('/agent/execute', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// --- Conversation endpoints ---

export async function listConversations(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<AgentConversation[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const qs = searchParams.toString();
  return request(`/agent/conversations${qs ? `?${qs}` : ''}`);
}

export async function createConversation(body?: {
  title?: string;
  sourceType?: string;
  sourceId?: string;
}): Promise<AgentConversation> {
  return request('/agent/conversations', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
}

export interface ConversationDetail {
  conversation: AgentConversation;
  messages: AgentMessage[];
  activeEntities: ActiveEntity[];
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return request(`/agent/conversations/${id}`);
}

// --- Audit ---

export async function getAuditHistory(params?: {
  conversationId?: string;
  phase?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogEntry[]> {
  const searchParams = new URLSearchParams();
  if (params?.conversationId)
    searchParams.set('conversationId', params.conversationId);
  if (params?.phase) searchParams.set('phase', params.phase);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const qs = searchParams.toString();
  return request(`/agent/history${qs ? `?${qs}` : ''}`);
}

// Re-export types for convenience
export type { ExecutionPlan, AgentMessage, AgentConversation, AuditLogEntry };
