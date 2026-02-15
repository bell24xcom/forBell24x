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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface EscrowData {
  id: string;
  rfqId: string;
  buyerId: string;
  supplierId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'disputed';
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  dueDate: string;
  completedDate?: string;
}

interface Dispute {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export default function EscrowSystem() {
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createEscrowOpen, setCreateEscrowOpen] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowData | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [rfqId, setRfqId] = useState('');
  const [amount, setAmount] = useState('');
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>([
    { name: '', description: '', amount: 0, percentage: 0 },
  ]);

  // Fetch escrow data
  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/escrow');
      const data = await response.json();

      if (data.success) {
        setEscrows(data.data);
      } else {
        setError(data.error || 'Failed to fetch escrow data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, []);

  // Handle create escrow
  const handleCreateEscrow = async () => {
    if (!rfqId || !amount || milestones.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId,
          amount: parseFloat(amount),
          milestones: milestones.filter(m => m.name && (m.amount || 0) > 0),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCreateEscrowOpen(false);
        resetForm();
        fetchEscrows();
      } else {
        setError(data.error || 'Failed to create escrow');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Handle milestone completion
  const handleMilestoneComplete = async (escrowId: string, milestoneId: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/escrow/${escrowId}/milestone/${milestoneId}/complete`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        fetchEscrows();
      } else {
        setError(data.error || 'Failed to complete milestone');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Handle escrow release
  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/escrow/${escrowId}/release`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        fetchEscrows();
      } else {
        setError(data.error || 'Failed to release escrow');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Handle dispute creation
  const handleCreateDispute = async (escrowId: string, title: string, description: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/escrow/${escrowId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (data.success) {
        setDisputeOpen(false);
        fetchEscrows();
      } else {
        setError(data.error || 'Failed to create dispute');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Add milestone
  const addMilestone = () => {
    setMilestones([...milestones, { name: '', description: '', amount: 0, percentage: 0 }]);
  };

  // Remove milestone
  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Update milestone
  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  // Reset form
  const resetForm = () => {
    setRfqId('');
    setAmount('');
    setMilestones([{ name: '', description: '', amount: 0, percentage: 0 }]);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'disputed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate progress
  const calculateProgress = (milestones: Milestone[]) => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          Escrow Management
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Secure milestone-based payments with buyer and supplier protection
        </Typography>
      </Box>

      {/* Create Escrow Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant='contained'
          startIcon={<Security />}
          onClick={() => setCreateEscrowOpen(true)}
        >
          Create New Escrow
        </Button>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Escrow List */}
      <Grid container spacing={3}>
        {escrows.map(escrow => (
          <Grid item xs={12} key={escrow.id}>
            <Card>
              <CardContent>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant='h6'>Escrow #{escrow.id.slice(-8)}</Typography>
                    <Typography variant='body2' color='textSecondary'>
                      RFQ: {escrow.rfqId}
                    </Typography>
                  </Box>
                  <Chip
                    label={escrow.status.toUpperCase()}
                    color={getStatusColor(escrow.status) as any}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant='body2' color='textSecondary'>
                      Amount
                    </Typography>
                    <Typography variant='h6'>
                      {formatCurrency(escrow.amount, escrow.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='body2' color='textSecondary'>
                      Progress
                    </Typography>
                    <Typography variant='h6'>
                      {calculateProgress(escrow.milestones).toFixed(0)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='body2' color='textSecondary'>
                      Milestones
                    </Typography>
                    <Typography variant='h6'>{escrow.milestones.length}</Typography>
                  </Grid>
                </Grid>

                {/* Milestones */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant='h6'>Milestones</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stepper orientation='vertical'>
                      {escrow.milestones.map((milestone, index) => (
                        <Step
                          key={milestone.id}
                          active={milestone.status === 'in_progress'}
                          completed={milestone.status === 'completed'}
                        >
                          <StepLabel>
                            <Box display='flex' justifyContent='space-between' alignItems='center'>
                              <Typography variant='body1'>{milestone.name}</Typography>
                              <Typography variant='body2' color='textSecondary'>
                                {formatCurrency(milestone.amount, escrow.currency)}
                              </Typography>
                            </Box>
                          </StepLabel>
                          <StepContent>
                            <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
                              {milestone.description}
                            </Typography>
                            <Box display='flex' gap={1}>
                              {milestone.status === 'pending' && (
                                <Button
                                  size='small'
                                  variant='outlined'
                                  onClick={() => handleMilestoneComplete(escrow.id, milestone.id)}
                                  disabled={processing}
                                >
                                  Start Milestone
                                </Button>
                              )}
                              {milestone.status === 'in_progress' && (
                                <Button
                                  size='small'
                                  variant='contained'
                                  onClick={() => handleMilestoneComplete(escrow.id, milestone.id)}
                                  disabled={processing}
                                >
                                  Complete Milestone
                                </Button>
                              )}
                              {milestone.status === 'completed' && (
                                <Chip label='Completed' color='success' size='small' />
                              )}
                            </Box>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </AccordionDetails>
                </Accordion>

                {/* Actions */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {escrow.status === 'active' && calculateProgress(escrow.milestones) === 100 && (
                    <Button
                      variant='contained'
                      color='success'
                      startIcon={<LockOpen />}
                      onClick={() => handleReleaseEscrow(escrow.id)}
                      disabled={processing}
                    >
                      Release Funds
                    </Button>
                  )}
                  {escrow.status === 'active' && (
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<Warning />}
                      onClick={() => {
                        setSelectedEscrow(escrow);
                        setDisputeOpen(true);
                      }}
                    >
                      Create Dispute
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Escrow Dialog */}
      <Dialog
        open={createEscrowOpen}
        onClose={() => setCreateEscrowOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Create New Escrow</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label='RFQ ID'
                fullWidth
                value={rfqId}
                onChange={e => setRfqId(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Total Amount (₹)'
                type='number'
                fullWidth
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                <Typography variant='h6'>Milestones</Typography>
                <Button onClick={addMilestone} size='small'>
                  Add Milestone
                </Button>
              </Box>
              {milestones.map((milestone, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label='Milestone Name'
                        fullWidth
                        value={milestone.name}
                        onChange={e => updateMilestone(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label='Amount (₹)'
                        type='number'
                        fullWidth
                        value={milestone.amount}
                        onChange={e =>
                          updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label='Description'
                        fullWidth
                        multiline
                        rows={2}
                        value={milestone.description}
                        onChange={e => updateMilestone(index, 'description', e.target.value)}
                        required
                      />
                    </Grid>
                    {milestones.length > 1 && (
                      <Grid item xs={12}>
                        <Button color='error' size='small' onClick={() => removeMilestone(index)}>
                          Remove Milestone
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEscrowOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateEscrow}
            variant='contained'
            disabled={processing || !rfqId || !amount || milestones.length === 0}
          >
            {processing ? <CircularProgress size={20} /> : 'Create Escrow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dispute Dialog */}
      <Dialog open={disputeOpen} onClose={() => setDisputeOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Create Dispute</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Dispute Title'
            fullWidth
            variant='outlined'
            required
          />
          <TextField
            margin='dense'
            label='Description'
            fullWidth
            multiline
            rows={4}
            variant='outlined'
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisputeOpen(false)}>Cancel</Button>
          <Button variant='contained' color='error' disabled={processing}>
            {processing ? <CircularProgress size={20} /> : 'Create Dispute'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
