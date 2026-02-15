import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  Button,
  Divider,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { rfqService } from '../services/rfq/RFQService';
import { RFQ } from '../types/rfq';
import { categories, getSubcategoriesByCategoryId } from '../config/categories';
import { searchAnalyticsService } from '../services/search/SearchAnalyticsService';
import ExportResults from './ExportResults';
import { exportService } from '../services/exportService';
import Grid from '@mui/material/Grid';
import { ExportOptions } from '../services/exportService';

interface SearchFilters {
  priceRange: [number, number];
  location: string;
  category: string;
  subcategory: string;
  status: string;
  timeline: string;
  dateRange: [Date | null, Date | null];
  supplierRating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  verifiedSuppliers: boolean;
  paymentTerms: string[];
  minOrderQuantity: number;
  maxOrderQuantity: number;
  certifications: string[];
  deliveryTime: string;
  showExpired: boolean;
}

const ITEMS_PER_PAGE = 10;

const SearchResults: React.FC = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const query = searchParams?.get('q') || '';

  const [results, setResults] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 1000000],
    location: '',
    category: '',
    subcategory: '',
    status: '',
    timeline: '',
    dateRange: [null, null],
    supplierRating: 0,
    sortBy: 'relevance',
    sortOrder: 'desc',
    verifiedSuppliers: false,
    paymentTerms: [],
    minOrderQuantity: 0,
    maxOrderQuantity: 1000000,
    certifications: [],
    deliveryTime: '',
    showExpired: false,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  // Shipping calculator state
  const [expandedShipping, setExpandedShipping] = useState<Record<string, boolean>>({});
  const [shippingRates, setShippingRates] = useState<Record<string, any[]>>({});
  const [shippingLoading, setShippingLoading] = useState<Record<string, boolean>>({});
  const [shippingForm, setShippingForm] = useState<
    Record<string, { fromPin: string; toPin: string; weight: number }>
  >({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await rfqService.searchRFQs({ query });
        let filteredResults = response.rfqs.filter(
          (rfq: any) =>
            rfq.title.toLowerCase().includes(query.toLowerCase()) ||
            rfq.description.toLowerCase().includes(query.toLowerCase())
        );

        // Apply basic filters
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
          filteredResults = filteredResults.filter(
            (rfq: any) => rfq.budget >= filters.priceRange[0] && rfq.budget <= filters.priceRange[1]
          );
        }

        if (filters.location) {
          filteredResults = filteredResults.filter((rfq: any) =>
            rfq.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        if (filters.category) {
          filteredResults = filteredResults.filter((rfq: any) => rfq.category === filters.category);
        }

        if (filters.subcategory) {
          filteredResults = filteredResults.filter(
            (rfq: any) => rfq.subcategory === filters.subcategory
          );
        }

        if (filters.status) {
          filteredResults = filteredResults.filter((rfq: any) => rfq.status === filters.status);
        }

        if (filters.timeline) {
          filteredResults = filteredResults.filter((rfq: any) => {
            const deadline = new Date(rfq.deadline);
            const now = new Date();
            const diffDays = Math.ceil(
              (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            switch (filters.timeline) {
              case 'today':
                return diffDays === 0;
              case 'week':
                return diffDays <= 7;
              case 'month':
                return diffDays <= 30;
              default:
                return true;
            }
          });
        }

        // Apply advanced filters
        if (filters.dateRange[0] && filters.dateRange[1]) {
          filteredResults = filteredResults.filter(rfq => {
            const rfqDate = new Date(rfq.createdAt);
            return rfqDate >= filters.dateRange[0]! && rfqDate <= filters.dateRange[1]!;
          });
        }

        if (filters.supplierRating > 0) {
          filteredResults = filteredResults.filter(
            (rfq: any) => rfq.supplierRating >= filters.supplierRating
          );
        }

        if (filters.verifiedSuppliers) {
          filteredResults = filteredResults.filter((rfq: any) => rfq.isVerified);
        }

        if (filters.paymentTerms.length > 0) {
          filteredResults = filteredResults.filter((rfq: any) =>
            filters.paymentTerms.some(term => rfq.paymentTerms.includes(term))
          );
        }

        if (filters.minOrderQuantity > 0 || filters.maxOrderQuantity < 1000000) {
          filteredResults = filteredResults.filter(
            (rfq: any) =>
              rfq.quantity >= filters.minOrderQuantity && rfq.quantity <= filters.maxOrderQuantity
          );
        }

        if (filters.certifications.length > 0) {
          filteredResults = filteredResults.filter((rfq: any) =>
            filters.certifications.some(cert => rfq.certifications.includes(cert))
          );
        }

        if (filters.deliveryTime) {
          filteredResults = filteredResults.filter(
            (rfq: any) => rfq.deliveryTime === filters.deliveryTime
          );
        }

        if (!filters.showExpired) {
          filteredResults = filteredResults.filter(
            (rfq: any) => new Date(rfq.expiryDate) > new Date()
          );
        }

        // Sort results
        filteredResults.sort((a: any, b: any) => {
          let comparison = 0;
          switch (filters.sortBy) {
            case 'price':
              comparison = a.budget - b.budget;
              break;
            case 'date':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            case 'rating':
              comparison = (a.supplierRating || 0) - (b.supplierRating || 0);
              break;
            case 'quantity':
              comparison = a.quantity - b.quantity;
              break;
            default:
              comparison = 0;
          }
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        setResults(filteredResults);
        setError(null);

        // Track search analytics
        searchAnalyticsService.trackSearch(query, filteredResults.length, true, 1.5);
      } catch (err) {
        setError('Failed to fetch search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters]);

  const handleFilterChange = (filter: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePopularSearchClick = (search: string) => {
    // Update URL with new search query
    window.location.href = `/search?q=${encodeURIComponent(search)}`;
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      location: '',
      category: '',
      subcategory: '',
      status: '',
      timeline: '',
      dateRange: [null, null],
      supplierRating: 0,
      sortBy: 'relevance',
      sortOrder: 'desc',
      verifiedSuppliers: false,
      paymentTerms: [],
      minOrderQuantity: 0,
      maxOrderQuantity: 1000000,
      certifications: [],
      deliveryTime: '',
      showExpired: false,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleExport = async (format: string, options: any) => {
    try {
      // Convert component ExportOptions to service ExportOptions
      const serviceOptions = {
        format: format as 'csv' | 'excel' | 'pdf',
        filename: options.filename,
        includeHeaders: true,
        dateFormat: 'YYYY-MM-DD',
      };

      // Convert RFQ data to export format
      const exportData = results.map(rfq => ({
        title: rfq.title,
        description: options.includeDescription ? rfq.description : '',
        category: rfq.category,
        location: options.includeLocation ? rfq.location : '',
        budget: options.includeBudget ? rfq.budget : '',
        status: options.includeStatus ? rfq.status : '',
        deadline: rfq.deadline,
        createdAt: rfq.createdAt,
        updatedAt: rfq.updatedAt,
        paymentTerms: options.includeTimeline ? rfq.paymentTerms : '',
        isVerified: rfq.isVerified,
        supplierCount: rfq.supplierCount,
        quoteCount: rfq.quoteCount,
      }));

      await exportService.exportResults(exportData, format, serviceOptions);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const toggleShippingCalculator = (rfqId: string) => {
    setExpandedShipping(prev => ({
      ...prev,
      [rfqId]: !prev[rfqId],
    }));

    // Initialize form if not exists
    if (!shippingForm[rfqId]) {
      setShippingForm(prev => ({
        ...prev,
        [rfqId]: { fromPin: '', toPin: '', weight: 1 },
      }));
    }
  };

  const updateShippingForm = (rfqId: string, field: string, value: any) => {
    setShippingForm(prev => ({
      ...prev,
      [rfqId]: {
        ...prev[rfqId],
        [field]: value,
      },
    }));
  };

  const calculateShippingRates = async (rfqId: string) => {
    const form = shippingForm[rfqId];
    if (
      !form ||
      !form.fromPin ||
      !form.toPin ||
      form.fromPin.length !== 6 ||
      form.toPin.length !== 6
    ) {
      return;
    }

    setShippingLoading(prev => ({ ...prev, [rfqId]: true }));

    try {
      const response = await fetch('/api/logistics/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupPincode: form.fromPin,
          deliveryPincode: form.toPin,
          weight: form.weight,
          declaredValue: 5000, // Default value
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShippingRates(prev => ({ ...prev, [rfqId]: data.data }));
      } else {
        // Fallback mock data
        const mockRates = [
          {
            courierName: 'Blue Dart',
            totalCharge: Math.round(65 + form.weight * 10),
            estimatedDeliveryDays: '1-2',
            codCharge: 0,
          },
          {
            courierName: 'Delhivery',
            totalCharge: Math.round(45 + form.weight * 8),
            estimatedDeliveryDays: '2-3',
            codCharge: 0,
          },
          {
            courierName: 'Ekart',
            totalCharge: Math.round(35 + form.weight * 7),
            estimatedDeliveryDays: '3-4',
            codCharge: 0,
          },
        ];
        setShippingRates(prev => ({ ...prev, [rfqId]: mockRates }));
      }
    } catch (error) {
      console.error('Failed to calculate rates:', error);
    } finally {
      setShippingLoading(prev => ({ ...prev, [rfqId]: false }));
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading search results...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color='error'>{error}</Typography>
      </Container>
    );
  }

  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant='h6'>Filters</Typography>
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterListIcon />
              </IconButton>
            </Box>

            {showFilters && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Price Range</Typography>
                  <Slider
                    value={filters.priceRange}
                    onChange={(_, value) => handleFilterChange('priceRange', value)}
                    valueLabelDisplay='auto'
                    min={0}
                    max={1000000}
                    step={1000}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2'>
                      ${filters.priceRange[0].toLocaleString()}
                    </Typography>
                    <Typography variant='body2'>
                      ${filters.priceRange[1].toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={filters.location}
                    label='Location'
                    onChange={e => handleFilterChange('location', e.target.value)}
                  >
                    <MenuItem value=''>Any Location</MenuItem>
                    <MenuItem value='US'>United States</MenuItem>
                    <MenuItem value='EU'>European Union</MenuItem>
                    <MenuItem value='ASIA'>Asia</MenuItem>
                    <MenuItem value='AFRICA'>Africa</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label='Category'
                    onChange={e => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value=''>All Categories</MenuItem>
                    {categories.map((category: any) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {filters.category && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Subcategory</InputLabel>
                    <Select
                      value={filters.subcategory}
                      label='Subcategory'
                      onChange={e => handleFilterChange('subcategory', e.target.value)}
                    >
                      <MenuItem value=''>All Subcategories</MenuItem>
                      {getSubcategoriesByCategoryId(filters.category).map((sub: any) => (
                        <MenuItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label='Status'
                    onChange={e => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value=''>Any Status</MenuItem>
                    <MenuItem value='open'>Open</MenuItem>
                    <MenuItem value='closed'>Closed</MenuItem>
                    <MenuItem value='pending'>Pending</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Timeline</InputLabel>
                  <Select
                    value={filters.timeline}
                    label='Timeline'
                    onChange={e => handleFilterChange('timeline', e.target.value)}
                  >
                    <MenuItem value=''>Any Timeline</MenuItem>
                    <MenuItem value='urgent'>Urgent</MenuItem>
                    <MenuItem value='standard'>Standard</MenuItem>
                    <MenuItem value='flexible'>Flexible</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant='text'
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 2 }}
                >
                  Advanced Filters
                </Button>

                <Collapse in={showAdvancedFilters}>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>Order Quantity Range</Typography>
                    <Slider
                      value={[filters.minOrderQuantity, filters.maxOrderQuantity]}
                      onChange={(_, value) => {
                        const [min, max] = value as number[];
                        handleFilterChange('minOrderQuantity', min);
                        handleFilterChange('maxOrderQuantity', max);
                      }}
                      valueLabelDisplay='auto'
                      min={0}
                      max={1000000}
                      step={100}
                    />
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Delivery Time</InputLabel>
                    <Select
                      value={filters.deliveryTime}
                      label='Delivery Time'
                      onChange={e => handleFilterChange('deliveryTime', e.target.value)}
                    >
                      <MenuItem value=''>Any Delivery Time</MenuItem>
                      <MenuItem value='immediate'>Immediate</MenuItem>
                      <MenuItem value='1-2 weeks'>1-2 Weeks</MenuItem>
                      <MenuItem value='2-4 weeks'>2-4 Weeks</MenuItem>
                      <MenuItem value='1-2 months'>1-2 Months</MenuItem>
                    </Select>
                  </FormControl>

                  <FormGroup sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.verifiedSuppliers}
                          onChange={e => handleFilterChange('verifiedSuppliers', e.target.checked)}
                        />
                      }
                      label='Verified Suppliers Only'
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.showExpired}
                          onChange={e => handleFilterChange('showExpired', e.target.checked)}
                        />
                      }
                      label='Show Expired RFQs'
                    />
                  </FormGroup>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                      multiple
                      value={filters.paymentTerms}
                      label='Payment Terms'
                      onChange={e => handleFilterChange('paymentTerms', e.target.value)}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip key={value} label={value} size='small' />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value='advance'>Advance Payment</MenuItem>
                      <MenuItem value='net30'>Net 30</MenuItem>
                      <MenuItem value='net60'>Net 60</MenuItem>
                      <MenuItem value='net90'>Net 90</MenuItem>
                      <MenuItem value='letter_of_credit'>Letter of Credit</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Certifications</InputLabel>
                    <Select
                      multiple
                      value={filters.certifications}
                      label='Certifications'
                      onChange={e => handleFilterChange('certifications', e.target.value)}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip key={value} label={value} size='small' />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value='iso9001'>ISO 9001</MenuItem>
                      <MenuItem value='iso14001'>ISO 14001</MenuItem>
                      <MenuItem value='ce'>CE Marking</MenuItem>
                      <MenuItem value='fda'>FDA Approved</MenuItem>
                      <MenuItem value='rohs'>RoHS Compliant</MenuItem>
                    </Select>
                  </FormControl>
                </Collapse>

                <Button variant='outlined' fullWidth onClick={clearFilters} sx={{ mt: 2 }}>
                  Clear All Filters
                </Button>
              </>
            )}
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 700px', minWidth: 0 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant='h4' component='h1'>
              Search Results for "{query}"
            </Typography>
            <ExportResults results={results} onExport={handleExport} />
          </Box>

          {/* Sort Options */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='subtitle1'>Sort by:</Typography>
              <ToggleButtonGroup
                value={filters.sortBy}
                exclusive
                onChange={(_, value) => value && handleSortChange(value)}
                size='small'
              >
                <ToggleButton value='relevance'>
                  <Tooltip title='Sort by relevance'>
                    <SortIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='price'>
                  <Tooltip title='Sort by price'>
                    <AttachMoneyIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='date'>
                  <Tooltip title='Sort by date'>
                    <DateRangeIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='rating'>
                  <Tooltip title='Sort by rating'>
                    <Rating value={1} readOnly size='small' />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='quantity'>
                  <Tooltip title='Sort by quantity'>
                    <Typography variant='body2'>Qty</Typography>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle1' gutterBottom>
                Popular Searches
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {popularSearches.map(search => (
                  <Chip
                    key={search}
                    label={search}
                    onClick={() => handlePopularSearchClick(search)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Results Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedResults.map(rfq => (
              <Box key={rfq.id}>
                <Paper
                  sx={{
                    p: 2,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <Typography variant='h6' gutterBottom>
                    {rfq.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    {rfq.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Budget: $${rfq.budget.toLocaleString()}`} size='small' />
                    <Chip label={`Location: ${rfq.location}`} size='small' />
                    <Chip
                      label={`Status: ${rfq.status}`}
                      size='small'
                      color={rfq.status === 'open' ? 'success' : 'default'}
                    />
                    <Chip
                      label={`Deadline: ${new Date(rfq.deadline).toLocaleDateString()}`}
                      size='small'
                    />
                    {rfq.isVerified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label='Verified Supplier'
                        size='small'
                        color='success'
                      />
                    )}
                    {rfq.paymentTerms && (
                      <Chip icon={<PaymentIcon />} label={rfq.paymentTerms} size='small' />
                    )}
                  </Box>

                  {/* Shipping Calculator Section */}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 1 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant='subtitle2' color='primary'>
                        Shipping Calculator
                      </Typography>
                    </Box>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => toggleShippingCalculator(rfq.id)}
                      startIcon={<CalculateIcon />}
                    >
                      {expandedShipping[rfq.id] ? 'Hide' : 'Calculate Rates'}
                    </Button>
                  </Box>

                  <Collapse in={expandedShipping[rfq.id]}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                          <TextField
                            size='small'
                            label='From PIN'
                            value={shippingForm[rfq.id]?.fromPin || ''}
                            onChange={e => updateShippingForm(rfq.id, 'fromPin', e.target.value)}
                            inputProps={{ maxLength: 6 }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size='small'
                            label='To PIN'
                            value={shippingForm[rfq.id]?.toPin || ''}
                            onChange={e => updateShippingForm(rfq.id, 'toPin', e.target.value)}
                            inputProps={{ maxLength: 6 }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size='small'
                            label='Weight (kg)'
                            type='number'
                            value={shippingForm[rfq.id]?.weight || 1}
                            onChange={e =>
                              updateShippingForm(rfq.id, 'weight', parseFloat(e.target.value) || 1)
                            }
                            inputProps={{ min: 0.1, step: 0.1 }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>

                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => calculateShippingRates(rfq.id)}
                        disabled={
                          shippingLoading[rfq.id] ||
                          !shippingForm[rfq.id]?.fromPin ||
                          !shippingForm[rfq.id]?.toPin
                        }
                        sx={{ mb: 2 }}
                      >
                        {shippingLoading[rfq.id] ? 'Calculating...' : 'Get Live Rates'}
                      </Button>

                      {shippingRates[rfq.id] && (
                        <Grid container spacing={1}>
                          {shippingRates[rfq.id].slice(0, 3).map((rate: any, index: number) => (
                            <Grid item xs={4} key={index}>
                              <Card variant='outlined' sx={{ p: 1 }}>
                                <Typography variant='body2' fontWeight='bold'>
                                  {rate.courierName}
                                </Typography>
                                <Typography variant='h6' color='primary'>
                                  ₹{rate.totalCharge}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {rate.estimatedDeliveryDays} days
                                </Typography>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {results.length > ITEMS_PER_PAGE && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(results.length / ITEMS_PER_PAGE)}
                page={currentPage}
                onChange={handlePageChange}
                color='primary'
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {results.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='h6' color='text.secondary'>
                No results found for your search criteria
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                Try adjusting your filters or search terms
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SearchResults;
