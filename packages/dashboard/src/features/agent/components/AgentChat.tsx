import { useState, useRef, useEffect, useCallback } from 'react';
import type { AgentMessage, ExecutionPlan } from '@sapai/shared';
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useParse,
  useExecute,
} from '../hooks/useAgent';
import { MessageBubble } from './MessageBubble';
import { ExecutionPlanCard } from './ExecutionPlanCard';
import { ClarificationPrompt } from './ClarificationPrompt';
import { ConversationList } from './ConversationList';

export function AgentChat() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [pendingPlan, setPendingPlan] = useState<ExecutionPlan | null>(null);
  const [clarification, setClarification] = useState<{
    message: string;
    missingFields: string[];
  } | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<AgentMessage[]>(
    [],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations = [] } = useConversations();
  const { data: conversationDetail } = useConversation(activeConvId);
  const createConversation = useCreateConversation();
  const parse = useParse();
  const execute = useExecute(activeConvId);

  const serverMessages = conversationDetail?.messages ?? [];
  const displayMessages = [
    ...serverMessages,
    ...optimisticMessages.filter(
      (om) => !serverMessages.some((sm) => sm.id === om.id),
    ),
  ];

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

  const handleSend = useCallback(async () => {
    const message = input.trim();
    if (!message || parse.isPending) return;

    setInput('');
    setClarification(null);
    setPendingPlan(null);

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
      const result = await parse.mutateAsync({
        message,
        conversationId: activeConvId ?? undefined,
      });

      // If new conversation was created, select it
      if (!activeConvId && result.conversationId) {
        setActiveConvId(result.conversationId);
      }

      // Handle clarification
      if (result.clarification) {
        setClarification(result.clarification);
      }

      // Handle plan needing approval
      if (result.plan?.requiresApproval) {
        setPendingPlan(result.plan);
      }
    } catch {
      // Error is visible via parse.error
    }
  }, [input, activeConvId, parse]);

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
    } catch {
      // Error visible via createConversation.error
    }
  }, [createConversation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const error = parse.error ?? execute.error ?? createConversation.error;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={setActiveConvId}
          onNew={handleNewConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {displayMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-500">
                  SAP AI Agent
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Ask about purchase orders in natural language
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3">
              {displayMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
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

          {/* Error */}
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
              disabled={!input.trim() || parse.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {parse.isPending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
