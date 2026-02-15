import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DashboardCard } from '../shared/DashboardCard';
import { ChartContainer } from '../shared/ChartContainer';
import { UserEngagement } from '../types';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface UserEngagementChartProps {
  data: UserEngagement;
  height?: number;
}

export const UserEngagementChart: React.FC<UserEngagementChartProps> = ({
  data,
  height = 300
}) => {
  const chartData = [
    { name: 'Session Duration', value: data.sessionDuration },
    { name: 'Page Views', value: data.pageViews },
    { name: 'Bounce Rate', value: data.bounceRate },
    { name: 'Conversion Rate', value: data.conversionRate }
  ];

  return (
    <ErrorBoundary>
      <DashboardCard title="User Engagement">
        <ChartContainer height={height}>
          <div data-testid="chart-container">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        </ChartContainer>
      </DashboardCard>
    </ErrorBoundary>
  );
}; 