'use client';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface TestResult {
  test_name: string;
  success: boolean;
  result: any;
  timestamp: string;
}

interface TestReport {
  summary: {
    total_tests: number;
    passed: number;
    failed: number;
    success_rate: string;
  };
  details: TestResult[];
  timestamp: string;
  environment: string;
  marketplace: string;
}

export default function PaymentTest() {
  const [testType, setTestType] = useState('all');
  const [amount, setAmount] = useState(TEST_AMOUNTS.SMALL.toString());
  const [currency, setCurrency] = useState('INR');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [report, setReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('');

  // Run comprehensive payment tests
  const runPaymentTests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/test?type=${testType}`);
      const data = await response.json();

      if (data.success) {
        setReport(data.report);
        setTestResults(data.report.details);
      } else {
        setError(data.error || 'Payment testing failed');
      }
    } catch (error) {
      setError('Network error occurred during testing');
      console.error('Payment testing error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create specific test payment
  const createTestPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency,
          testType: selectedScenario || 'payment',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add to test results
        const newResult: TestResult = {
          test_name: `Custom Payment Test - ₹${amount}`,
          success: data.result.success,
          result: data.result,
          timestamp: data.timestamp,
        };

        setTestResults(prev => [newResult, ...prev]);
        setError(null);
      } else {
        setError(data.error || 'Test payment creation failed');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Test payment creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get status color for chips
  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          Payment Testing Dashboard
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Test RazorpayX integration for Bell24H B2B marketplace transactions
        </Typography>
      </Box>

      {/* Test Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Test Configuration
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={testType}
                  onChange={e => setTestType(e.target.value)}
                  label='Test Type'
                >
                  <MenuItem value='all'>All Tests</MenuItem>
                  <MenuItem value='payment'>Payment Only</MenuItem>
                  <MenuItem value='wallet'>Wallet Operations</MenuItem>
                  <MenuItem value='escrow'>Escrow Operations</MenuItem>
                  <MenuItem value='scenarios'>Payment Scenarios</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Amount (₹)'
                type='number'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                inputProps={{
                  min: TEST_AMOUNTS.MIN,
                  max: TEST_AMOUNTS.MAX,
                }}
                helperText={`Min: ₹${TEST_AMOUNTS.MIN}, Max: ₹${TEST_AMOUNTS.MAX}`}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  label='Currency'
                >
                  <MenuItem value='INR'>INR (₹)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Test Scenario</InputLabel>
                <Select
                  value={selectedScenario}
                  onChange={e => setSelectedScenario(e.target.value)}
                  label='Test Scenario'
                >
                  <MenuItem value=''>Custom Amount</MenuItem>
                  {PAYMENT_TEST_SCENARIOS.map(scenario => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.name} - {formatCurrency(scenario.amount)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              startIcon={<PlayArrow />}
              onClick={runPaymentTests}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Run Tests'}
            </Button>

            <Button
              variant='outlined'
              startIcon={<Payment />}
              onClick={createTestPayment}
              disabled={loading || !amount}
            >
              Create Test Payment
            </Button>

            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={() => {
                setTestResults([]);
                setReport(null);
                setError(null);
              }}
            >
              Clear Results
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Test Report Summary */}
      {report && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Test Report Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box textAlign='center'>
                  <Typography variant='h4' color='primary'>
                    {report.summary.total_tests}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Total Tests
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box textAlign='center'>
                  <Typography variant='h4' color='success.main'>
                    {report.summary.passed}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Passed
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box textAlign='center'>
                  <Typography variant='h4' color='error.main'>
                    {report.summary.failed}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Failed
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box textAlign='center'>
                  <Typography variant='h4' color='info.main'>
                    {report.summary.success_rate}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Success Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='textSecondary'>
                Environment: {report.environment} | Marketplace: {report.marketplace} | Timestamp:{' '}
                {new Date(report.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Test Results ({testResults.length})
            </Typography>

            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant='body2'>{result.test_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={result.success ? <CheckCircle /> : <Error />}
                          label={result.success ? 'Passed' : 'Failed'}
                          color={getStatusColor(result.success)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {result.result?.amount
                          ? formatCurrency(result.result.amount / 100, 'INR')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='textSecondary'>
                          {result.success
                            ? `Order ID: ${result.result?.order_id || 'N/A'}`
                            : result.result?.error || 'Unknown error'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='textSecondary'>
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Test Scenarios Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Available Test Scenarios
          </Typography>

          <Grid container spacing={2}>
            {PAYMENT_TEST_SCENARIOS.map(scenario => (
              <Grid item xs={12} md={6} key={scenario.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Typography variant='subtitle1' sx={{ flexGrow: 1 }}>
                        {scenario.name}
                      </Typography>
                      <Chip label={formatCurrency(scenario.amount)} color='primary' size='small' />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='textSecondary'>
                      {scenario.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={scenario.category} variant='outlined' size='small' />
                      <Chip label={scenario.trend} color='success' size='small' sx={{ ml: 1 }} />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
