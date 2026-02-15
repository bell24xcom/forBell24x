import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserEngagementChart } from '../UserEngagementChart';
import { UserEngagement } from '../../types';

describe('UserEngagementChart', () => {
  const mockData: UserEngagement = {
    sessionDuration: 300,
    pageViews: 1000,
    bounceRate: 0.3,
    conversionRate: 0.1
  };

  it('renders the chart with correct title', () => {
    render(<UserEngagementChart data={mockData} />);
    expect(screen.getByText('User Engagement')).toBeInTheDocument();
  });

  it('renders all data points', () => {
    render(<UserEngagementChart data={mockData} />);
    
    // Check if all data points are rendered in the chart
    expect(screen.getByText('Session Duration')).toBeInTheDocument();
    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const customHeight = 400;
    render(<UserEngagementChart data={mockData} />);
    
    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toHaveStyle({ height: `${customHeight}px` });
  });

  it('handles empty data gracefully', () => {
    const emptyData: UserEngagement = {
      sessionDuration: 0,
      pageViews: 0,
      bounceRate: 0,
      conversionRate: 0
    };

    render(<UserEngagementChart data={emptyData} />);
    expect(screen.getByText('User Engagement')).toBeInTheDocument();
  });
}); 