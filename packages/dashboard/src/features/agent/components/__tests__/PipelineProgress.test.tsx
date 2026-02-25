import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PipelineProgress } from '../PipelineProgress';

describe('PipelineProgress', () => {
  it('shows all 5 stages in order', () => {
    render(
      <PipelineProgress
        currentStage={null}
        completedStages={[]}
        error={null}
      />,
    );
    const labels = [
      'Parsing intent',
      'Validating',
      'Resolving entities',
      'Building plan',
      'Executing',
    ];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('shows stages in correct order', () => {
    const { container } = render(
      <PipelineProgress
        currentStage={null}
        completedStages={[]}
        error={null}
      />,
    );
    const stageElements = container.querySelectorAll('.space-y-1 > div');
    const stageTexts = Array.from(stageElements).map(
      (el) => el.textContent?.trim(),
    );
    expect(stageTexts).toEqual([
      expect.stringContaining('Parsing intent'),
      expect.stringContaining('Validating'),
      expect.stringContaining('Resolving entities'),
      expect.stringContaining('Building plan'),
      expect.stringContaining('Executing'),
    ]);
  });

  it('active stage has spinner indicator', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="validating"
        completedStages={['parsing']}
        error={null}
      />,
    );
    // The active stage should have animate-spin class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner?.className).toContain('text-blue-500');
  });

  it('active stage label has blue styling', () => {
    render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        error={null}
      />,
    );
    const resolvingLabel = screen.getByText('Resolving entities');
    expect(resolvingLabel.className).toContain('text-blue-700');
    expect(resolvingLabel.className).toContain('font-medium');
  });

  it('completed stages have green checkmark', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        error={null}
      />,
    );
    // Checkmark character is ✓ (&#10003;)
    const greenChecks = container.querySelectorAll('.text-green-500');
    expect(greenChecks.length).toBe(2);
    greenChecks.forEach((check) => {
      expect(check.textContent).toBe('\u2713');
    });
  });

  it('completed stage labels have green styling', () => {
    render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        error={null}
      />,
    );
    const parsingLabel = screen.getByText('Parsing intent');
    expect(parsingLabel.className).toContain('text-green-700');
    const validatingLabel = screen.getByText('Validating');
    expect(validatingLabel.className).toContain('text-green-700');
  });

  it('error state shows X icon and error message', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="validating"
        completedStages={['parsing']}
        error="Validation failed: invalid fields"
      />,
    );
    // X character is ✕ (&#10005;)
    const xIcon = container.querySelector('.text-red-500');
    expect(xIcon).toBeInTheDocument();
    expect(xIcon?.textContent).toBe('\u2715');
    // Error message appears inline under the errored stage AND as summary
    const errorTexts = screen.getAllByText(
      'Validation failed: invalid fields',
    );
    expect(errorTexts.length).toBe(2);
  });

  it('error stage label has red styling', () => {
    render(
      <PipelineProgress
        currentStage="validating"
        completedStages={['parsing']}
        error="Something failed"
      />,
    );
    const validatingLabel = screen.getByText('Validating');
    expect(validatingLabel.className).toContain('text-red-600');
  });

  it('incomplete stages show dot indicator', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="parsing"
        completedStages={[]}
        error={null}
      />,
    );
    // Dot character is ● (&#9679;)
    const dots = container.querySelectorAll('.text-gray-300');
    // 4 incomplete stages (validating, resolving, planning, executing)
    expect(dots.length).toBe(4);
    dots.forEach((dot) => {
      expect(dot.textContent).toBe('\u25CF');
    });
  });

  it('incomplete stage labels have gray styling', () => {
    render(
      <PipelineProgress
        currentStage="parsing"
        completedStages={[]}
        error={null}
      />,
    );
    const executingLabel = screen.getByText('Executing');
    expect(executingLabel.className).toContain('text-gray-400');
  });

  it('shows "Pipeline Progress" heading', () => {
    render(
      <PipelineProgress
        currentStage={null}
        completedStages={[]}
        error={null}
      />,
    );
    expect(screen.getByText('Pipeline Progress')).toBeInTheDocument();
  });

  it('shows started detail for current stage', () => {
    render(
      <PipelineProgress
        currentStage="parsing"
        completedStages={[]}
        stageDetails={[
          { stage: 'parsing', startedDetail: 'Sending message to AI model...' },
        ]}
        error={null}
      />,
    );
    expect(screen.getByText('Sending message to AI model...')).toBeInTheDocument();
  });

  it('shows completed detail for finished stage', () => {
    render(
      <PipelineProgress
        currentStage="validating"
        completedStages={['parsing']}
        stageDetails={[
          { stage: 'parsing', startedDetail: 'Sending...', completedDetail: 'Identified 1 intent(s)' },
          { stage: 'validating', startedDetail: 'Checking fields...' },
        ]}
        error={null}
      />,
    );
    expect(screen.getByText('Identified 1 intent(s)')).toBeInTheDocument();
    expect(screen.getByText('Checking fields...')).toBeInTheDocument();
  });

  it('shows progress items list for a stage', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        progressItems={{
          resolving: [
            { item: '[1/2] GET_PURCHASE_ORDER', detail: 'Resolving: poNumber=4500000001', status: 'done' },
            { item: '[2/2] LIST_PURCHASE_ORDERS', detail: 'Resolving: no fields', status: 'running' },
          ],
        }}
        error={null}
      />,
    );
    expect(screen.getByText('Resolving: poNumber=4500000001')).toBeInTheDocument();
    expect(screen.getByText('Resolving: no fields')).toBeInTheDocument();
    // Done item should have a green checkmark
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(2);
  });

  it('shows correct status icons for progress items', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        progressItems={{
          resolving: [
            { item: '[1/3] A', detail: 'Done item', status: 'done' },
            { item: '[2/3] B', detail: 'Running item', status: 'running' },
            { item: '[3/3] C', detail: 'Failed item', status: 'failed' },
          ],
        }}
        error={null}
      />,
    );
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(3);
    // First item: done = green checkmark
    expect(listItems[0].querySelector('.text-green-500')).toBeTruthy();
    expect(listItems[0].querySelector('.text-green-600')).toBeTruthy();
    // Second item: running = blue spinner
    expect(listItems[1].querySelector('.animate-spin')).toBeTruthy();
    expect(listItems[1].querySelector('.text-blue-600')).toBeTruthy();
    // Third item: failed = red X
    expect(listItems[2].querySelector('.text-red-500')).toBeTruthy();
    expect(listItems[2].querySelector('.text-red-600')).toBeTruthy();
  });

  it('shows error detail inline under the errored stage', () => {
    render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        stageDetails={[
          { stage: 'resolving', startedDetail: 'Checking SAP connectivity...' },
        ]}
        error="SAP system unreachable: connection refused"
      />,
    );
    // The startedDetail should be shown inline under the errored stage
    expect(
      screen.getByText('Checking SAP connectivity...'),
    ).toBeInTheDocument();
    // The error message should appear inline under the stage AND as summary at the bottom
    const errorTexts = screen.getAllByText(
      'SAP system unreachable: connection refused',
    );
    // One inline + one summary = 2
    expect(errorTexts.length).toBe(2);
    // Inline error should have red styling
    errorTexts.forEach((el) => {
      expect(el.className).toContain('text-red-600');
    });
  });

  it('does not show progress items when none exist', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        progressItems={{}}
        error={null}
      />,
    );
    expect(container.querySelectorAll('li').length).toBe(0);
  });

  it('shows cost estimate breakdown for completed parsing stage', () => {
    render(
      <PipelineProgress
        currentStage="validating"
        completedStages={['parsing']}
        stageDetails={[
          {
            stage: 'parsing',
            completedDetail: 'Identified 2 intent(s): getPoPrice (95%), getPoStatus (87%)',
            costEstimate: {
              inputTokens: 1234,
              outputTokens: 567,
              totalCost: 0.0042,
              model: 'claude-sonnet-4-5-20250514',
            },
          },
        ]}
        error={null}
      />,
    );
    // Structured cost breakdown line contains all cost info
    const costLine = screen.getByText(/1,234 input/);
    expect(costLine).toBeInTheDocument();
    expect(costLine.textContent).toContain('567 output');
    expect(costLine.textContent).toContain('claude-sonnet-4-5-20250514');
    expect(costLine.textContent).toContain('$0.0042');
  });

  it('does not show cost estimate for stages without it', () => {
    const { container } = render(
      <PipelineProgress
        currentStage="resolving"
        completedStages={['parsing', 'validating']}
        stageDetails={[
          { stage: 'parsing', completedDetail: 'Identified 1 intent(s)' },
          { stage: 'validating', completedDetail: 'All passed' },
        ]}
        error={null}
      />,
    );
    // No cost breakdown lines (they have the ↳ character)
    const costLines = container.querySelectorAll('p.text-gray-400');
    Array.from(costLines).forEach((el) => {
      expect(el.textContent).not.toContain('input');
    });
  });
});
