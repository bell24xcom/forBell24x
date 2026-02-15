'use client';

import React, { Suspense, useState } from 'react';
import { Box, Container, Typography, Tab, Tabs, AppBar, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';

// Lazy load components
const DeviceManagement = dynamic(() => import('@/components/security/DeviceManagement'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

const MFASetup = dynamic(() => import('@/components/security/MFASetup'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

export default function SecurityPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' fontWeight='bold' gutterBottom>
        Account Security
      </Typography>
      <Typography variant='body1' color='text.secondary' gutterBottom>
        Manage your security settings and trusted devices
      </Typography>

      <AppBar
        position='static'
        color='default'
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor='primary'
          indicatorColor='primary'
          aria-label='Security Settings Tabs'
        >
          <Tab label='Trusted Devices' />
          <Tab label='Two-Factor Authentication' />
        </Tabs>
      </AppBar>

      <Box sx={{ mt: 3 }}>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          }
        >
          {tabValue === 0 && <DeviceManagement />}
          {tabValue === 1 && <MFASetup />}
        </Suspense>
      </Box>
    </Container>
  );
}
