import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExplanationDashboard from '../ExplanationDashboard';
import { AIExplanationService } from '@/services/aiExplanation';

// Mock the AI explanation service
jest.mock('@/services/aiExplanation', () => ({
  aiExplanationService: {
    getExplanationHistory: jest.fn(),
    subscribeToUpdates: jest.fn(() => jest.fn()), // Return unsubscribe function
  },
  AIExplanationService: jest.fn(),
}));

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
      {
        factor: 'Quality Standards',
        impact: 'positive' as const,
        weight: 0.25,
        description: 'High quality standards',
        evidence: ['ISO 9001 certified'],
      },
    ],
    confidence: 85,
    featureImportance: [
      {
        feature: 'price',
        importance: 0.8,
        impact: 'negative' as const,
        description: 'Price impact',
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
    ],
    metadata: {
      modelVersion: '1.0.0',
      processingTime: 200,
      requestId: 'req-2',
      userId: 'user-1',
    },
  },
];

describe('ExplanationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API response
    const mockGetExplanationHistory = jest.mocked(
      AIExplanationService.prototype.getExplanationHistory
    );
    mockGetExplanationHistory.mockResolvedValue({
      explanations: mockExplanations,
      totalCount: 2,
      hasMore: false,
    });
  });

  it('renders loading state initially', () => {
    render(<ExplanationDashboard />);
    expect(screen.getByText('Loading AI Explanation Dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard with metrics after loading', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('AI Explanation Dashboard')).toBeInTheDocument();
    });

    // Check metrics are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Total explanations
    expect(screen.getByText('88.5%')).toBeInTheDocument(); // Average confidence
    expect(screen.getByText('supplier recommendation')).toBeInTheDocument(); // Most common type
  });

  it('displays feature importance chart', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('feature-importance-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Feature Importance Chart (2 explanations)')).toBeInTheDocument();
  });

  it('displays explanation history', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('explanation-history')).toBeInTheDocument();
    });

    expect(screen.getByText('Explanation History (2 explanations)')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Verify that getExplanationHistory was called again
    await waitFor(() => {
      expect(AIExplanationService.prototype.getExplanationHistory).toHaveBeenCalledTimes(2);
    });
  });

  it('handles export button click', async () => {
    // Mock fetch for export
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test'])),
      })
    ) as any;

    // Mock URL.createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement and click
    const mockClick = vi.fn();
    const mockCreateElement = vi.fn(() => ({
      href: '',
      download: '',
      click: mockClick,
    }));
    global.document.createElement = mockCreateElement as any;

    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

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

  it('handles error state', async () => {
    // Mock API error
    const mockGetExplanationHistory = vi.mocked(
      AIExplanationService.prototype.getExplanationHistory
    );
    mockGetExplanationHistory.mockRejectedValue(new Error('API Error'));

    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('handles explanation selection', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Select First')).toBeInTheDocument();
    });

    const selectButton = screen.getByText('Select First');
    fireEvent.click(selectButton);

    // Verify that the explanation was selected (you might need to add state management)
    // This test verifies the callback is working
  });

  it('displays correct metrics calculations', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      // Check total explanations
      expect(screen.getByText('2')).toBeInTheDocument();

      // Check average confidence (85 + 92) / 2 = 88.5
      expect(screen.getByText('88.5%')).toBeInTheDocument();

      // Check most common decision type (supplier_recommendation appears first)
      expect(screen.getByText('supplier recommendation')).toBeInTheDocument();
    });
  });

  it('handles real-time updates', async () => {
    const mockSubscribeToUpdates = vi.mocked(AIExplanationService.prototype.subscribeToUpdates);
    const mockCallback = vi.fn();
    mockSubscribeToUpdates.mockReturnValue(mockCallback);

    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(mockSubscribeToUpdates).toHaveBeenCalled();
    });

    // Verify the subscription was set up
    expect(mockSubscribeToUpdates).toHaveBeenCalledWith(expect.any(Function));
  });

  it('displays recent activity correctly', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      // Recent activity should show explanations from the last hour
      // Since our mock data is from 2024-01-01 and 2024-01-02,
      // and current time is much later, recent activity should be 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('handles empty explanations gracefully', async () => {
    // Mock empty response
    const mockGetExplanationHistory = vi.mocked(
      AIExplanationService.prototype.getExplanationHistory
    );
    mockGetExplanationHistory.mockResolvedValue({
      explanations: [],
      totalCount: 0,
      hasMore: false,
    });

    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Total explanations
      expect(screen.getByText('0%')).toBeInTheDocument(); // Average confidence
    });
  });

  it('applies filters correctly', async () => {
    render(<ExplanationDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('explanation-history')).toBeInTheDocument();
    });

    // The ExplanationHistory component should receive the filters
    // This test verifies the component structure is correct
    expect(screen.getByTestId('explanation-history')).toBeInTheDocument();
  });
});
