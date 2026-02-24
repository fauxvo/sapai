import type { AgentMessage } from '@sapai/shared';

interface MessageBubbleProps {
  message: AgentMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
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
    </div>
  );
}
