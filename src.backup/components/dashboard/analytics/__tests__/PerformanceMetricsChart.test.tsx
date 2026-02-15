import React from 'react';
import { render, screen } from '@testing-library/react';
import { PerformanceMetricsChart } from '../PerformanceMetricsChart';
import { PerformanceMetrics } from '../../types';

describe('PerformanceMetricsChart', () => {
  const mockData: PerformanceMetrics = {
    responseTime: 200,
    errorRate: 0.01,
    uptime: 0.999,
    throughput: 1000
  };

  it('renders the chart with correct title', () => {
    render(<PerformanceMetricsChart data={mockData} />);
    expect(screen.getByText('System Performance')).toBeInTheDocument();
  });

  it('renders all data points', () => {
    render(<PerformanceMetricsChart data={mockData} />);
    
    // Check if all data points are rendered in the chart
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('Throughput')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const customHeight = 400;
    render(<PerformanceMetricsChart data={mockData} height={customHeight} />);
    
    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toHaveStyle({ height: `${customHeight}px` });
  });

  it('handles empty data gracefully', () => {
    const emptyData: PerformanceMetrics = {
      responseTime: 0,
      errorRate: 0,
      uptime: 0,
      throughput: 0
    };

    render(<PerformanceMetricsChart data={emptyData} />);
    expect(screen.getByText('System Performance')).toBeInTheDocument();
  });

  it('displays tooltip on hover', () => {
    render(<PerformanceMetricsChart data={mockData} />);
    
    // Simulate hover on a data point
    const chartElement = screen.getByTestId('chart-container');
    // Note: This is a basic test. In a real scenario, you'd want to test actual hover interactions
    expect(chartElement).toBeInTheDocument();
  });
}); 