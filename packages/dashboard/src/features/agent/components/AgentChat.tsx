import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import type { AgentMessage, ExecutionPlan } from '@sapai/shared';
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useParse,
  useExecute,
  useIntents,
} from '../hooks/useAgent';
import { useParseStream } from '../hooks/useParseStream';
import { MessageBubble } from './MessageBubble';
import { ExecutionPlanCard } from './ExecutionPlanCard';
import { ClarificationPrompt } from './ClarificationPrompt';
import { ConversationList } from './ConversationList';
import { PipelineProgress } from './PipelineProgress';
import { RetryBar } from './RetryBar';

const MAX_RETRIES = Number(import.meta.env.VITE_MAX_RETRIES ?? '3');

export function AgentChat() {
  // URL-based conversation restore
  const { conversationId: urlConvId } = useSearch({ from: '/agent/' });
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [pendingPlan, setPendingPlan] = useState<ExecutionPlan | null>(null);
  const [clarification, setClarification] = useState<{
    message: string;
    missingFields: string[];
  } | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<AgentMessage[]>(
    [],
  );
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null,
  );
  const [retryCount, setRetryCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConvId = urlConvId ?? null;

  const { data: conversations = [] } = useConversations();
  const { data: conversationDetail } = useConversation(activeConvId);
  const createConversation = useCreateConversation();
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();
  const parse = useParse();
  const execute = useExecute(activeConvId);
  const { stream, isStreaming, stages } = useParseStream();
  const { data: intents = [] } = useIntents();

  const setActiveConvId = useCallback(
    (id: string | null) => {
      navigate({
        to: '/agent',
        search: { conversationId: id ?? undefined },
      });
    },
    [navigate],
  );

  const serverMessages = conversationDetail?.messages ?? [];
  const displayMessages = [
    ...serverMessages,
    ...optimisticMessages.filter(
      (om) => !serverMessages.some((sm) => sm.id === om.id),
    ),
  ];

  const isBusy = parse.isPending || isStreaming;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length]);

  // Clear optimistic messages when server data updates
  useEffect(() => {
    if (serverMessages.length > 0) {
      setOptimisticMessages([]);
    }
  }, [serverMessages.length]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isBusy) return;

      setInput('');
      setClarification(null);
      setPendingPlan(null);
      setLastFailedMessage(null);

      // Add optimistic user message
      const tempId = `temp_${Date.now()}`;
      setOptimisticMessages((prev) => [
        ...prev,
        {
          id: tempId,
          conversationId: activeConvId ?? '',
          role: 'user' as const,
          content: message,
          createdAt: new Date().toISOString(),
        },
      ]);

      try {
        // Try SSE streaming first
        const result = await stream({
          message,
          conversationId: activeConvId ?? undefined,
        });

        if (result) {
          if (!activeConvId && result.conversationId) {
            setActiveConvId(result.conversationId);
          }
          if (result.clarification) {
            setClarification(result.clarification);
          }
          if (result.plan?.requiresApproval) {
            setPendingPlan(result.plan);
          }
          setRetryCount(0);
          return;
        }
      } catch {
        // SSE failed — fall back to regular POST
      }

      try {
        const result = await parse.mutateAsync({
          message,
          conversationId: activeConvId ?? undefined,
        });

        if (!activeConvId && result.conversationId) {
          setActiveConvId(result.conversationId);
        }
        if (result.clarification) {
          setClarification(result.clarification);
        }
        if (result.plan?.requiresApproval) {
          setPendingPlan(result.plan);
        }
        setRetryCount(0);
      } catch {
        setLastFailedMessage(message);
        setRetryCount((prev) => prev + 1);
      }
    },
    [activeConvId, isBusy, parse, stream, setActiveConvId],
  );

  const handleSend = useCallback(() => {
    sendMessage(input.trim());
  }, [input, sendMessage]);

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage);
    }
  }, [lastFailedMessage, sendMessage]);

  const handleEditRetry = useCallback(() => {
    if (lastFailedMessage) {
      setInput(lastFailedMessage);
      setLastFailedMessage(null);
      inputRef.current?.focus();
    }
  }, [lastFailedMessage]);

  const handleApprove = useCallback(
    async (planId: string) => {
      try {
        await execute.mutateAsync({ planId, approved: true });
        setPendingPlan(null);
      } catch {
        // Error is visible via execute.error
      }
    },
    [execute],
  );

  const handleReject = useCallback(
    async (planId: string) => {
      try {
        await execute.mutateAsync({ planId, approved: false });
        setPendingPlan(null);
      } catch {
        // Error is visible via execute.error
      }
    },
    [execute],
  );

  const handleNewConversation = useCallback(async () => {
    try {
      const conv = await createConversation.mutateAsync({});
      setActiveConvId(conv.id);
      setPendingPlan(null);
      setClarification(null);
      setOptimisticMessages([]);
      setLastFailedMessage(null);
      setRetryCount(0);
    } catch {
      // Error visible via createConversation.error
    }
  }, [createConversation, setActiveConvId]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteConversation.mutateAsync(id);
        if (activeConvId === id) {
          setActiveConvId(null);
          setPendingPlan(null);
          setClarification(null);
          setOptimisticMessages([]);
        }
      } catch {
        // Error visible via deleteConversation.error
      }
    },
    [deleteConversation, activeConvId, setActiveConvId],
  );

  const handleRename = useCallback(
    async (id: string, title: string) => {
      try {
        await updateConversation.mutateAsync({ id, title });
      } catch {
        // Error visible via updateConversation.error
      }
    },
    [updateConversation],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const error = !lastFailedMessage
    ? (parse.error ?? execute.error ?? createConversation.error)
    : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={setActiveConvId}
          onNew={handleNewConversation}
          onDelete={handleDelete}
          onRename={handleRename}
          isDeleting={deleteConversation.isPending}
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {displayMessages.length === 0 ? (
            <div className="mx-auto max-w-3xl py-8">
              <div className="mb-6 text-center">
                <p className="text-lg font-medium text-gray-900">
                  SAP AI Agent
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Ask about purchase orders in natural language. Here's what I
                  can do:
                </p>
              </div>
              {intents.length > 0 && (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {intents.map((intent) => {
                    const categoryColors: Record<string, string> = {
                      read: 'bg-blue-50 text-blue-700 ring-blue-200',
                      create: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                      update: 'bg-amber-50 text-amber-700 ring-amber-200',
                      delete: 'bg-red-50 text-red-700 ring-red-200',
                    };
                    const methodColors: Record<string, string> = {
                      GET: 'bg-blue-100 text-blue-700',
                      POST: 'bg-emerald-100 text-emerald-700',
                      PATCH: 'bg-amber-100 text-amber-700',
                      DELETE: 'bg-red-100 text-red-700',
                    };
                    return (
                      <button
                        key={intent.id}
                        type="button"
                        className={`rounded-lg p-3 text-left ring-1 transition-shadow hover:shadow-sm ${categoryColors[intent.category] ?? 'bg-gray-50 text-gray-700 ring-gray-200'}`}
                        onClick={() => {
                          if (intent.examples[0]) {
                            setInput(intent.examples[0]);
                            inputRef.current?.focus();
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold leading-tight">
                              {intent.name}
                            </p>
                            <p className="mt-0.5 text-xs leading-snug opacity-75">
                              {intent.description}
                            </p>
                          </div>
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {intent.category}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${methodColors[intent.apiEndpoint.method] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {intent.apiEndpoint.method}
                          </span>
                          <span className="truncate font-mono text-[11px] opacity-70">
                            {intent.apiEndpoint.path}
                          </span>
                        </div>
                        {intent.examples[0] && (
                          <p className="mt-1.5 truncate text-xs italic opacity-60">
                            "{intent.examples[0]}"
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3">
              {(() => {
                const lastUserMsg = [...displayMessages]
                  .reverse()
                  .find((m) => m.role === 'user');
                return displayMessages.map((msg) => {
                  const isLastUser = msg.role === 'user' && msg === lastUserMsg;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      showRetry={isLastUser && !isBusy}
                      onRetry={() => sendMessage(msg.content)}
                    />
                  );
                });
              })()}
            </div>
          )}

          {/* Pipeline progress — visible while streaming or when stage data persists */}
          {(isStreaming ||
            stages.completedStages.length > 0 ||
            stages.currentStage !== null ||
            stages.error !== null) && (
            <div className="mx-auto mt-3 max-w-3xl">
              <PipelineProgress
                currentStage={stages.currentStage}
                completedStages={stages.completedStages}
                stageDetails={stages.stageDetails}
                progressItems={stages.progressItems}
                error={stages.error}
              />
            </div>
          )}

          {/* Clarification prompt */}
          {clarification && (
            <div className="mx-auto mt-3 max-w-3xl">
              <ClarificationPrompt
                message={clarification.message}
                missingFields={clarification.missingFields}
              />
            </div>
          )}

          {/* Pending plan */}
          {pendingPlan && (
            <div className="mx-auto mt-3 max-w-3xl">
              <ExecutionPlanCard
                plan={pendingPlan}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={execute.isPending}
              />
            </div>
          )}

          {/* Retry bar on failure */}
          {lastFailedMessage && (
            <div className="mx-auto mt-3 max-w-3xl">
              <RetryBar
                errorMessage={parse.error?.message ?? 'Message failed to send'}
                retryCount={retryCount}
                maxRetries={MAX_RETRIES}
                onRetry={handleRetry}
                onEditRetry={handleEditRetry}
              />
            </div>
          )}

          {/* Error (non-retry) */}
          {error && (
            <div className="mx-auto mt-3 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-3xl gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about purchase orders..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isBusy}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isBusy ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
