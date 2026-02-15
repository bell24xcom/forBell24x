'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SearchResult, SearchSuggestion, SearchFilters } from '../services/search/types';
import axios from 'axios';

interface SearchProviderProps {
  children: React.ReactNode;
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
}

const SearchContext = createContext<
  | {
      query: string;
      results: SearchResult[];
      loading: boolean;
      error: string | null;
      search: (query: string, filters?: Partial<SearchFilters>) => Promise<void>;
      clearResults: () => void;
      filters: Partial<SearchFilters>;
      setFilters: (filters: Partial<SearchFilters>) => void;
      totalResults: number;
      hasMore: boolean;
      loadMore: () => Promise<void>;
      recentSearches: SearchSuggestion[];
      popularSearches: SearchSuggestion[];
      getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
    }
  | undefined
>(undefined);

export const SearchProvider: React.FC<SearchProviderProps> = ({
  children,
  initialQuery = '',
  initialFilters = {},
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Partial<SearchFilters>>(initialFilters);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);
  const [isClient, setIsClient] = useState(false);

  const limit = 10;
  const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SEARCH_API_URL || '/api/search';

  useEffect(() => {
    setIsClient(true);

    // Load search history from localStorage only on client-side
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('bell24h_search_history');
        if (savedHistory) {
          setRecentSearches(
            JSON.parse(savedHistory).map((text: string) => ({ type: 'recent' as const, text }))
          );
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/popular`);
        const searches = response.data.popularSearches || [];
        setPopularSearches(
          searches.map((item: any) => ({
            type: 'popular',
            text: item.term,
            count: item.count,
          }))
        );
      } catch (err) {
        console.error('Failed to load popular searches:', err);
      }
    };
    loadPopularSearches();
  }, []);

  useEffect(() => {
    if (recentSearches.length > 0) {
      try {
        localStorage.setItem(
          'bell24h_search_history',
          JSON.stringify(recentSearches.map(s => s.text).slice(0, 10))
        );
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }
  }, [recentSearches]);

  const search = useCallback(
    async (searchQuery: string, searchFilters: Partial<SearchFilters> = {}) => {
      if (!isClient || !searchQuery.trim()) {
        setResults([]);
        setTotalResults(0);
        setHasMore(false);
        return;
      }
      setQuery(searchQuery);
      setLoading(true);
      setError(null);
      setOffset(0);
      try {
        setRecentSearches(prev => [
          { type: 'recent' as const, text: searchQuery },
          ...prev.filter(s => s.text.toLowerCase() !== searchQuery.toLowerCase()).slice(0, 9),
        ]);
        const mergedFilters = { ...filters, ...searchFilters };
        setFiltersState(mergedFilters);
        const params: any = {
          q: searchQuery,
          limit,
          offset: 0,
          ...mergedFilters,
        };
        const response = await axios.get(`${API_BASE_URL}`, { params });
        const { results: searchResults, total } = response.data;
        try {
          await axios.post(`${API_BASE_URL}/log`, { term: searchQuery });
        } catch (logError) {
          console.error('Error logging search:', logError);
        }
        setResults(searchResults || []);
        setTotalResults(total || 0);
        setHasMore((searchResults?.length || 0) >= limit);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        setResults([]);
        setTotalResults(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [filters, recentSearches, isClient]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const newOffset = offset + limit;
    try {
      const params: any = {
        q: query,
        limit,
        offset: newOffset,
        ...filters,
      };
      const response = await axios.get(`${API_BASE_URL}`, { params });
      const { results: moreResults } = response.data;
      setResults(prev => [...prev, ...(moreResults || [])]);
      setOffset(newOffset);
      setHasMore((moreResults?.length || 0) >= limit);
    } catch (err) {
      console.error('Error loading more results:', err);
      setError('Failed to load more results');
    } finally {
      setLoading(false);
    }
  }, [query, filters, hasMore, loading, offset, isClient]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setTotalResults(0);
    setHasMore(false);
    setError(null);
    setOffset(0);
  }, []);

  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const getSuggestions = useCallback(
    async (query: string): Promise<SearchSuggestion[]> => {
      if (!isClient || !query.trim()) {
        return [
          ...recentSearches,
          ...popularSearches.filter(p => !recentSearches.some(r => r.text === p.text)),
        ].slice(0, 5);
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/suggest`, {
          params: { q: query, limit: 5 },
        });
        return response.data.suggestions || [];
      } catch (err) {
        console.error('Error getting suggestions:', err);
        return [];
      }
    },
    [recentSearches, popularSearches, isClient]
  );

  const contextValue = {
    query,
    results,
    loading,
    error,
    search,
    clearResults,
    filters,
    setFilters,
    totalResults,
    hasMore,
    loadMore,
    recentSearches,
    popularSearches,
    getSuggestions,
  };

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;
