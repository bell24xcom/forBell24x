'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Chip, 
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Business,
  Verified,
  Discount,
  Support,
  TrendingUp,
  AccountBalance,
  Description,
  CheckCircle
} from '@mui/icons-material';

interface MSMEDashboardProps {
  companyId: string;
  isVerified: boolean;
  msmeNumber?: string;
  companyType: 'MSME' | 'Enterprise' | 'Startup';
}

interface GovernmentScheme {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  eligibility: string;
  benefits: string[];
  applicationLink: string;
  deadline?: string;
}

const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pmmy',
    name: 'Pradhan Mantri MUDRA Yojana',
    nameHindi: 'प्रधानमंत्री मुद्रा योजना',
    description: 'Micro Units Development and Refinance Agency for small businesses',
    descriptionHindi: 'छोटे व्यवसायों के लिए सूक्ष्म इकाई विकास और पुनर्वित्त एजेंसी',
    eligibility: 'Small business owners, micro enterprises',
    benefits: ['Loans up to ₹10 lakhs', 'No collateral required', 'Low interest rates'],
    applicationLink: 'https://www.mudra.org.in/',
    deadline: 'Ongoing'
  },
  {
    id: 'standup-india',
    name: 'Stand-Up India',
    nameHindi: 'स्टैंड-अप इंडिया',
    description: 'Facilitate bank loans between ₹10 lakh and ₹1 Crore to at least one SC/ST borrower and one woman borrower',
    descriptionHindi: 'कम से कम एक SC/ST उधारकर्ता और एक महिला उधारकर्ता को ₹10 लाख और ₹1 करोड़ के बीच बैंक ऋण की सुविधा',
    eligibility: 'SC/ST entrepreneurs, women entrepreneurs',
    benefits: ['Loans up to ₹1 Crore', 'Greenfield projects', 'Composite loans'],
    applicationLink: 'https://www.standupmitra.in/',
    deadline: 'Ongoing'
  },
  {
    id: 'aspi',
    name: 'ASPIRE (A Scheme for Promoting Innovation, Rural Entrepreneurship)',
    nameHindi: 'ASPIRE (नवाचार, ग्रामीण उद्यमिता को बढ़ावा देने की योजना)',
    description: 'Promote innovation, rural entrepreneurship and agro-industry',
    descriptionHindi: 'नवाचार, ग्रामीण उद्यमिता और कृषि-उद्योग को बढ़ावा देना',
    eligibility: 'Rural entrepreneurs, agro-based businesses',
    benefits: ['Technology support', 'Market linkages', 'Skill development'],
    applicationLink: 'https://www.msme.gov.in/',
    deadline: 'Ongoing'
  }
];

export default function MSMEDashboard({ 
  companyId, 
  isVerified, 
  msmeNumber, 
  companyType 
}: MSMEDashboardProps) {
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [msmeBenefits, setMsmeBenefits] = useState({
    reducedGST: true,
    prioritySupport: true,
    subsidizedPricing: true,
    governmentTenders: true
  });

  const isMSME = companyType === 'MSME';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        🏭 MSME Dashboard
      </Typography>

      {/* MSME Status Card */}
      <Card sx={{ mb: 3, border: isMSME ? '2px solid #4caf50' : '2px solid #ff9800' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Business sx={{ fontSize: 40, color: isMSME ? '#4caf50' : '#ff9800' }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" gutterBottom>
                {isMSME ? 'MSME Verified Company' : 'Enterprise Account'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isMSME 
                  ? `MSME Number: ${msmeNumber || 'Pending Verification'}`
                  : 'Upgrade to MSME for additional benefits'
                }
              </Typography>
            </Grid>
            <Grid item>
              <Chip 
                icon={isVerified ? <Verified /> : <CheckCircle />}
                label={isVerified ? 'Verified' : 'Pending Verification'}
                color={isVerified ? 'success' : 'warning'}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* MSME Benefits */}
      {isMSME && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Discount /> MSME Benefits
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reduced GST Rates" 
                      secondary="Special GST rates for MSME products"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Priority Support" 
                      secondary="24/7 dedicated MSME support"
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Subsidized Pricing" 
                      secondary="Special pricing on Bell24h services"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Government Tenders" 
                      secondary="Access to government procurement opportunities"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Government Schemes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance /> Government Schemes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available government schemes for MSMEs and small businesses
          </Typography>
          
          <Grid container spacing={2}>
            {GOVERNMENT_SCHEMES.map((scheme) => (
              <Grid item xs={12} md={4} key={scheme.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {scheme.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {scheme.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Eligibility:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {scheme.eligibility}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Benefits:
                    </Typography>
                    <List dense>
                      {scheme.benefits.map((benefit, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircle sx={{ fontSize: 16 }} color="success" />
                          </ListItemIcon>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                    <Button 
                      variant="contained" 
                      size="small" 
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => window.open(scheme.applicationLink, '_blank')}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* MSME Support */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Support /> MSME Support
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                📞 Contact MSME Support
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get dedicated support for MSME-related queries and assistance
              </Typography>
              <Button variant="outlined" startIcon={<Support />}>
                Contact Support
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                📋 MSME Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download MSME certificates and compliance documents
              </Typography>
              <Button variant="outlined" startIcon={<Description />}>
                Download Documents
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 
