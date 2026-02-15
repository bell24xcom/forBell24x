/**
 * Types for the AI Search functionality
 */

export interface SearchResult {
  id: string;
  type: 'product' | 'supplier' | 'rfq' | 'category';
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  score: number;
  metadata?: Record<string, any>;
  highlightedText?: string;
}

export interface SearchSuggestion {
  type: 'recent' | 'suggestion' | 'popular';
  text: string;
  category?: string;
  score?: number;
  count?: number;
}

export interface SearchFilters {
  categories?: string[];
  priceRange?: [number, number];
  location?: string;
  rating?: number;
  inStock?: boolean;
  supplierTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  attributes?: Record<string, string | number | boolean>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  filters?: {
    categories: Array<{ name: string; count: number }>;
    priceRange: [number, number];
    locations: Array<{ name: string; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
  };
}

export interface SearchContextType {
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
