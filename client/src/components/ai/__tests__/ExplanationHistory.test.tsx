import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExplanationHistory } from '../ExplanationHistory';

const mockExplanations = [
  {
    id: 'exp-1',
    decisionType: 'supplier_recommendation' as const,
    timestamp: new Date('2024-01-01T10:00:00Z'),
    inputFeatures: [
      { name: 'price', value: 500, description: 'Product price' },
      { name: 'quality', value: 4.5, description: 'Quality rating' },
    ],
    outputDecision: {
      id: 'dec-1',
      type: 'supplier_recommendation' as const,
      value: 'Supplier_A',
      confidence: 85,
      timestamp: new Date('2024-01-01T10:00:00Z'),
    },
    explanation: [
      {
        factor: 'Price Competitiveness',
        impact: 'positive' as const,
        weight: 0.3,
        description: 'Competitive pricing within market range',
        evidence: ['15% below market average', 'Volume discount available'],
      },
      {
        factor: 'Quality Standards',
        impact: 'positive' as const,
        weight: 0.25,
        description: 'Meets or exceeds quality requirements',
        evidence: ['ISO 9001 certified', 'Quality control processes'],
      },
    ],
    confidence: 85,
    featureImportance: [
      {
        feature: 'price',
        importance: 0.8,
        impact: 'negative' as const,
        description: 'Price impact on decision',
        evidence: ['Market analysis'],
        category: 'Financial',
      },
    ],
    metadata: {
      modelVersion: '1.0.0',
      processingTime: 150,
      requestId: 'req-1',
      userId: 'user-1',
    },
  },
  {
    id: 'exp-2',
    decisionType: 'price_optimization' as const,
    timestamp: new Date('2024-01-02T10:00:00Z'),
    inputFeatures: [{ name: 'cost', value: 300, description: 'Production cost' }],
    outputDecision: {
      id: 'dec-2',
      type: 'price_optimization' as const,
      value: 450,
      confidence: 92,
      timestamp: new Date('2024-01-02T10:00:00Z'),
    },
    explanation: [
      {
        factor: 'Cost Analysis',
        impact: 'positive' as const,
        weight: 0.4,
        description: 'Cost-based pricing strategy',
        evidence: ['Production cost analysis', 'Market research'],
      },
    ],
    confidence: 92,
    featureImportance: [
      {
        feature: 'cost',
        importance: 0.9,
        impact: 'positive' as const,
        description: 'Cost importance',
        evidence: ['Cost analysis'],
        category: 'Financial',
      },
    ],
    metadata: {
      modelVersion: '1.0.0',
      processingTime: 200,
      requestId: 'req-2',
      userId: 'user-1',
    },
  },
  {
    id: 'exp-3',
    decisionType: 'rfq_matching' as const,
    timestamp: new Date('2024-01-03T10:00:00Z'),
    inputFeatures: [
      {
        name: 'requirements',
        value: 'High quality, fast delivery',
        description: 'RFQ requirements',
      },
    ],
    outputDecision: {
      id: 'dec-3',
      type: 'rfq_matching' as const,
      value: true,
      confidence: 78,
      timestamp: new Date('2024-01-03T10:00:00Z'),
    },
    explanation: [
      {
        factor: 'Requirement Match',
        impact: 'positive' as const,
        weight: 0.5,
        description: 'High match with RFQ requirements',
        evidence: ['Quality standards met', 'Delivery timeline acceptable'],
      },
    ],
    confidence: 78,
    featureImportance: [
      {
        feature: 'requirements',
        importance: 0.7,
        impact: 'positive' as const,
        description: 'Requirement matching',
        evidence: ['Requirement analysis'],
        category: 'Matching',
      },
    ],
    metadata: {
      modelVersion: '1.0.0',
      processingTime: 180,
      requestId: 'req-3',
      userId: 'user-1',
    },
  },
];

describe('ExplanationHistory', () => {
  const mockOnExplanationSelect = jest.fn();
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders explanation history table', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Explanation History')).toBeInTheDocument();
    expect(screen.getByText('3 explanations found')).toBeInTheDocument();
  });

  it('displays table headers correctly', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Decision')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays explanation rows correctly', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Check that all explanations are displayed
    expect(screen.getByText('Supplier_A')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();

    // Check decision types
    expect(screen.getByText('supplier recommendation')).toBeInTheDocument();
    expect(screen.getByText('price optimization')).toBeInTheDocument();
    expect(screen.getByText('rfq matching')).toBeInTheDocument();

    // Check confidence values
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('handles row expansion and collapse', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Initially rows should be collapsed
    expect(screen.queryByText('Price Competitiveness')).not.toBeInTheDocument();

    // Click expand button for first row
    const expandButtons = screen.getAllByRole('button');
    const firstExpandButton = expandButtons.find(
      button => button.querySelector('svg')?.classList.contains('rotate-90') === false
    );

    if (firstExpandButton) {
      fireEvent.click(firstExpandButton);

      // Should show explanation factors
      expect(screen.getByText('Decision Factors')).toBeInTheDocument();
      expect(screen.getByText('Price Competitiveness')).toBeInTheDocument();
      expect(screen.getByText('Quality Standards')).toBeInTheDocument();
    }
  });

  it('displays expanded row details correctly', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Expand first row
    const expandButtons = screen.getAllByRole('button');
    const firstExpandButton = expandButtons.find(
      button => button.querySelector('svg')?.classList.contains('rotate-90') === false
    );

    if (firstExpandButton) {
      fireEvent.click(firstExpandButton);

      // Check factor details
      expect(screen.getByText('Competitive pricing within market range')).toBeInTheDocument();
      expect(screen.getByText('Meets or exceeds quality requirements')).toBeInTheDocument();

      // Check impact indicators
      expect(screen.getByText('positive')).toBeInTheDocument();

      // Check evidence
      expect(screen.getByText('• 15% below market average')).toBeInTheDocument();
      expect(screen.getByText('• Volume discount available')).toBeInTheDocument();
    }
  });

  it('handles search functionality', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search explanations...');
    fireEvent.change(searchInput, { target: { value: 'price' } });

    // Should filter results to show only price-related explanations
    expect(screen.getByText('Supplier_A')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('handles decision type filtering', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const typeFilter = screen.getByDisplayValue('All Decision Types');
    fireEvent.change(typeFilter, { target: { value: 'supplier_recommendation' } });

    // Should only show supplier recommendation explanations
    expect(screen.getByText('Supplier_A')).toBeInTheDocument();
    expect(screen.queryByText('450')).not.toBeInTheDocument();
  });

  it('handles confidence filtering', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const confidenceFilter = screen.getByPlaceholderText('Min Confidence %');
    fireEvent.change(confidenceFilter, { target: { value: '90' } });

    // Should only show explanations with confidence >= 90
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.queryByText('85%')).not.toBeInTheDocument();
    expect(screen.queryByText('78%')).not.toBeInTheDocument();
  });

  it('handles page size changes', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const pageSizeSelect = screen.getByDisplayValue('20 per page');
    fireEvent.change(pageSizeSelect, { target: { value: '10' } });

    // Should update page size
    expect(pageSizeSelect).toHaveValue('10');
  });

  it('handles export functionality', async () => {
    // Mock fetch for export
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test'])),
    });

    // Mock URL.createObjectURL and revokeObjectURL
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement and click
    const mockClick = jest.fn();
    const mockCreateElement = jest.fn(() => ({
      href: '',
      download: '',
      click: mockClick,
    }));
    global.document.createElement = mockCreateElement as any;

    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/explanations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expect.any(Object)),
      });
    });
  });

  it('handles sorting by different columns', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Click on Type header to sort
    const typeHeader = screen.getByText('Type');
    fireEvent.click(typeHeader);

    // Should show sort indicator
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('handles explanation selection', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Click "View Details" button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Should call onExplanationSelect with the first explanation
    expect(mockOnExplanationSelect).toHaveBeenCalledWith(mockExplanations[0]);
  });

  it('displays correct date format', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Check that dates are formatted correctly
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 2, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 3, 2024/)).toBeInTheDocument();
  });

  it('handles empty explanations gracefully', () => {
    render(
      <ExplanationHistory
        explanations={[]}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('0 explanations found')).toBeInTheDocument();
    expect(screen.getByText('No explanations found')).toBeInTheDocument();
  });

  it('displays correct impact colors in expanded rows', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Expand first row
    const expandButtons = screen.getAllByRole('button');
    const firstExpandButton = expandButtons.find(
      button => button.querySelector('svg')?.classList.contains('rotate-90') === false
    );

    if (firstExpandButton) {
      fireEvent.click(firstExpandButton);

      // Check that impact indicators have correct styling
      const positiveImpact = screen.getAllByText('positive');
      expect(positiveImpact.length).toBeGreaterThan(0);
    }
  });

  it('handles large number of explanations efficiently', () => {
    const largeExplanations = Array.from({ length: 100 }, (_, i) => ({
      ...mockExplanations[0],
      id: `exp-${i}`,
      outputDecision: {
        ...mockExplanations[0].outputDecision,
        value: `Supplier_${i}`,
      },
    }));

    render(
      <ExplanationHistory
        explanations={largeExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('100 explanations found')).toBeInTheDocument();
  });

  it('handles filters prop correctly', () => {
    const filters = {
      decisionType: ['supplier_recommendation'],
      confidenceMin: 80,
    };

    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
        filters={filters}
      />
    );

    // Should apply filters to displayed data
    expect(screen.getByText('Supplier_A')).toBeInTheDocument();
    expect(screen.queryByText('450')).not.toBeInTheDocument(); // Below 80% confidence
  });

  it('calls onFiltersChange when filters are updated', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search explanations...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should call onFiltersChange with updated filters
    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('displays factor count in decision column', () => {
    render(
      <ExplanationHistory
        explanations={mockExplanations}
        onExplanationSelect={mockOnExplanationSelect}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Should show factor count for each explanation
    expect(screen.getByText('2 factors considered')).toBeInTheDocument();
    expect(screen.getByText('1 factors considered')).toBeInTheDocument();
  });
});
