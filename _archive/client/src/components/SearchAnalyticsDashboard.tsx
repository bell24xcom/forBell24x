import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { SearchAnalytics, searchAnalyticsService } from '../services/search/SearchAnalyticsService';
// import {
//   LineChart,
//   PieChart
// } from '@mui/x-charts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SearchAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState('searches');
  const [searchHistory, setSearchHistory] = useState<SearchAnalytics[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('7d');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const loadStats = () => {
      setLoading(true);
      const analyticsStats = searchAnalyticsService.getSearchStats();
      setStats(analyticsStats);
      setLoading(false);
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [history, stats] = await Promise.all([
          searchAnalyticsService.getSearchHistory('current-user'),
          searchAnalyticsService.getSearchStats(),
        ]);
        setSearchHistory(history);
        setPopularSearches(stats.mostPopularSearches.map(s => s.query));
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const handleMetricChange = (event: any) => {
    setSelectedMetric(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const searchTypeData = [
    { name: 'Categories', value: stats.searchByType.category },
    { name: 'Subcategories', value: stats.searchByType.subcategory },
    { name: 'RFQs', value: stats.searchByType.rfq },
  ];

  // Generate time series data
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    searches: Math.floor(Math.random() * 100),
    results: Math.floor(Math.random() * 200),
    success: Math.floor(Math.random() * 80),
  }));

  // Generate heat map data
  const heatMapData = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      value: Math.floor(Math.random() * 100),
    }))
  ).flat();

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        Search Analytics Dashboard
      </Typography>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Search Distribution
            </Typography>
            {/* <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: 35, label: 'Electronics' },
                    { id: 1, value: 25, label: 'Textiles' },
                    { id: 2, value: 20, label: 'Machinery' },
                    { id: 3, value: 20, label: 'Others' },
                  ],
                },
              ]}
              height={300}
              slotProps={{
                legend: {
                  position: { vertical: 'bottom', horizontal: 'center' },
                },
              }}
            /> */}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Search Trends
            </Typography>
            {/* <LineChart
              xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], scaleType: 'band' }]}
              series={[
                {
                  data: [2, 5.5, 2, 8.5, 1.5, 5],
                  area: true,
                },
              ]}
              height={300}
            /> */}
          </CardContent>
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Popular Searches
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {popularSearches.map((search, index) => (
                <Chip key={index} label={search} variant='outlined' />
              ))}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Search Filters
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                label='Date Range'
              >
                <MenuItem value='1d'>Last 24 hours</MenuItem>
                <MenuItem value='7d'>Last 7 days</MenuItem>
                <MenuItem value='30d'>Last 30 days</MenuItem>
                <MenuItem value='90d'>Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Recent Search History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Query</TableCell>
                  <TableCell>Results</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchHistory.map((search, index) => (
                  <TableRow key={index}>
                    <TableCell>{search.query}</TableCell>
                    <TableCell>{search.results}</TableCell>
                    <TableCell>{new Date(search.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{search.duration.toFixed(2)}s</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Total Searches
              </Typography>
              <Typography variant='h4'>{stats.totalSearches.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Average Results per Search
              </Typography>
              <Typography variant='h4'>{stats.averageResultsPerSearch.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Search Success Rate
              </Typography>
              <Typography variant='h4'>
                {((stats.mostSelectedResults.length / stats.totalSearches) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Average Search Time
              </Typography>
              <Typography variant='h4'>{Math.floor(Math.random() * 5) + 1}s</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor='primary'
                textColor='primary'
              >
                <Tab label='Search Trends' />
                <Tab label='Popular Searches' />
                <Tab label='Search Types' />
                <Tab label='Time Analysis' />
              </Tabs>
            </Box>
            <Box
              sx={{
                flex: '1 1 300px',
                minWidth: 0,
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select value={timeRange} label='Time Range' onChange={handleTimeRangeChange}>
                  <MenuItem value='day'>Last 24 Hours</MenuItem>
                  <MenuItem value='week'>Last Week</MenuItem>
                  <MenuItem value='month'>Last Month</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Metric</InputLabel>
                <Select value={selectedMetric} label='Metric' onChange={handleMetricChange}>
                  <MenuItem value='searches'>Searches</MenuItem>
                  <MenuItem value='results'>Results</MenuItem>
                  <MenuItem value='success'>Success Rate</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 400 }}>
            {/* <LineChart
              xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], scaleType: 'band' }]}
              series={[
                {
                  data: [2, 5.5, 2, 8.5, 1.5, 5],
                  area: true,
                },
              ]}
              height={300}
            /> */}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Search Query</TableCell>
                  <TableCell align='right'>Count</TableCell>
                  <TableCell align='right'>Success Rate</TableCell>
                  <TableCell align='right'>Avg. Results</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.mostPopularSearches.map((search: any) => (
                  <TableRow key={search.query}>
                    <TableCell component='th' scope='row'>
                      {search.query}
                    </TableCell>
                    <TableCell align='right'>{search.count}</TableCell>
                    <TableCell align='right'>
                      {((search.count / stats.totalSearches) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell align='right'>{Math.floor(Math.random() * 20) + 1}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              {/* <PieChart
                series={[
                  {
                    data: searchTypeData,
                  },
                ]}
                height={300}
                slotProps={{
                  legend: {
                    position: { vertical: 'bottom', horizontal: 'center' },
                  },
                }}
              /> */}
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              {/* <LineChart
                xAxis={[{ data: searchTypeData.map(d => d.name), scaleType: 'band' }]}
                series={[
                  {
                    data: searchTypeData.map(d => d.value),
                    area: true,
                  },
                ]}
                height={300}
              /> */}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ height: 400 }}>
            {/* <LineChart
              xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], scaleType: 'band' }]}
              series={[
                {
                  data: [2, 5.5, 2, 8.5, 1.5, 5],
                  area: true,
                },
              ]}
              height={300}
            /> */}
          </Box>
        </TabPanel>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Search Performance Metrics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Box sx={{ height: 300 }}>
              {/* <LineChart
                xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], scaleType: 'band' }]}
                series={[
                  {
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                    area: true,
                  },
                ]}
                height={300}
              /> */}
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Box sx={{ height: 300 }}>
              {/* <LineChart
                xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], scaleType: 'band' }]}
                series={[
                  {
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                    area: true,
                  },
                ]}
                height={300}
              /> */}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SearchAnalyticsDashboard;
