import type { AgentMessage } from '@sapai/shared';

interface MessageBubbleProps {
  message: AgentMessage;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function MessageBubble({
  message,
  showRetry,
  onRetry,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col items-end">
        <div
          className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 ring-1 ring-gray-200'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          <time
            className={`mt-1 block text-xs ${isUser ? 'text-blue-200' : 'text-gray-400'}`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <span>↻</span> Retry
          </button>
        )}
      </div>
    </div>
  );
}
