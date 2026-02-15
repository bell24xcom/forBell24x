import React from 'react';
import renderer from 'react-test-renderer';
import ExplanationHistory from '../ExplanationHistory'; // Adjust path if necessary

// Mock any necessary props or context if the component requires them
const mockExplanations = [
  {
    id: '1',
    timestamp: '2023-01-01T12:00:00.000Z', // Use fixed date for consistent snapshots
    query: 'Sample query 1',
    explanation: { summary: 'Sample explanation summary 1', details: 'Details 1' },
    feedback: { rating: 5, comments: 'Great!' },
    modelUsed: 'test-model-v1',
    parameters: { temperature: 0.7 },
  },
  {
    id: '2',
    timestamp: '2023-01-02T12:00:00.000Z', // Use fixed date for consistent snapshots
    query: 'Sample query 2',
    explanation: { summary: 'Sample explanation summary 2', details: 'Details 2' },
    feedback: null,
    modelUsed: 'test-model-v2',
    parameters: { temperature: 0.5 },
  },
];

// Mock functions
const mockOnSelectExplanation = jest.fn();
const mockOnDeleteExplanation = jest.fn();
const mockOnClearHistory = jest.fn();

describe('ExplanationHistory Snapshot Tests', () => {
  it('renders correctly with mock data', () => {
    const tree = renderer
      .create(
        <ExplanationHistory
          explanations={mockExplanations}
          onSelectExplanation={mockOnSelectExplanation}
          onDeleteExplanation={mockOnDeleteExplanation}
          onClearHistory={mockOnClearHistory}
          isLoading={false}
          error={null}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly in loading state', () => {
    const tree = renderer
      .create(
        <ExplanationHistory
          explanations={[]}
          onSelectExplanation={mockOnSelectExplanation}
          onDeleteExplanation={mockOnDeleteExplanation}
          onClearHistory={mockOnClearHistory}
          isLoading={true}
          error={null}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly in error state', () => {
    const tree = renderer
      .create(
        <ExplanationHistory
          explanations={[]}
          onSelectExplanation={mockOnSelectExplanation}
          onDeleteExplanation={mockOnDeleteExplanation}
          onClearHistory={mockOnClearHistory}
          isLoading={false}
          error={{ message: 'Failed to load explanations' }}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when empty', () => {
    const tree = renderer
      .create(
        <ExplanationHistory
          explanations={[]}
          onSelectExplanation={mockOnSelectExplanation}
          onDeleteExplanation={mockOnDeleteExplanation}
          onClearHistory={mockOnClearHistory}
          isLoading={false}
          error={null}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
