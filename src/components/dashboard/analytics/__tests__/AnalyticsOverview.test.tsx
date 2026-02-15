import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyticsOverview } from '../AnalyticsOverview';
import { analyticsService } from '../../../../services/analytics/AnalyticsService';

// Mock the analytics service
jest.mock('../../../../services/analytics/AnalyticsService', () => ({
  analyticsService: {
    getUserEngagement: jest.fn(),
    generateBusinessReports: jest.fn(),
    monitorSystemHealth: jest.fn(),
    exportAnalytics: jest.fn()
  }
}));

describe('AnalyticsOverview', () => {
  const mockUserEngagement = {
    sessionDuration: 300,
    pageViews: 1000,
    bounceRate: 0.3,
    conversionRate: 0.1
  };

  const mockBusinessMetrics = {
    rfqCompletionRate: 0.8,
    supplierResponseTime: 24,
    averageOrderValue: 5000,
    customerLifetimeValue: 25000
  };

  const mockPerformanceMetrics = {
    responseTime: 200,
    errorRate: 0.01,
    uptime: 0.999,
    throughput: 1000
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock implementations
    (analyticsService.getUserEngagement as jest.Mock).mockResolvedValue(mockUserEngagement);
    (analyticsService.generateBusinessReports as jest.Mock).mockResolvedValue(mockBusinessMetrics);
    (analyticsService.monitorSystemHealth as jest.Mock).mockResolvedValue(mockPerformanceMetrics);
    (analyticsService.exportAnalytics as jest.Mock).mockResolvedValue(new Blob(['test data']));
  });

  it('renders loading state initially', () => {
    render(<AnalyticsOverview />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when data fetching fails', async () => {
    (analyticsService.getUserEngagement as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    render(<AnalyticsOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch analytics data')).toBeInTheDocument();
    });
  });

  it('renders all charts when data is loaded successfully', async () => {
    render(<AnalyticsOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('User Engagement')).toBeInTheDocument();
      expect(screen.getByText('Business Metrics')).toBeInTheDocument();
      expect(screen.getByText('System Performance')).toBeInTheDocument();
    });
  });

  it('changes time range when selector is used', async () => {
    render(<AnalyticsOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Time Range')).toBeInTheDocument();
    });

    const timeRangeSelector = screen.getByLabelText('Time Range');
    await userEvent.click(timeRangeSelector);
    
    const option = screen.getByText('Last 30 Days');
    await userEvent.click(option);

    expect(analyticsService.getUserEngagement).toHaveBeenCalledTimes(2);
  });

  it('handles export functionality', async () => {
    render(<AnalyticsOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export PDF');
    await userEvent.click(exportButton);

    expect(analyticsService.exportAnalytics).toHaveBeenCalledWith('pdf');
  });
}); 