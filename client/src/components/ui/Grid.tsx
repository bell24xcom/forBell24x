import React from 'react';
import { Grid as MuiGrid, GridProps } from '@mui/material';

interface CustomGridProps extends Omit<GridProps, 'component'> {
  children: React.ReactNode;
}

export const Grid: React.FC<CustomGridProps> = ({ children, ...props }) => {
  return <MuiGrid {...props}>{children}</MuiGrid>;
};

export default Grid;
