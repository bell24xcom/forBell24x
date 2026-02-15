import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ExplanationHistory from '../ExplanationHistory'; // Adjust path if necessary

// Extend Jest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock any necessary props or context if the component requires them
const mockExplanations = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    query: 'Sample query 1',
    explanation: { summary: 'Sample explanation summary 1', details: 'Details 1' },
    feedback: { rating: 5, comments: 'Great!' },
    modelUsed: 'test-model-v1',
    parameters: { temperature: 0.7 },
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    query: 'Sample query 2',
    explanation: { summary: 'Sample explanation summary 2', details: 'Details 2' },
    feedback: null,
    modelUsed: 'test-model-v2',
    parameters: { temperature: 0.5 },
  },
];

describe('ExplanationHistory Accessibility', () => {
  it('should have no accessibility violations with mock data', async () => {
    const { container } = render(
      <ExplanationHistory
        explanations={mockExplanations}
        onSelectExplanation={() => {}}
        onDeleteExplanation={() => {}}
        onClearHistory={() => {}}
        isLoading={false}
        error={null}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in loading state', async () => {
    const { container } = render(
      <ExplanationHistory
        explanations={[]}
        onSelectExplanation={() => {}}
        onDeleteExplanation={() => {}}
        onClearHistory={() => {}}
        isLoading={true}
        error={null}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in error state', async () => {
    const { container } = render(
      <ExplanationHistory
        explanations={[]}
        onSelectExplanation={() => {}}
        onDeleteExplanation={() => {}}
        onClearHistory={() => {}}
        isLoading={false}
        error={{ message: 'Failed to load explanations' }}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when empty', async () => {
    const { container } = render(
      <ExplanationHistory
        explanations={[]}
        onSelectExplanation={() => {}}
        onDeleteExplanation={() => {}}
        onClearHistory={() => {}}
        isLoading={false}
        error={null}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
