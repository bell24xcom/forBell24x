import React from 'react';
import { Box } from '@mui/material';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  children: React.ReactNode;
  height?: number | string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height = 300
}) => {
  return (
    <Box height={height}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  );
}; 