'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Business,
  Language,
  Payment,
  Verified,
  CheckCircle,
  Info,
  School,
  Support
} from '@mui/icons-material';
import GSTValidation from '../forms/GSTValidation';
import { INDIAN_STATES } from '../../utils/indian-categories';

interface OnboardingStep {
  title: string;
  description: string;
  component: React.ReactNode;
}

interface OnboardingData {
  companyName: string;
  gstNumber: string;
  businessType: 'MSME' | 'Enterprise' | 'Startup';
  state: string;
  city: string;
  language: 'en' | 'hi';
  paymentMethod: 'UPI' | 'NEFT' | 'Card' | 'All';
  industry: string;
}

export default function IndiaOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: '',
    gstNumber: '',
    businessType: 'MSME',
    state: '',
    city: '',
    language: 'en',
    paymentMethod: 'UPI',
    industry: ''
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDataChange = (field: keyof OnboardingData, value: string) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const steps: OnboardingStep[] = [
    {
      title: 'Welcome to Bell24h India! 🇮🇳',
      description: 'Let\'s set up your business profile for the Indian B2B marketplace',
      component: (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎉 Welcome to India's Premier B2B Marketplace!
            </Typography>
            <Typography variant="body2">
              Bell24h is designed specifically for Indian businesses with features like:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="GST Integration & Compliance" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="UPI & Indian Payment Methods" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Hindi Language Support" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="MSME Special Benefits" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Export-Import Support" />
              </ListItem>
            </List>
          </Alert>
          <Button variant="contained" onClick={handleNext}>
            Start Setup
          </Button>
        </Box>
      )
    },
    {
      title: 'Company Information',
      description: 'Tell us about your business',
      component: (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={onboardingData.companyName}
                onChange={(e) => handleDataChange('companyName', e.target.value)}
                placeholder="e.g., Mumbai Textiles Pvt Ltd"
              />
            </Grid>
            <Grid item xs={12}>
              <GSTValidation 
                value={onboardingData.gstNumber}
                onChange={(value) => handleDataChange('gstNumber', value)}
                label="GST Number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Business Type</InputLabel>
                <Select
                  value={onboardingData.businessType}
                  onChange={(e) => handleDataChange('businessType', e.target.value)}
                  label="Business Type"
                >
                  <MenuItem value="MSME">MSME (Micro, Small & Medium Enterprise)</MenuItem>
                  <MenuItem value="Enterprise">Large Enterprise</MenuItem>
                  <MenuItem value="Startup">Startup</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Industry"
                value={onboardingData.industry}
                onChange={(e) => handleDataChange('industry', e.target.value)}
                placeholder="e.g., Textiles, Pharmaceuticals, IT"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Location & Language',
      description: 'Set your business location and language preference',
      component: (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={onboardingData.state}
                  onChange={(e) => handleDataChange('state', e.target.value)}
                  label="State"
                >
                  {INDIAN_STATES.map((state) => (
                    <MenuItem key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={onboardingData.city}
                onChange={(e) => handleDataChange('city', e.target.value)}
                placeholder="e.g., Mumbai, Pune, Delhi"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Language Preference</FormLabel>
                <RadioGroup
                  value={onboardingData.language}
                  onChange={(e) => handleDataChange('language', e.target.value)}
                  row
                >
                  <FormControlLabel value="en" control={<Radio />} label="English" />
                  <FormControlLabel value="hi" control={<Radio />} label="हिंदी (Hindi)" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Payment Setup',
      description: 'Choose your preferred payment methods',
      component: (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Bell24h supports all major Indian payment methods for seamless transactions
            </Typography>
          </Alert>
          <FormControl component="fieldset">
            <FormLabel component="legend">Preferred Payment Methods</FormLabel>
            <RadioGroup
              value={onboardingData.paymentMethod}
              onChange={(e) => handleDataChange('paymentMethod', e.target.value)}
            >
              <FormControlLabel value="UPI" control={<Radio />} label="UPI (Recommended)" />
              <FormControlLabel value="NEFT" control={<Radio />} label="NEFT/RTGS" />
              <FormControlLabel value="Card" control={<Radio />} label="Credit/Debit Cards" />
              <FormControlLabel value="All" control={<Radio />} label="All Payment Methods" />
            </RadioGroup>
          </FormControl>
          
          <Card sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              💡 Payment Benefits
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Instant UPI payments" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Secure escrow protection" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="GST-compliant invoicing" />
              </ListItem>
            </List>
          </Card>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Sample Transaction',
      description: 'Let\'s walk through a sample transaction',
      component: (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Sample RFQ Creation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Here's how you can create a Request for Quotation (RFQ):
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="1. Go to 'Create RFQ' in your dashboard"
                    secondary="Specify product requirements and quantity"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="2. Suppliers will receive your RFQ"
                    secondary="Get quotes from verified Indian suppliers"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="3. Compare quotes and select supplier"
                    secondary="All quotes include GST and delivery details"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="4. Complete payment and track order"
                    secondary="Secure payment with UPI or other methods"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              🎉 Your Bell24h account is ready! You can now start connecting with Indian suppliers and buyers.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" color="success">
              Complete Setup
            </Button>
          </Box>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        🚀 Bell24h India Onboarding
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.title}>
            <StepLabel>
              <Typography variant="h6">{step.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {step.component}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === steps.length && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Verified color="success" /> Setup Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome to Bell24h India! Your business profile has been successfully configured.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 
