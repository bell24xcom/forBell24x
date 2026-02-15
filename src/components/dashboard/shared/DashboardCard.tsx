import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  height = 300
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box height={height}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}; 