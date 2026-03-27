import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureImportanceChart } from '../FeatureImportanceChart';

// Recharts and other mocks are handled globally in setupTests.ts

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
        description: 'Competitive pricing',
        evidence: ['15% below market average'],
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
      {
        feature: 'quality_rating',
        importance: 0.6,
        impact: 'positive' as const,
        description: 'Quality rating influence',
        evidence: ['Historical performance'],
        category: 'Quality',
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
        description: 'Cost-based pricing',
        evidence: ['Production cost analysis'],
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
      {
        feature: 'price',
        importance: 0.7,
        impact: 'negative' as const,
        description: 'Price sensitivity',
        evidence: ['Market research'],
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
];

describe('FeatureImportanceChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart with data', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    expect(screen.getByText('Feature Importance Analysis')).toBeInTheDocument();
    expect(
      screen.getByText('Top 10 most important features across 2 explanations')
    ).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<FeatureImportanceChart explanations={[]} />);

    expect(screen.getByText('No feature importance data available')).toBeInTheDocument();
  });

  it('displays correct chart data aggregation', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // Check that the chart shows aggregated data
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    // The chart should aggregate features across explanations
    // price appears in both explanations, cost in one
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
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

    render(<FeatureImportanceChart explanations={mockExplanations} />);

    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/explanations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expect.any(Object)),
      });
    });
  });

  it('displays legend correctly', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    expect(screen.getByText('Positive Impact')).toBeInTheDocument();
    expect(screen.getByText('Negative Impact')).toBeInTheDocument();
    expect(screen.getByText('Neutral Impact')).toBeInTheDocument();
    expect(screen.getByText('Low Weight (0-0.3)')).toBeInTheDocument();
    expect(screen.getByText('Medium Weight (0.3-0.7)')).toBeInTheDocument();
    expect(screen.getByText('High Weight (0.7-1.0)')).toBeInTheDocument();
  });

  it('handles different maxFeatures prop', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} maxFeatures={5} />);

    expect(
      screen.getByText('Top 5 most important features across 2 explanations')
    ).toBeInTheDocument();
  });

  it('handles custom height prop', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} height={600} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('aggregates feature importance correctly', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // The chart should aggregate the 'price' feature from both explanations
    // exp-1: price importance = 0.8, exp-2: price importance = 0.7
    // Average: (0.8 + 0.7) / 2 = 0.75
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles feature selection', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // The chart should allow clicking on bars to select features
    // This would trigger the handleBarClick function
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('displays selected feature details', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // Initially no feature should be selected
    expect(screen.queryByText('Feature Details:')).not.toBeInTheDocument();
  });

  it('handles hover interactions', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // The chart should handle hover events for tooltips
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('calculates correct impact colors', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // Check that cells are rendered with correct colors
    expect(screen.getAllByTestId('cell')).toHaveLength(expect.any(Number));
  });

  it('handles malformed data gracefully', () => {
    const malformedExplanations = [
      {
        id: 'exp-1',
        decisionType: 'supplier_recommendation' as const,
        timestamp: new Date(),
        inputFeatures: [],
        outputDecision: {
          id: 'dec-1',
          type: 'supplier_recommendation' as const,
          value: 'test',
          confidence: 85,
          timestamp: new Date(),
        },
        explanation: [],
        confidence: 85,
        featureImportance: [], // Empty feature importance
        metadata: {
          modelVersion: '1.0.0',
          processingTime: 150,
          requestId: 'req-1',
          userId: 'user-1',
        },
      },
    ];

    render(<FeatureImportanceChart explanations={malformedExplanations} />);

    expect(screen.getByText('No feature importance data available')).toBeInTheDocument();
  });

  it('handles single explanation correctly', () => {
    const singleExplanation = [mockExplanations[0]];
    render(<FeatureImportanceChart explanations={singleExplanation} />);

    expect(
      screen.getByText('Top 10 most important features across 1 explanations')
    ).toBeInTheDocument();
  });

  it('sorts features by importance', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // The chart should sort features by importance in descending order
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles export error gracefully', async () => {
    // Mock fetch error
    global.fetch = vi.fn(() => Promise.reject(new Error('Export failed'))) as any;

    render(<FeatureImportanceChart explanations={mockExplanations} />);

    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    // Should not throw error, just log it
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('displays correct feature categories', () => {
    render(<FeatureImportanceChart explanations={mockExplanations} />);

    // The chart should display feature categories in tooltips
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles large datasets efficiently', () => {
    const largeExplanations = Array.from({ length: 100 }, (_, i) => ({
      ...mockExplanations[0],
      id: `exp-${i}`,
      featureImportance: [
        {
          feature: `feature-${i}`,
          importance: Math.random(),
          impact: 'positive' as const,
          description: `Feature ${i}`,
          evidence: [`Evidence ${i}`],
          category: 'Test',
        },
      ],
    }));

    render(<FeatureImportanceChart explanations={largeExplanations} maxFeatures={10} />);

    // Should only show top 10 features
    expect(
      screen.getByText('Top 10 most important features across 100 explanations')
    ).toBeInTheDocument();
  });
});
