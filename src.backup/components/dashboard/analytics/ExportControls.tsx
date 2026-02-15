import React from 'react';
import { Button, Box } from '@mui/material';
import { ExportFormat } from '../types';

const EXPORT_FORMATS: ExportFormat[] = [
  { type: 'pdf', label: 'Export PDF' },
  { type: 'csv', label: 'Export CSV' }
];

interface ExportControlsProps {
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ onExport }) => {
  return (
    <Box>
      {EXPORT_FORMATS.map((format, index) => (
        <Button
          key={format.type}
          variant={index === 0 ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onExport(format.type)}
          sx={{ mr: index === 0 ? 1 : 0 }}
        >
          {format.label}
        </Button>
      ))}
    </Box>
  );
}; 