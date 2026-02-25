import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from '../MessageBubble';

describe('MessageBubble', () => {
  it('renders user message with correct styling', () => {
    render(
      <MessageBubble
        message={{
          id: '1',
          conversationId: 'c1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    // User messages should have blue background
    const bubble = screen
      .getByText('Hello')
      .closest('div[class*="bg-blue-600"]');
    expect(bubble).toBeInTheDocument();
  });

  it('renders agent message with correct styling', () => {
    render(
      <MessageBubble
        message={{
          id: '2',
          conversationId: 'c1',
          role: 'agent',
          content: 'Hi there',
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    // Agent messages should have white background
    const bubble = screen
      .getByText('Hi there')
      .closest('div[class*="bg-white"]');
    expect(bubble).toBeInTheDocument();
  });

  it('shows timestamp', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    render(
      <MessageBubble
        message={{
          id: '3',
          conversationId: 'c1',
          role: 'user',
          content: 'Test',
          createdAt: date.toISOString(),
        }}
      />,
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    // Should have a time element
    expect(document.querySelector('time')).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(
      <MessageBubble
        message={{
          id: '4',
          conversationId: 'c1',
          role: 'user',
          content: 'Right-aligned',
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('justify-end');
  });

  it('aligns agent messages to the left', () => {
    const { container } = render(
      <MessageBubble
        message={{
          id: '5',
          conversationId: 'c1',
          role: 'agent',
          content: 'Left-aligned',
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('justify-start');
  });

  it('preserves whitespace in message content', () => {
    render(
      <MessageBubble
        message={{
          id: '6',
          conversationId: 'c1',
          role: 'user',
          content: 'Line 1\nLine 2',
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    const paragraph = screen.getByText((_content, element) => {
      return (
        element?.tagName === 'P' &&
        element?.textContent === 'Line 1\nLine 2'
      );
    });
    expect(paragraph.className).toContain('whitespace-pre-wrap');
  });

  it('renders retry button when showRetry and onRetry provided', () => {
    render(
      <MessageBubble
        message={{
          id: '7',
          conversationId: 'c1',
          role: 'user',
          content: 'Retry me',
          createdAt: new Date().toISOString(),
        }}
        showRetry={true}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('does not render retry button when showRetry is false', () => {
    render(
      <MessageBubble
        message={{
          id: '8',
          conversationId: 'c1',
          role: 'user',
          content: 'No retry',
          createdAt: new Date().toISOString(),
        }}
        showRetry={false}
        onRetry={() => {}}
      />,
    );
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('does not render retry button when onRetry is absent', () => {
    render(
      <MessageBubble
        message={{
          id: '9',
          conversationId: 'c1',
          role: 'user',
          content: 'No callback',
          createdAt: new Date().toISOString(),
        }}
        showRetry={true}
      />,
    );
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <MessageBubble
        message={{
          id: '10',
          conversationId: 'c1',
          role: 'user',
          content: 'Click retry',
          createdAt: new Date().toISOString(),
        }}
        showRetry={true}
        onRetry={handleRetry}
      />,
    );
    await user.click(screen.getByText('Retry'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
