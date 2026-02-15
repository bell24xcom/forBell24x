import { useState, useCallback, useEffect, useRef } from 'react';
import { useAZRCoder } from '../contexts/AZRCoderContext';
import { AZRCodeAnalysis, AZRCodeCompletion, AZRTestGeneration } from '../services/azrCoderService';

interface UseAZRCoderIntegrationProps {
  initialCode?: string;
  filePath?: string;
  language?: string;
  onAnalysisComplete?: (analysis: AZRCodeAnalysis | null) => void;
  onError?: (error: Error) => void;
}

export const useAZRCoderIntegration = ({
  initialCode = '',
  filePath,
  language = 'typescript',
  onAnalysisComplete,
  onError,
}: UseAZRCoderIntegrationProps = {}) => {
  const {
    analyzeCode: analyzeCodeService,
    getCodeCompletions: getCodeCompletionsService,
    generateTests: generateTestsService,
    refactorCode: refactorCodeService,
    generateDocumentation: generateDocumentationService,
    isAnalyzing,
    error,
    clearError: clearServiceError,
  } = useAZRCoder();

  const [code, setCode] = useState(initialCode);
  const [analysis, setAnalysis] = useState<AZRCodeAnalysis | null>(null);
  const [completions, setCompletions] = useState<AZRCodeCompletion | null>(null);
  const [tests, setTests] = useState<AZRTestGeneration | null>(null);
  const [documentation, setDocumentation] = useState<{
    documentation: string;
    examples?: string[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle errors from the service
  useEffect(() => {
    if (error) {
      setLocalError(error);
      onError?.(error);
    }
  }, [error, onError]);

  // Clear any existing errors
  const clearError = useCallback(() => {
    setLocalError(null);
    clearServiceError();
  }, [clearServiceError]);

  // Analyze code with debounce
  const analyzeCode = useCallback(
    async (newCode: string = code) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      return new Promise<AZRCodeAnalysis | null>(resolve => {
        debounceTimer.current = setTimeout(async () => {
          try {
            setIsProcessing(true);
            const result = await analyzeCodeService(newCode, filePath);
            setAnalysis(result);
            onAnalysisComplete?.(result);
            resolve(result);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to analyze code');
            setLocalError(error);
            onError?.(error);
            throw error;
          } finally {
            setIsProcessing(false);
          }
        }, 1000); // 1 second debounce
      });
    },
    [code, filePath, analyzeCodeService, onAnalysisComplete, onError]
  );

  // Get code completions
  const getCodeCompletions = useCallback(
    async (prefix: string, suffix: string = '', context: Record<string, any> = {}) => {
      try {
        setIsProcessing(true);
        const result = await getCodeCompletionsService(prefix, suffix, { ...context, language });
        setCompletions(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get code completions');
        setLocalError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [getCodeCompletionsService, language, onError]
  );

  // Generate tests for the current code
  const generateTests = useCallback(
    async (testFramework: 'jest' | 'mocha' | 'jasmine' | 'pytest' = 'jest', options: any = {}) => {
      try {
        setIsProcessing(true);
        const result = await generateTestsService(code, testFramework, { ...options, language });
        setTests(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate tests');
        setLocalError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, generateTestsService, language, onError]
  );

  // Refactor the current code
  const refactorCode = useCallback(
    async (
      goals: Array<'performance' | 'readability' | 'security' | 'best-practices'> = [
        'best-practices',
      ]
    ) => {
      try {
        setIsProcessing(true);
        const result = await refactorCodeService(code, goals);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to refactor code');
        setLocalError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, refactorCodeService, onError]
  );

  // Generate documentation for the current code
  const generateDocumentation = useCallback(
    async (format: 'jsdoc' | 'tsdoc' | 'markdown' = 'jsdoc', options: any = {}) => {
      try {
        setIsProcessing(true);
        const result = await generateDocumentationService(code, format, { ...options, language });
        setDocumentation(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate documentation');
        setLocalError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, generateDocumentationService, language, onError]
  );

  // Update code and optionally trigger analysis
  const updateCode = useCallback(
    (newCode: string, triggerAnalysis: boolean = true) => {
      setCode(newCode);
      if (triggerAnalysis) {
        analyzeCode(newCode).catch(() => {
          // Error handling is done in analyzeCode
        });
      }
    },
    [analyzeCode]
  );

  return {
    code,
    updateCode,
    analysis,
    completions,
    tests,
    documentation,
    isProcessing: isProcessing || isAnalyzing,
    error: localError,
    clearError,
    analyzeCode,
    getCodeCompletions,
    generateTests,
    refactorCode,
    generateDocumentation,
  };
};
