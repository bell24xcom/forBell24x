import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { UserEngagement, BusinessMetrics, PerformanceMetrics } from '../../services/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
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
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleExport('pdf')}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* User Engagement Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Engagement
              </Typography>
              {userEngagement && (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Session Duration', value: userEngagement.sessionDuration },
                      { name: 'Page Views', value: userEngagement.pageViews },
                      { name: 'Bounce Rate', value: userEngagement.bounceRate },
                      { name: 'Conversion Rate', value: userEngagement.conversionRate }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Business Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Metrics
              </Typography>
              {businessMetrics && (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'RFQ Completion', value: businessMetrics.rfqCompletionRate },
                          { name: 'Response Time', value: businessMetrics.supplierResponseTime },
                          { name: 'Order Value', value: businessMetrics.averageOrderValue },
                          { name: 'Customer Value', value: businessMetrics.customerLifetimeValue }
                        ]}
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
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance
              </Typography>
              {performanceMetrics && (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Response Time', value: performanceMetrics.apiResponseTime },
                      { name: 'Error Rate', value: performanceMetrics.errorRate },
                      { name: 'Uptime', value: performanceMetrics.uptime },
                      { name: 'Throughput', value: performanceMetrics.throughput }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 