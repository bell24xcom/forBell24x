'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { Category, CategoryStats } from '../types/categories';
import { categoryService } from '../../../services/categories/CategoryService';
import { ErrorBoundary } from '../shared/ErrorBoundary';

export const CategoryOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoryStats, categoryList] = await Promise.all([
        categoryService.getCategoryStats(),
        categoryService.getCategories()
      ]);

      setStats(categoryStats);
      setCategories(categoryList);
    } catch (err) {
      setError('Failed to fetch category data');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Categories & RFQs
        </Typography>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Categories
                </Typography>
                <Typography variant="h4">
                  {stats?.totalCategories}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Subcategories
                </Typography>
                <Typography variant="h4">
                  {stats?.totalSubcategories}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total RFQs
                </Typography>
                <Typography variant="h4">
                  {stats?.totalRfqs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active RFQs
                </Typography>
                <Typography variant="h4">
                  {stats?.activeRfqs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Categories List */}
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} md={6} key={category.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {category.icon} {category.name}
                    </Typography>
                    <Chip
                      label={`${category.activeRfqs} Active RFQs`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" paragraph>
                    {category.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Subcategories
                  </Typography>
                  <List dense>
                    {category.subcategories.map((sub) => (
                      <ListItem key={sub.id}>
                        <ListItemText
                          primary={sub.name}
                          secondary={`${sub.activeRfqs} active RFQs`}
                        />
                        <Chip
                          label={new Date(sub.lastUpdated).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {stats?.recentActivity.map((activity, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {activity.action === 'new' ? '🆕' : activity.action === 'update' ? '📝' : '✅'}
                </ListItemIcon>
                <ListItemText
                  primary={activity.categoryName}
                  secondary={new Date(activity.timestamp).toLocaleString()}
                />
                <Chip
                  label={activity.action}
                  color={activity.action === 'new' ? 'success' : 'primary'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}; 