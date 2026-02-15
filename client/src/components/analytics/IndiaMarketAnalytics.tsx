'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  Business,
  LocationOn,
  Assessment,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { INDIAN_STATES, getStateByCode } from '../../utils/indian-categories';

interface MarketAnalytics {
  totalTransactions: number;
  totalValue: number;
  msmeTransactions: number;
  enterpriseTransactions: number;
  exportTransactions: number;
  stateWiseData: StateData[];
  topCategories: CategoryData[];
  gstCompliance: GSTCompliance;
  exportPotential: ExportPotential[];
}

interface StateData {
  stateCode: string;
  stateName: string;
  transactions: number;
  value: number;
  suppliers: number;
  buyers: number;
  growthRate: number;
}

interface CategoryData {
  category: string;
  transactions: number;
  value: number;
  growthRate: number;
}

interface GSTCompliance {
  totalCompanies: number;
  compliantCompanies: number;
  nonCompliantCompanies: number;
  complianceRate: number;
}

interface ExportPotential {
  category: string;
  currentExports: number;
  potentialExports: number;
  growthPotential: number;
}

// Mock data - in real app, this would come from API
const MOCK_ANALYTICS: MarketAnalytics = {
  totalTransactions: 1250,
  totalValue: 45000000, // 4.5 Crores
  msmeTransactions: 850,
  enterpriseTransactions: 400,
  exportTransactions: 150,
  stateWiseData: [
    { stateCode: 'MH', stateName: 'Maharashtra', transactions: 450, value: 18000000, suppliers: 120, buyers: 85, growthRate: 15.5 },
    { stateCode: 'GJ', stateName: 'Gujarat', transactions: 320, value: 12500000, suppliers: 95, buyers: 65, growthRate: 12.8 },
    { stateCode: 'DL', stateName: 'Delhi', transactions: 280, value: 9800000, suppliers: 75, buyers: 55, growthRate: 18.2 },
    { stateCode: 'TN', stateName: 'Tamil Nadu', transactions: 200, value: 4700000, suppliers: 60, buyers: 40, growthRate: 14.7 }
  ],
  topCategories: [
    { category: 'Textiles & Garments', transactions: 380, value: 15000000, growthRate: 22.5 },
    { category: 'Pharmaceuticals', transactions: 220, value: 8500000, growthRate: 18.3 },
    { category: 'Automotive Parts', transactions: 180, value: 7200000, growthRate: 15.7 },
    { category: 'IT Services', transactions: 150, value: 5800000, growthRate: 25.4 }
  ],
  gstCompliance: {
    totalCompanies: 1250,
    compliantCompanies: 1180,
    nonCompliantCompanies: 70,
    complianceRate: 94.4
  },
  exportPotential: [
    { category: 'Textiles & Garments', currentExports: 45, potentialExports: 120, growthPotential: 166.7 },
    { category: 'Pharmaceuticals', currentExports: 28, potentialExports: 85, growthPotential: 203.6 },
    { category: 'IT Services', currentExports: 35, potentialExports: 95, growthPotential: 171.4 },
    { category: 'Automotive Parts', currentExports: 22, potentialExports: 65, growthPotential: 195.5 }
  ]
};

export default function IndiaMarketAnalytics() {
  const [analytics, setAnalytics] = useState<MarketAnalytics>(MOCK_ANALYTICS);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        📊 India Market Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp /> Total Transactions
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatNumber(analytics.totalTransactions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total value: {formatCurrency(analytics.totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business /> MSME Transactions
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatNumber(analytics.msmeTransactions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((analytics.msmeTransactions / analytics.totalTransactions) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment /> Export Transactions
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatNumber(analytics.exportTransactions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((analytics.exportTransactions / analytics.totalTransactions) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle /> GST Compliance
              </Typography>
              <Typography variant="h4" color="success.main">
                {analytics.gstCompliance.complianceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics.gstCompliance.compliantCompanies} compliant companies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* State-wise Analytics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn /> State-wise Performance
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>State</TableCell>
                  <TableCell>Transactions</TableCell>
                  <TableCell>Value (₹)</TableCell>
                  <TableCell>Suppliers</TableCell>
                  <TableCell>Buyers</TableCell>
                  <TableCell>Growth Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.stateWiseData.map((state) => (
                  <TableRow key={state.stateCode}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {state.stateName}
                        </Typography>
                        <Chip label={state.stateCode} size="small" variant="outlined" />
                      </Box>
                    </TableCell>
                    <TableCell>{formatNumber(state.transactions)}</TableCell>
                    <TableCell>{formatCurrency(state.value)}</TableCell>
                    <TableCell>{formatNumber(state.suppliers)}</TableCell>
                    <TableCell>{formatNumber(state.buyers)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`+${state.growthRate}%`}
                        color={state.growthRate > 15 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Categories by Transactions
              </Typography>
              <List>
                {analytics.topCategories.map((category, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Typography variant="h6" color="primary.main">
                        #{index + 1}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={category.category}
                      secondary={`${formatNumber(category.transactions)} transactions • ${formatCurrency(category.value)}`}
                    />
                    <Chip 
                      label={`+${category.growthRate}%`}
                      color="success"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Potential Analysis
              </Typography>
              <List>
                {analytics.exportPotential.map((exportItem, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Typography variant="h6" color="warning.main">
                        #{index + 1}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={exportItem.category}
                      secondary={`Current: ${exportItem.currentExports} • Potential: ${exportItem.potentialExports}`}
                    />
                    <Chip 
                      label={`+${exportItem.growthPotential}%`}
                      color="warning"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* GST Compliance Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle /> GST Compliance Tracking
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Compliance Rate: {analytics.gstCompliance.complianceRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={analytics.gstCompliance.complianceRate} 
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {analytics.gstCompliance.compliantCompanies} out of {analytics.gstCompliance.totalCompanies} companies are GST compliant
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Non-Compliant Companies
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${analytics.gstCompliance.nonCompliantCompanies} companies need attention`}
                    secondary="GST registration or filing pending"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Compliance Benefits"
                    secondary="Reduced GST rates, government tenders, export incentives"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 
