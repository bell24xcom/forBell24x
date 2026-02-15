'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Category, SubCategory } from '../types/categories';
import { categoryService } from '../../../services/categories/CategoryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Search, TrendingUp, Star, Calendar, Filter, X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CategoryDetailProps {
  categoryId: string;
}

type SortOption = 'name' | 'activeRfqs' | 'lastUpdated';
type ViewMode = 'grid' | 'list';

export const CategoryDetail: React.FC<CategoryDetailProps> = ({ categoryId }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategoryById(categoryId);
        if (!data) {
          throw new Error('Category not found');
        }
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const filteredSubcategories = useMemo(() => {
    if (!category) return [];

    let filtered = [...category.subcategories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(query) ||
        sub.description.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (dateRange) {
      filtered = filtered.filter(sub => 
        sub.lastUpdated >= dateRange.from &&
        sub.lastUpdated <= dateRange.to
      );
    }

    // Apply active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(sub => 
        activeFilters.some(filter => 
          sub.name.toLowerCase().includes(filter.toLowerCase()) ||
          sub.description.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'activeRfqs':
          return b.activeRfqs - a.activeRfqs;
        case 'lastUpdated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [category, searchQuery, dateRange, sortBy, activeFilters]);

  const handleFilterAdd = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleFilterRemove = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange(null);
    setActiveFilters([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center text-gray-500 p-4">
        Category not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{category.icon}</span>
              <div>
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {category.totalRfqs} Total RFQs
              </Badge>
              <Badge variant="default">
                {category.activeRfqs} Active
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Date Range */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subcategories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-auto"
              />
            </div>

            {/* Sort and View Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="activeRfqs">Active RFQs</SelectItem>
                    <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <line x1="8" x2="21" y1="6" y2="6" />
                      <line x1="8" x2="21" y1="12" y2="12" />
                      <line x1="8" x2="21" y1="18" y2="18" />
                      <line x1="3" x2="3.01" y1="6" y2="6" />
                      <line x1="3" x2="3.01" y1="12" y2="12" />
                      <line x1="3" x2="3.01" y1="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{filter}</span>
                    <button
                      onClick={() => handleFilterRemove(filter)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subcategories Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-4"
      }>
        {filteredSubcategories.map((subcategory) => (
          <Card 
            key={subcategory.id} 
            className={`hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'flex items-center justify-between p-4' : ''
            }`}
          >
            <CardHeader className={viewMode === 'list' ? 'p-0' : ''}>
              <div className={`flex items-center justify-between ${
                viewMode === 'list' ? 'flex-1' : ''
              }`}>
                <CardTitle className={`${viewMode === 'list' ? 'text-lg' : ''}`}>
                  {subcategory.name}
                </CardTitle>
                <Badge variant="outline">
                  {subcategory.activeRfqs} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={viewMode === 'list' ? 'p-0' : ''}>
              <div className={viewMode === 'list' ? 'flex items-center space-x-4' : ''}>
                <p className={`text-sm text-muted-foreground ${
                  viewMode === 'list' ? 'flex-1' : 'mb-4'
                }`}>
                  {subcategory.description}
                </p>
                <div className={`flex items-center justify-between text-sm ${
                  viewMode === 'list' ? 'w-48' : ''
                }`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Updated {format(subcategory.lastUpdated, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    View RFQs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredSubcategories.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No subcategories found matching your filters
        </div>
      )}
    </div>
  );
}; 