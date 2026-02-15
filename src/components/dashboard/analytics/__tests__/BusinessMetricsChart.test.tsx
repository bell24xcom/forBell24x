import React from 'react';
import { render, screen } from '@testing-library/react';
import { BusinessMetricsChart } from '../BusinessMetricsChart';
import { BusinessMetrics } from '../../types';

describe('BusinessMetricsChart', () => {
  const mockData: BusinessMetrics = {
    rfqCompletionRate: 0.8,
    supplierResponseTime: 24,
    averageOrderValue: 5000,
    customerLifetimeValue: 25000
  };

  it('renders the chart with correct title', () => {
    render(<BusinessMetricsChart data={mockData} />);
    expect(screen.getByText('Business Metrics')).toBeInTheDocument();
  });

  it('renders all data points', () => {
    render(<BusinessMetricsChart data={mockData} />);
    
    // Check if all data points are rendered in the chart
    expect(screen.getByText('RFQ Completion')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Order Value')).toBeInTheDocument();
    expect(screen.getByText('Customer Value')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const customHeight = 400;
    render(<BusinessMetricsChart data={mockData} height={customHeight} />);
    
    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toHaveStyle({ height: `${customHeight}px` });
  });

  it('handles empty data gracefully', () => {
    const emptyData: BusinessMetrics = {
      rfqCompletionRate: 0,
      supplierResponseTime: 0,
      averageOrderValue: 0,
      customerLifetimeValue: 0
    };

    render(<BusinessMetricsChart data={emptyData} />);
    expect(screen.getByText('Business Metrics')).toBeInTheDocument();
  });

  it('displays percentage labels correctly', () => {
    render(<BusinessMetricsChart data={mockData} />);
    
    // Check if percentage labels are displayed
    const labels = screen.getAllByText(/%/);
    expect(labels.length).toBeGreaterThan(0);
  });
}); 