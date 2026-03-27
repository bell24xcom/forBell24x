import { useState, useEffect } from 'react';

interface SupplierStats {
  totalSuppliers: number;
  averageRating: number;
  totalCategories: number;
  totalProducts: number;
  topCategories: Array<{
    name: string;
    supplierCount: number;
  }>;
  topStates: Array<{
    state: string;
    count: number;
  }>;
  companyTypes: Array<{
    type: string;
    count: number;
  }>;
}

interface UseSupplierStatsReturn {
  stats: SupplierStats | null;
  loading: boolean;
  error: string | null;
}

export const useSupplierStats = (): UseSupplierStatsReturn => {
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/suppliers?stats=true');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Failed to fetch supplier statistics');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching supplier stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export default useSupplierStats;
