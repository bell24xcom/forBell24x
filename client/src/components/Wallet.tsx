'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface WalletData {
  balance: number;
  currency: string;
  dailyLimit: number;
  monthlyLimit: number;
  isVerified: boolean;
  bankAccount?: string;
  bankName?: string;
}

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  gateway?: string;
}

export default function Wallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet');
      const data = await response.json();

      if (data.success) {
        setWalletData(data.data);
      } else {
        setError(data.error || 'Failed to fetch wallet data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet?type=transactions');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  // Handle add funds
  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DEPOSIT',
          amount: parseFloat(amount),
          description: 'Wallet deposit',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAddFundsOpen(false);
        setAmount('');
        fetchWalletData();
        fetchTransactions();
      } else {
        setError(data.error || 'Failed to add funds');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (walletData && parseFloat(amount) > walletData.balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WITHDRAWAL',
          amount: parseFloat(amount),
          description: 'Wallet withdrawal',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWithdrawOpen(false);
        setAmount('');
        fetchWalletData();
        fetchTransactions();
      } else {
        setError(data.error || 'Failed to process withdrawal');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get transaction status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'payment':
        return '💳';
      case 'refund':
        return '↩️';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        💰 Wallet Management
      </Typography>

      {/* Wallet Overview */}
      {walletData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={2}>
                  <Typography variant='h6' sx={{ mr: 1 }}>
                    🏦
                  </Typography>
                  <Typography variant='h6'>Wallet Balance</Typography>
                </Box>
                <Typography variant='h4' color='primary' gutterBottom>
                  {formatCurrency(walletData.balance, walletData.currency)}
                </Typography>
                <Box display='flex' alignItems='center' mb={1}>
                  <Typography variant='body2' color='textSecondary'>
                    Daily Limit: {formatCurrency(walletData.dailyLimit, walletData.currency)}
                  </Typography>
                </Box>
                <Box display='flex' alignItems='center'>
                  <Typography variant='body2' color='textSecondary'>
                    Monthly Limit: {formatCurrency(walletData.monthlyLimit, walletData.currency)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={2}>
                  <Typography variant='h6' sx={{ mr: 1 }}>
                    🔒
                  </Typography>
                  <Typography variant='h6'>Account Status</Typography>
                </Box>
                <Box display='flex' alignItems='center' mb={1}>
                  <Chip
                    label={walletData.isVerified ? 'Verified' : 'Unverified'}
                    color={walletData.isVerified ? 'success' : 'warning'}
                    size='small'
                  />
                </Box>
                {walletData.bankAccount && (
                  <Typography variant='body2' color='textSecondary'>
                    Bank: {walletData.bankName} - {walletData.bankAccount}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Box display='flex' gap={2} sx={{ mb: 3 }}>
        <Button
          variant='contained'
          color='primary'
          startIcon={<span>➕</span>}
          onClick={() => setAddFundsOpen(true)}
        >
          Add Funds
        </Button>
        <Button
          variant='outlined'
          color='primary'
          startIcon={<span>➖</span>}
          onClick={() => setWithdrawOpen(true)}
        >
          Withdraw
        </Button>
        <Button
          variant='outlined'
          startIcon={<span>🔄</span>}
          onClick={() => {
            fetchWalletData();
            fetchTransactions();
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <Box display='flex' alignItems='center' mb={2}>
            <Typography variant='h6' sx={{ mr: 1 }}>
              📊
            </Typography>
            <Typography variant='h6'>Transaction History</Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        <span style={{ marginRight: '8px' }}>
                          {getTransactionIcon(transaction.type)}
                        </span>
                        {transaction.type}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={
                          transaction.type.toLowerCase() === 'deposit'
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {transaction.type.toLowerCase() === 'deposit' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={addFundsOpen} onClose={() => setAddFundsOpen(false)}>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Amount'
            type='number'
            fullWidth
            variant='outlined'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder='Enter amount'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFundsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFunds} disabled={processing}>
            {processing ? 'Processing...' : 'Add Funds'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
        <DialogTitle>Withdraw from Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Amount'
            type='number'
            fullWidth
            variant='outlined'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder='Enter amount'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawOpen(false)}>Cancel</Button>
          <Button onClick={handleWithdrawal} disabled={processing}>
            {processing ? 'Processing...' : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
