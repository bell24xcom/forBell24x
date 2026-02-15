import React from 'react';

export const BarChart = ({ children }: { children: React.ReactNode }) => (
  <div data-testid='bar-chart'>{children}</div>
);

export const Bar = ({ dataKey, children }: { dataKey: string; children: React.ReactNode }) => (
  <div data-testid={`bar-${dataKey}`}>{children}</div>
);

export const XAxis = ({ dataKey }: { dataKey: string }) => (
  <div data-testid={`x-axis-${dataKey}`}>X-Axis: {dataKey}</div>
);

export const YAxis = ({ label }: { label: any }) => <div data-testid='y-axis'>{label?.value}</div>;

export const CartesianGrid = () => <div data-testid='cartesian-grid' />;

export const Tooltip = ({ content }: { content: any }) => (
  <div data-testid='tooltip'>{content && 'Custom Tooltip'}</div>
);

export const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid='responsive-container'>{children}</div>
);

export const Cell = ({ fill }: { fill: string }) => (
  <div data-testid='cell' style={{ backgroundColor: fill }} />
);

export const LineChart = ({ children }: { children: React.ReactNode }) => (
  <div data-testid='line-chart'>{children}</div>
);

export const Line = ({ dataKey }: { dataKey: string }) => <div data-testid={`line-${dataKey}`} />;

export const PieChart = ({ children }: { children: React.ReactNode }) => (
  <div data-testid='pie-chart'>{children}</div>
);

export const Pie = ({ dataKey }: { dataKey: string }) => <div data-testid={`pie-${dataKey}`} />;
