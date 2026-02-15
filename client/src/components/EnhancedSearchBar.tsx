import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Fade,
  alpha,
} from '@mui/material';
import { useSearch } from '../contexts/SearchContext';
import { SearchSuggestion } from '../services/search/types';
import { useCategories } from '../hooks/useCategories';

interface EnhancedSearchBarProps {
  onSearch?: (query: string, category?: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  placeholder = 'Search products, suppliers, or RFQs...',
  showFilters = true,
  autoFocus = false,
  size = 'medium',
  fullWidth = true,
  variant = 'outlined',
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { search, getSuggestions, recentSearches, popularSearches } = useSearch();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  // Prepare category options for the dropdown
  const categoryOptions = ['All Categories', ...categories.map(cat => cat.name)];

  // Update search query from URL on initial load
  useEffect(() => {
    if (router.isReady && router.query.q) {
      const query = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q;
      setSearchQuery(query);

      if (router.query.category) {
        const category = Array.isArray(router.query.category)
          ? router.query.category[0]
          : router.query.category;
        setSelectedCategory(decodeURIComponent(category));
      }
    }
  }, [router.isReady, router.query.q, router.query.category]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions(
          [
            ...recentSearches,
            ...popularSearches.filter(p => !recentSearches.some(r => r.text === p.text)),
          ].slice(0, 5)
        );
        return;
      }

      setLoading(true);
      try {
        const result = await getSuggestions(searchQuery);
        setSuggestions(result);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, getSuggestions, recentSearches, popularSearches]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    // Update URL
    const queryParams = new URLSearchParams();
    queryParams.set('q', searchQuery);

    if (selectedCategory !== 'All Categories') {
      queryParams.set('category', selectedCategory);
    }

    router.push(
      {
        pathname: '/search',
        search: queryParams.toString(),
      },
      undefined,
      { shallow: true }
    );

    // Execute search
    search(
      searchQuery,
      selectedCategory !== 'All Categories' ? { categories: [selectedCategory] } : {}
    );

    if (onSearch) {
      onSearch(searchQuery, selectedCategory !== 'All Categories' ? selectedCategory : undefined);
    }

    setShowSuggestions(false);
  }, [searchQuery, selectedCategory, router, search, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCategory(e.target.value as string);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);

    // If it's a category suggestion, update the category
    if (suggestion.category && categoryOptions.includes(suggestion.category)) {
      setSelectedCategory(suggestion.category);
    }

    // Focus the input and hide suggestions
    searchInputRef.current?.focus();
    setShowSuggestions(false);

    // Trigger search after a small delay
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const renderSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <HistoryIcon fontSize='small' color='action' />;
      case 'popular':
        return <TrendingUpIcon fontSize='small' color='primary' />;
      case 'suggestion':
      default:
        return <SearchIcon fontSize='small' color='action' />;
    }
  };

  const renderSuggestionText = (suggestion: SearchSuggestion) => {
    if (!searchQuery) return suggestion.text;

    const index = suggestion.text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return suggestion.text;

    return (
      <span>
        {suggestion.text.substring(0, index)}
        <strong>{suggestion.text.substring(index, index + searchQuery.length)}</strong>
        {suggestion.text.substring(index + searchQuery.length)}
      </span>
    );
  };

  return (
    <Box ref={containerRef} sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: size === 'small' ? 2 : 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: 4,
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          {showFilters && !isMobile && (
            <>
              <TextField
                select
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant='standard'
                disabled={categoriesLoading}
                size={size}
                sx={{
                  minWidth: 150,
                  mx: 1,
                  '& .MuiInput-underline:before': {
                    borderBottom: 'none',
                  },
                  '& .MuiInput-underline:after': {
                    borderBottom: 'none',
                  },
                  '& .MuiSelect-select': {
                    py: size === 'small' ? 1 : 1.5,
                    color: 'primary.main',
                    fontWeight: 500,
                  },
                }}
                SelectProps={{
                  IconComponent: () => (categoriesLoading ? <CircularProgress size={16} /> : null),
                  renderValue: selected => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon fontSize='small' sx={{ mr: 1, color: 'primary.main' }} />
                      {selected as string}
                    </Box>
                  ),
                }}
              >
                {categoryOptions.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />
            </>
          )}

          <TextField
            fullWidth
            variant='standard'
            placeholder={placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            inputRef={searchInputRef}
            autoFocus={autoFocus}
            size={size}
            sx={{
              '& .MuiInput-underline:before': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:after': {
                borderBottom: 'none',
              },
              '& .MuiInputBase-root': {
                py: 0.5,
              },
              '& .MuiInputBase-input': {
                py: size === 'small' ? 1 : 1.5,
                px: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={handleClearSearch} sx={{ mr: -1 }}>
                    <CloseIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
          />

          <Button
            variant='contained'
            color='primary'
            onClick={handleSearch}
            size={size}
            sx={{
              borderRadius: size === 'small' ? 2 : 3,
              px: size === 'small' ? 2 : 4,
              py: size === 'small' ? 1 : 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            {isMobile ? <SearchIcon /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Search Suggestions */}
      <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
        <Popper
          open={showSuggestions && (suggestions.length > 0 || loading)}
          anchorEl={containerRef.current}
          placement='bottom-start'
          style={{ width: containerRef.current?.offsetWidth, zIndex: 1300 }}
        >
          <Fade in={showSuggestions}>
            <Paper
              elevation={8}
              sx={{
                mt: 1,
                maxHeight: 400,
                overflow: 'auto',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {loading ? (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItemButton
                      key={`${suggestion.type}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon>{renderSuggestionIcon(suggestion.type)}</ListItemIcon>
                      <ListItemText
                        primary={renderSuggestionText(suggestion)}
                        secondary={
                          suggestion.category && (
                            <Chip
                              label={suggestion.category}
                              size='small'
                              variant='outlined'
                              sx={{ mt: 0.5 }}
                            />
                          )
                        }
                      />
                      {suggestion.type === 'popular' && (
                        <TrendingUpIcon fontSize='small' color='primary' />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Paper>
          </Fade>
        </Popper>
      </ClickAwayListener>
    </Box>
  );
};

export default EnhancedSearchBar;
