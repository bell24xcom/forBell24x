import { useMemo } from 'react';
import { categories, Category } from '../config/categories';

export function useCategories() {
  // In a real app, this could fetch from API or context
  return useMemo(
    () => ({
      categories,
      loading: false,
      error: null,
    }),
    []
  );
}
