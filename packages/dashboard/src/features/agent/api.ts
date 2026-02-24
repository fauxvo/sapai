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
import { apiRequest } from '../../lib/api-client';

// --- Agent endpoints ---

export async function parseMessage(
  body: AgentParseRequest,
  token?: string,
): Promise<AgentParseResponse & { executionResult?: unknown }> {
  return apiRequest('/api/agent/parse', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export async function executePlan(
  body: AgentExecuteRequest,
  token?: string,
): Promise<AgentExecuteResponse> {
  return apiRequest('/api/agent/execute', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

// --- Conversation endpoints ---

export async function listConversations(
  params?: { status?: string; limit?: number; offset?: number },
  token?: string,
): Promise<AgentConversation[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const qs = searchParams.toString();
  return apiRequest(`/api/agent/conversations${qs ? `?${qs}` : ''}`, { token });
}

export async function createConversation(
  body?: { title?: string; sourceType?: string; sourceId?: string },
  token?: string,
): Promise<AgentConversation> {
  return apiRequest('/api/agent/conversations', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
    token,
  });
}

export interface ConversationDetail {
  conversation: AgentConversation;
  messages: AgentMessage[];
  activeEntities: ActiveEntity[];
}

export async function getConversation(
  id: string,
  token?: string,
): Promise<ConversationDetail> {
  return apiRequest(`/api/agent/conversations/${id}`, { token });
}

export async function updateConversation(
  id: string,
  body: { title?: string; status?: string },
  token?: string,
): Promise<AgentConversation> {
  return apiRequest(`/api/agent/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    token,
  });
}

export async function deleteConversation(
  id: string,
  token?: string,
): Promise<void> {
  await apiRequest(`/api/agent/conversations/${id}`, {
    method: 'DELETE',
    token,
  });
}

// --- Audit ---

export async function getAuditHistory(
  params?: {
    conversationId?: string;
    phase?: string;
    limit?: number;
    offset?: number;
  },
  token?: string,
): Promise<AuditLogEntry[]> {
  const searchParams = new URLSearchParams();
  if (params?.conversationId)
    searchParams.set('conversationId', params.conversationId);
  if (params?.phase) searchParams.set('phase', params.phase);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const qs = searchParams.toString();
  return apiRequest(`/api/agent/history${qs ? `?${qs}` : ''}`, { token });
}

// Re-export types for convenience
export type { ExecutionPlan, AgentMessage, AgentConversation, AuditLogEntry };
