import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationList } from '../ConversationList';
import type { AgentConversation } from '@sapai/shared';

const mockConversations: AgentConversation[] = [
  {
    id: 'conv-1',
    title: 'Purchase Order Query',
    sourceType: 'chat',
    sourceId: null,
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'conv-2',
    title: 'Material Stock Check',
    sourceType: 'chat',
    sourceId: null,
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
];

describe('ConversationList', () => {
  it('renders list of conversations', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    expect(screen.getByText('Purchase Order Query')).toBeInTheDocument();
    expect(screen.getByText('Material Stock Check')).toBeInTheDocument();
  });

  it('highlights active conversation with bg-blue-50', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeId="conv-1"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    // The row div (parent of button) carries the active styling
    const activeRow = screen
      .getByText('Purchase Order Query')
      .closest('div.group');
    expect(activeRow?.className).toContain('bg-blue-50');
    expect(activeRow?.className).toContain('text-blue-700');
  });

  it('does not highlight inactive conversations', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeId="conv-1"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    const inactiveRow = screen
      .getByText('Material Stock Check')
      .closest('div.group');
    expect(inactiveRow?.className).not.toContain('bg-blue-50');
    expect(inactiveRow?.className).toContain('text-gray-700');
  });

  it('"New" button calls onNew', async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        activeId={null}
        onSelect={vi.fn()}
        onNew={onNew}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    await user.click(screen.getByText('New'));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('empty state shows "No conversations yet"', () => {
    render(
      <ConversationList
        conversations={[]}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('clicking conversation calls onSelect with the id', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        activeId={null}
        onSelect={onSelect}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    await user.click(screen.getByText('Purchase Order Query'));
    expect(onSelect).toHaveBeenCalledWith('conv-1');
  });

  it('renders conversation dates', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    // Each conversation should have a time element
    const timeElements = document.querySelectorAll('time');
    expect(timeElements.length).toBe(2);
  });

  it('shows "Untitled" for conversations with null title', () => {
    const convWithNullTitle: AgentConversation[] = [
      {
        id: 'conv-3',
        title: null,
        sourceType: 'chat',
        sourceId: null,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    ];
    render(
      <ConversationList
        conversations={convWithNullTitle}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('shows header text "Conversations"', () => {
    render(
      <ConversationList
        conversations={[]}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });
});
