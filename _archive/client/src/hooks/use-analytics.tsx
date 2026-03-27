import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Analytics data types
interface SupplierRiskData {
  supplier: string;
  company: string;
  risk_score: number;
  analysis: string;
  risk_factors: string[];
  recommendations: string[];
}

interface MarketInsightsData {
  trends: string[];
  opportunities: string[];
  risks: string[];
  key_players: string[];
  summary: string;
}

export function useAnalytics() {
  const { toast } = useToast();

  // Get supplier risk analysis
  const getSupplierRisk = (supplierId: number) => {
    return useQuery<SupplierRiskData>({
      queryKey: [`/api/suppliers/${supplierId}/risk`],
      enabled: !!supplierId, // Only run query if supplierId is provided
    });
  };

  // Get market insights for a specific industry
  const getMarketInsights = (industry: string) => {
    return useQuery<MarketInsightsData>({
      queryKey: [`/api/market/${industry}`],
      enabled: !!industry, // Only run query if industry is provided
    });
  };

  // Verify blockchain transaction
  const verifyBlockchainTransaction = (hash: string) => {
    return useQuery<any>({
      queryKey: [`/api/blockchain/${hash}`],
      enabled: !!hash, // Only run query if hash is provided
    });
  };

  // Analyze RFQ
  const analyzeRFQMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/rfqs/${id}/analyze`, {});
      return res.json();
    },
    onSuccess: data => {
      toast({
        title: 'RFQ Analysis Complete',
        description: 'The RFQ has been analyzed successfully.',
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to analyze RFQ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    getSupplierRisk,
    getMarketInsights,
    verifyBlockchainTransaction,
    analyzeRFQMutation,
  };
}
