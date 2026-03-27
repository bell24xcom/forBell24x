'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface MFASetupData {
  isEnabled: boolean;
  qrCode?: string;
  secretKey?: string;
  backupCodes?: string[];
}

export default function MFASetup() {
  const [mfaData, setMfaData] = useState<MFASetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupInProgress, setSetupInProgress] = useState(false);

  // Fetch MFA status
  const fetchMFAStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/mfa');
      const data = await response.json();

      if (data.success) {
        setMfaData(data.data);
        if (data.data.isEnabled) {
          setActiveStep(3); // Already enabled
        }
      } else {
        setError(data.error || 'Failed to fetch MFA status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  // Start MFA setup
  const startMFASetup = async () => {
    try {
      setSetupInProgress(true);
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMfaData(data.data);
        setActiveStep(1);
      } else {
        setError(data.error || 'Failed to start MFA setup');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setSetupInProgress(false);
    }
  };

  // Verify MFA setup
  const verifyMFASetup = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setSetupInProgress(true);
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('MFA has been successfully enabled!');
        setActiveStep(2);
        fetchMFAStatus();
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setSetupInProgress(false);
    }
  };

  // Disable MFA
  const disableMFA = async () => {
    try {
      setSetupInProgress(true);
      const response = await fetch('/api/security/mfa', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('MFA has been disabled');
        fetchMFAStatus();
        setActiveStep(0);
      } else {
        setError(data.error || 'Failed to disable MFA');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setSetupInProgress(false);
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <Typography>Loading MFA settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        🔐 Multi-Factor Authentication
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display='flex' alignItems='center' mb={3}>
            <Typography variant='h6' sx={{ mr: 1 }}>
              🔒
            </Typography>
            <Typography variant='h6'>MFA Status</Typography>
          </Box>

          {mfaData?.isEnabled ? (
            <Box>
              <Alert severity='success' sx={{ mb: 2 }}>
                <Typography variant='body1' fontWeight='bold'>
                  ✅ MFA is enabled
                </Typography>
                <Typography variant='body2'>
                  Your account is protected with multi-factor authentication.
                </Typography>
              </Alert>

              <Box display='flex' gap={2}>
                <Button
                  variant='outlined'
                  color='error'
                  onClick={disableMFA}
                  disabled={setupInProgress}
                >
                  Disable MFA
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity='warning' sx={{ mb: 2 }}>
                <Typography variant='body1' fontWeight='bold'>
                  ⚠️ MFA is not enabled
                </Typography>
                <Typography variant='body2'>
                  Enable multi-factor authentication to add an extra layer of security to your
                  account.
                </Typography>
              </Alert>

              <Button
                variant='contained'
                color='primary'
                onClick={startMFASetup}
                disabled={setupInProgress}
              >
                Enable MFA
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* MFA Setup Stepper */}
      {!mfaData?.isEnabled && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              📱 MFA Setup Process
            </Typography>

            <Stepper activeStep={activeStep} orientation='vertical'>
              <Step>
                <StepLabel>Step 1: Generate QR Code</StepLabel>
                <StepContent>
                  <Typography>
                    Click "Enable MFA" to generate a QR code that you can scan with your
                    authenticator app.
                  </Typography>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Step 2: Scan QR Code</StepLabel>
                <StepContent>
                  {mfaData?.qrCode && (
                    <Box>
                      <Typography gutterBottom>
                        Scan this QR code with your authenticator app (Google Authenticator, Authy,
                        etc.):
                      </Typography>
                      <Box display='flex' justifyContent='center' my={2}>
                        <img src={mfaData.qrCode} alt='MFA QR Code' style={{ maxWidth: '200px' }} />
                      </Box>
                      <Typography variant='body2' color='textSecondary' gutterBottom>
                        Or manually enter this secret key:
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                        <Typography fontFamily='monospace'>{mfaData.secretKey}</Typography>
                      </Paper>
                    </Box>
                  )}
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Step 3: Verify Setup</StepLabel>
                <StepContent>
                  <Box>
                    <Typography gutterBottom>
                      Enter the 6-digit code from your authenticator app:
                    </Typography>
                    <TextField
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      placeholder='000000'
                      variant='outlined'
                      sx={{ mb: 2 }}
                    />
                    <Box>
                      <Button
                        variant='contained'
                        onClick={verifyMFASetup}
                        disabled={!verificationCode || setupInProgress}
                      >
                        Verify & Enable MFA
                      </Button>
                    </Box>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Step 4: Backup Codes</StepLabel>
                <StepContent>
                  <Box>
                    <Alert severity='info' sx={{ mb: 2 }}>
                      <Typography variant='body1' fontWeight='bold'>
                        📋 Save your backup codes
                      </Typography>
                      <Typography variant='body2'>
                        These codes can be used to access your account if you lose your
                        authenticator device.
                      </Typography>
                    </Alert>
                    {mfaData?.backupCodes && (
                      <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                        <Grid container spacing={1}>
                          {mfaData.backupCodes.map((code, index) => (
                            <Grid item xs={6} sm={4} key={index}>
                              <Typography fontFamily='monospace' textAlign='center'>
                                {code}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    )}
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
