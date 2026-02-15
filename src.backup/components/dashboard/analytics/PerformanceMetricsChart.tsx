import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DashboardCard } from '../shared/DashboardCard';
import { ChartContainer } from '../shared/ChartContainer';
import { PerformanceMetrics } from '../types';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface PerformanceMetricsChartProps {
  data: PerformanceMetrics;
  height?: number;
}

export const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  data,
  height = 300
}) => {
  const chartData = [
    { name: 'Response Time', value: data.responseTime },
    { name: 'Error Rate', value: data.errorRate },
    { name: 'Uptime', value: data.uptime },
    { name: 'Throughput', value: data.throughput }
  ];

  return (
    <ErrorBoundary>
      <DashboardCard title="System Performance">
        <ChartContainer height={height}>
          <div data-testid="chart-container">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </div>
        </ChartContainer>
      </DashboardCard>
    </ErrorBoundary>
  );
}; 