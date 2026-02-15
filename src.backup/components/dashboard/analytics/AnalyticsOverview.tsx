'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { TimeRangeSelector, TimeRange } from '../shared/TimeRangeSelector';
import { UserEngagementChart } from './UserEngagementChart';
import { BusinessMetricsChart } from './BusinessMetricsChart';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { ExportControls } from './ExportControls';
import { UserEngagement, BusinessMetrics, PerformanceMetrics } from '../types';
import { analyticsService } from '../../../services/analytics/AnalyticsService';

export const AnalyticsOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [engagement, business, performance] = await Promise.all([
        analyticsService.getUserEngagement('all'),
        analyticsService.generateBusinessReports(),
        analyticsService.monitorSystemHealth()
      ]);

      setUserEngagement(engagement);
      setBusinessMetrics(business);
      setPerformanceMetrics(performance);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      const data = await analyticsService.exportAnalytics(format);
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting analytics:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Box display="flex" alignItems="center">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <Box ml={2}>
            <ExportControls onExport={handleExport} />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {userEngagement && (
          <Grid item xs={12} md={6}>
            <UserEngagementChart data={userEngagement} />
          </Grid>
        )}
        {businessMetrics && (
          <Grid item xs={12} md={6}>
            <BusinessMetricsChart data={businessMetrics} />
          </Grid>
        )}
        {performanceMetrics && (
          <Grid item xs={12}>
            <PerformanceMetricsChart data={performanceMetrics} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}; 