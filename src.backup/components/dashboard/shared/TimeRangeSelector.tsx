import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export type TimeRange = '24h' | '7d' | '30d' | '90d';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel>Time Range</InputLabel>
      <Select
        value={value}
        label="Time Range"
        onChange={(e) => onChange(e.target.value as TimeRange)}
      >
        <MenuItem value="24h">Last 24 Hours</MenuItem>
        <MenuItem value="7d">Last 7 Days</MenuItem>
        <MenuItem value="30d">Last 30 Days</MenuItem>
        <MenuItem value="90d">Last 90 Days</MenuItem>
      </Select>
    </FormControl>
  );
}; 