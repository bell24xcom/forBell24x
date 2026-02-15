'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress: string;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Fetch devices
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/devices');
      const data = await response.json();

      if (data.success) {
        setDevices(data.data);
      } else {
        setError(data.error || 'Failed to fetch devices');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle device revocation
  const handleRevokeDevice = async () => {
    if (!selectedDevice) return;

    try {
      const response = await fetch(`/api/security/devices/${selectedDevice.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setRevokeDialogOpen(false);
        setSelectedDevice(null);
        fetchDevices();
      } else {
        setError(data.error || 'Failed to revoke device');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return '💻';
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      default:
        return '🖥️';
    }
  };

  // Get device type color
  const getDeviceTypeColor = (type: string) => {
    switch (type) {
      case 'desktop':
        return 'primary';
      case 'mobile':
        return 'secondary';
      case 'tablet':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <Typography>Loading devices...</Typography>
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
        🔒 Device Management
      </Typography>

      <Typography variant='body1' color='textSecondary' sx={{ mb: 3 }}>
        Manage your active devices and sessions. You can revoke access to any device except your
        current one.
      </Typography>

      {/* Devices Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Browser</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map(device => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        <span style={{ marginRight: '8px' }}>{getDeviceIcon(device.type)}</span>
                        <Box>
                          <Typography variant='body2' fontWeight='bold'>
                            {device.name}
                          </Typography>
                          <Typography variant='caption' color='textSecondary'>
                            {device.ipAddress}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.type}
                        color={getDeviceTypeColor(device.type) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{device.browser}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>{new Date(device.lastActive).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={device.isCurrent ? 'Current Session' : 'Active'}
                        color={device.isCurrent ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {!device.isCurrent && (
                        <Tooltip title='Revoke access'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => {
                              setSelectedDevice(device);
                              setRevokeDialogOpen(true);
                            }}
                          >
                            <span>🗑️</span>
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Revoke Device Dialog */}
      <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)}>
        <DialogTitle>Revoke Device Access</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke access for <strong>{selectedDevice?.name}</strong>? This
            device will be logged out immediately.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRevokeDevice} color='error'>
            Revoke Access
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
