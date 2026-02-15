import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DashboardCard } from '../shared/DashboardCard';
import { ChartContainer } from '../shared/ChartContainer';
import { BusinessMetrics } from '../types';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface BusinessMetricsChartProps {
  data: BusinessMetrics;
  height?: number;
}

export const BusinessMetricsChart: React.FC<BusinessMetricsChartProps> = ({
  data,
  height = 300
}) => {
  const chartData = [
    { name: 'RFQ Completion', value: data.rfqCompletionRate },
    { name: 'Response Time', value: data.supplierResponseTime },
    { name: 'Order Value', value: data.averageOrderValue },
    { name: 'Customer Value', value: data.customerLifetimeValue }
  ];

  return (
    <ErrorBoundary>
      <DashboardCard title="Business Metrics">
        <ChartContainer height={height}>
          <div data-testid="chart-container">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </ChartContainer>
      </DashboardCard>
    </ErrorBoundary>
  );
}; 