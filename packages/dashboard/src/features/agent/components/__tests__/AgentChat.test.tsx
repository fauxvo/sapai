import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentChat } from '../AgentChat';

// Mock all hooks to avoid importing real implementations
vi.mock('../../hooks/useAgent', () => ({
  useConversations: vi.fn(),
  useConversation: vi.fn(),
  useCreateConversation: vi.fn(),
  useParse: vi.fn(),
  useExecute: vi.fn(),
}));

vi.mock('../../hooks/useParseStream', () => ({
  useParseStream: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: vi.fn(() => ({ conversationId: undefined })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Import mocked hooks so we can configure return values
import {
  useConversations,
  useConversation,
  useCreateConversation,
  useParse,
  useExecute,
} from '../../hooks/useAgent';
import { useParseStream } from '../../hooks/useParseStream';

// Type the mocked functions
const mockUseConversations = vi.mocked(useConversations);
const mockUseConversation = vi.mocked(useConversation);
const mockUseCreateConversation = vi.mocked(useCreateConversation);
const mockUseParse = vi.mocked(useParse);
const mockUseExecute = vi.mocked(useExecute);
const mockUseParseStream = vi.mocked(useParseStream);

function setupDefaultMocks() {
  mockUseConversations.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useConversations>);

  mockUseConversation.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useConversation>);

  mockUseCreateConversation.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useCreateConversation>);

  mockUseParse.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useParse>);

  mockUseExecute.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useExecute>);

  mockUseParseStream.mockReturnValue({
    stream: vi.fn(),
    cancel: vi.fn(),
    isStreaming: false,
    stages: {
      currentStage: null,
      completedStages: [],
      error: null,
    },
  });
}

describe('AgentChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  it('renders empty state when no messages', () => {
    render(<AgentChat />);
    expect(screen.getByText('SAP AI Agent')).toBeInTheDocument();
    expect(
      screen.getByText('Ask about purchase orders in natural language'),
    ).toBeInTheDocument();
  });

  it('shows conversation list and chat area', () => {
    render(<AgentChat />);
    // Conversation list header
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    // New button in sidebar
    expect(screen.getByText('New')).toBeInTheDocument();
    // Chat input placeholder
    expect(
      screen.getByPlaceholderText('Ask about purchase orders...'),
    ).toBeInTheDocument();
    // Send button
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('send button disabled when input empty', () => {
    render(<AgentChat />);
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  it('send button enabled when input has text', async () => {
    const user = userEvent.setup();
    render(<AgentChat />);
    const textarea = screen.getByPlaceholderText(
      'Ask about purchase orders...',
    );
    await user.type(textarea, 'Show me PO 4500000001');
    const sendButton = screen.getByText('Send');
    expect(sendButton).not.toBeDisabled();
  });

  it('send button disabled when parse is pending', () => {
    mockUseParse.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useParse>);

    render(<AgentChat />);
    const sendButton = screen.getByText('Sending...');
    expect(sendButton).toBeDisabled();
  });

  it('send button disabled when streaming', () => {
    mockUseParseStream.mockReturnValue({
      stream: vi.fn(),
      cancel: vi.fn(),
      isStreaming: true,
      stages: {
        currentStage: 'parsing',
        completedStages: [],
        error: null,
      },
    });

    render(<AgentChat />);
    const sendButton = screen.getByText('Sending...');
    expect(sendButton).toBeDisabled();
  });

  it('shows messages when conversation has messages', () => {
    mockUseConversation.mockReturnValue({
      data: {
        conversationId: 'conv-1',
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-1',
            role: 'user' as const,
            content: 'Show me PO 4500000001',
            createdAt: '2024-01-15T10:00:00Z',
          },
          {
            id: 'msg-2',
            conversationId: 'conv-1',
            role: 'agent' as const,
            content: 'Here is PO 4500000001',
            createdAt: '2024-01-15T10:00:05Z',
          },
        ],
        activeEntities: [],
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useConversation>);

    render(<AgentChat />);
    expect(
      screen.getByText('Show me PO 4500000001'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Here is PO 4500000001'),
    ).toBeInTheDocument();
    // Empty state should not show
    expect(screen.queryByText('SAP AI Agent')).not.toBeInTheDocument();
  });

  it('shows conversation list with conversations', () => {
    mockUseConversations.mockReturnValue({
      data: [
        {
          id: 'conv-1',
          title: 'PO Discussion',
          sourceType: 'chat' as const,
          sourceId: null,
          status: 'active' as const,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      ],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useConversations>);

    render(<AgentChat />);
    expect(screen.getByText('PO Discussion')).toBeInTheDocument();
  });

  it('shows empty conversation state in sidebar', () => {
    render(<AgentChat />);
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('shows pipeline progress when streaming', () => {
    mockUseParseStream.mockReturnValue({
      stream: vi.fn(),
      cancel: vi.fn(),
      isStreaming: true,
      stages: {
        currentStage: 'validating',
        completedStages: ['parsing'],
        error: null,
      },
    });

    render(<AgentChat />);
    expect(screen.getByText('Pipeline Progress')).toBeInTheDocument();
    expect(screen.getByText('Parsing intent')).toBeInTheDocument();
    expect(screen.getByText('Validating')).toBeInTheDocument();
  });

  it('does not show pipeline progress when not streaming', () => {
    render(<AgentChat />);
    expect(
      screen.queryByText('Pipeline Progress'),
    ).not.toBeInTheDocument();
  });

  it('shows "Sending..." text when busy', () => {
    mockUseParse.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useParse>);

    render(<AgentChat />);
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  it('has textarea for message input', () => {
    render(<AgentChat />);
    const textarea = screen.getByPlaceholderText(
      'Ask about purchase orders...',
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });
});
