import type { AgentConversation } from '@sapai/shared';

interface ConversationListProps {
  conversations: AgentConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationListProps) {
  return (
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
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full border-b border-gray-100 px-3 py-2.5 text-left transition-colors ${
                activeId === conv.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="block truncate text-sm font-medium">
                {conv.title ?? 'Untitled'}
              </span>
              <time className="text-xs text-gray-400">
                {new Date(conv.createdAt).toLocaleDateString()}
              </time>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
