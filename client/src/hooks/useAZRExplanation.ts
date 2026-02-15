import { useState, useCallback } from 'react';
import { AZRRequestOptions, AZRExplanation, azrService } from '../services/azrService';

export const useAZRExplanation = () => {
  const [explanation, setExplanation] = useState<AZRExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get an explanation from AZR
   */
  const getExplanation = useCallback(async (options: AZRRequestOptions) => {
    setLoading(true);
    setError(null);

    try {
      const result = await azrService.getExplanationWithOptions(options.input, options);
      setExplanation(result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to analyze supplier risk';
      console.error('Failed to get supplier risk score:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get supplier risk score with explanation
   */
  const getSupplierRiskScore = useCallback(async (supplierData: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await azrService.getSupplierRiskScore(supplierData);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get explanation';
      console.error('Failed to get AZR explanation:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setExplanation(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    explanation,
    loading,
    error,
    getExplanation,
    getSupplierRiskScore,
    reset,
  };
};

export default useAZRExplanation;
