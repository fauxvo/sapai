import { useState, useRef, useEffect, useCallback } from 'react';
import type { AgentConversation } from '@sapai/shared';
import { ConfirmModal } from '../../../components/ConfirmModal';

interface ConversationListProps {
  conversations: AgentConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void | Promise<void>;
  onRename: (id: string, title: string) => void;
  isDeleting?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isDeleting = false,
}: ConversationListProps) {
  const [deleteTarget, setDeleteTarget] = useState<AgentConversation | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingId]);

  const startEditing = useCallback((conv: AgentConversation) => {
    setEditingId(conv.id);
    setEditValue(conv.title ?? '');
  }, []);

  const commitEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  }, [editingId, editValue, onRename]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    },
    [commitEdit, cancelEdit],
  );

  return (
    <>
      <div className="flex h-full flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2.5">
          <span className="text-sm font-semibold text-gray-700">
            Conversations
          </span>
          <button
            onClick={onNew}
            className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-400">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center border-b border-gray-100 transition-colors ${
                  activeId === conv.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {editingId === conv.id ? (
                  <div className="flex-1 px-3 py-2">
                    <input
                      ref={editInputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={commitEdit}
                      className="w-full rounded border border-blue-300 px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => onSelect(conv.id)}
                    className="min-w-0 flex-1 px-3 py-2.5 text-left"
                  >
                    <span className="block truncate text-sm font-medium">
                      {conv.title ?? 'Untitled'}
                    </span>
                    <time className="text-xs text-gray-400">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </time>
                  </button>
                )}

                {/* Action buttons — visible on hover */}
                {editingId !== conv.id && (
                  <div className="flex shrink-0 gap-0.5 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(conv);
                      }}
                      title="Rename"
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(conv);
                      }}
                      title="Delete"
                      className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete conversation"
        message={`Delete "${deleteTarget?.title ?? 'Untitled'}"? All messages, plans, and audit logs for this conversation will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          if (deleteTarget) await onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
