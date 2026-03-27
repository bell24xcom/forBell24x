'use client';

import { useState, useEffect } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Business,
  Verified,
  LocalShipping,
  Description,
  Calculate,
  TrendingUp,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';

interface ExportModuleProps {
  companyId: string;
  hasExportLicense: boolean;
  exportLicenseNumber?: string;
  exportHistory: ExportRecord[];
}

interface ExportRecord {
  id: string;
  date: string;
  product: string;
  destination: string;
  value: number;
  status: 'Completed' | 'In Transit' | 'Pending';
}

interface ExportIncentive {
  scheme: string;
  description: string;
  benefit: string;
  eligibility: string;
  applicationLink: string;
}

const EXPORT_INCENTIVES: ExportIncentive[] = [
  {
    scheme: 'MEIS (Merchandise Exports from India Scheme)',
    description: 'Rewards for exports to specified markets',
    benefit: '2-5% of FOB value as duty credit scrips',
    eligibility: 'All exporters to specified markets',
    applicationLink: 'https://www.dgft.gov.in/'
  },
  {
    scheme: 'RODTEP (Remission of Duties and Taxes on Exported Products)',
    description: 'Refund of embedded taxes and duties',
    benefit: '0.5-4.3% of FOB value as duty credit',
    eligibility: 'All exporters',
    applicationLink: 'https://www.dgft.gov.in/'
  },
  {
    scheme: 'SEIS (Services Exports from India Scheme)',
    description: 'Rewards for service exports',
    benefit: '3-5% of net foreign exchange earned',
    eligibility: 'Service exporters',
    applicationLink: 'https://www.dgft.gov.in/'
  }
];

const SHIPPING_OPTIONS = [
  { id: 'air', name: 'Air Freight', description: 'Fast delivery, higher cost', time: '3-7 days', cost: 'High' },
  { id: 'sea', name: 'Sea Freight', description: 'Cost effective, slower delivery', time: '15-30 days', cost: 'Low' },
  { id: 'land', name: 'Land Transport', description: 'For neighboring countries', time: '5-10 days', cost: 'Medium' }
];

export default function ExportModule({ 
  companyId, 
  hasExportLicense, 
  exportLicenseNumber, 
  exportHistory 
}: ExportModuleProps) {
  const [selectedShipping, setSelectedShipping] = useState('');
  const [exportValue, setExportValue] = useState('');
  const [destination, setDestination] = useState('');
  const [product, setProduct] = useState('');

  const calculateIncentive = (value: number) => {
    // Simplified calculation - in real app, this would be more complex
    return value * 0.03; // 3% incentive
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        🌍 Export-Import Module
      </Typography>

      {/* Export License Status */}
      <Card sx={{ mb: 3, border: hasExportLicense ? '2px solid #4caf50' : '2px solid #ff9800' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Business sx={{ fontSize: 40, color: hasExportLicense ? '#4caf50' : '#ff9800' }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" gutterBottom>
                Export License Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasExportLicense 
                  ? `License Number: ${exportLicenseNumber}`
                  : 'Export license required for international trade'
                }
              </Typography>
            </Grid>
            <Grid item>
              <Chip 
                icon={hasExportLicense ? <Verified /> : <Warning />}
                label={hasExportLicense ? 'Licensed' : 'Not Licensed'}
                color={hasExportLicense ? 'success' : 'warning'}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export Calculator */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate /> Export Incentive Calculator
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Export Value (₹)"
                value={exportValue}
                onChange={(e) => setExportValue(e.target.value)}
                type="number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Destination Country"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Product Category"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estimated Incentives
                  </Typography>
                  {exportValue && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Export Value: ₹{parseInt(exportValue).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        MEIS Benefit: ₹{calculateIncentive(parseInt(exportValue)).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        RODTEP Benefit: ₹{(parseInt(exportValue) * 0.02).toLocaleString('en-IN')}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" color="success.main">
                        Total Benefit: ₹{(calculateIncentive(parseInt(exportValue)) + (parseInt(exportValue) * 0.02)).toLocaleString('en-IN')}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Shipping Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping /> Shipping & Logistics
          </Typography>
          <Grid container spacing={2}>
            {SHIPPING_OPTIONS.map((option) => (
              <Grid item xs={12} md={4} key={option.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {option.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {option.description}
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Info sx={{ fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText primary={`Delivery Time: ${option.time}`} />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Info sx={{ fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText primary={`Cost: ${option.cost}`} />
                      </ListItem>
                    </List>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Get Quote
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Export Incentives */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp /> Government Export Incentives
          </Typography>
          <Grid container spacing={2}>
            {EXPORT_INCENTIVES.map((incentive) => (
              <Grid item xs={12} md={4} key={incentive.scheme}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {incentive.scheme}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {incentive.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Benefit:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {incentive.benefit}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Eligibility:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {incentive.eligibility}
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      fullWidth
                      onClick={() => window.open(incentive.applicationLink, '_blank')}
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

      {/* Export History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Value (₹)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.product}</TableCell>
                    <TableCell>{record.destination}</TableCell>
                    <TableCell>{record.value.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status}
                        color={record.status === 'Completed' ? 'success' : record.status === 'In Transit' ? 'warning' : 'default'}
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
    </Box>
  );
} 
