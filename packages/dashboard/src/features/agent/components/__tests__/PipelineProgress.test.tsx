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
    const stageElements = container.querySelectorAll('.space-y-1\\.5 > div');
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
    // Error message should be displayed below the stages
    expect(
      screen.getByText('Validation failed: invalid fields'),
    ).toBeInTheDocument();
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
});
