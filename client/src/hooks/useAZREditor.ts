import { useState, useCallback, useRef, useEffect } from 'react';
import { useAZRCoder } from '../contexts/AZRCoderContext';
import { AZRCodeAnalysis, AZRCodeCompletion, AZRTestGeneration } from '../services/azrCoderService';
import { AZR_CODER_CONFIG } from '../config/azrCoderConfig';

interface UseAZREditorProps {
  initialCode?: string;
  language?: string;
  filePath?: string;
  autoAnalyze?: boolean;
  onAnalysisComplete?: (analysis: AZRCodeAnalysis) => void;
  onError?: (error: Error) => void;
}

export const useAZREditor = ({
  initialCode = '',
  language = AZR_CODER_CONFIG.DEFAULT_LANGUAGE,
  filePath,
  autoAnalyze = true,
  onAnalysisComplete,
  onError,
}: UseAZREditorProps = {}) => {
  const {
    analyzeCode: analyzeCodeService,
    getCodeCompletions: getCodeCompletionsService,
    generateTests: generateTestsService,
    refactorCode: refactorCodeService,
    generateDocumentation: generateDocumentationService,
    isAnalyzing,
    error,
    clearError: clearServiceError,
    config,
    language: contextLanguage,
    languageConfig,
  } = useAZRCoder();

  const [code, setCode] = useState(initialCode);
  const [analysis, setAnalysis] = useState<AZRCodeAnalysis | null>(null);
  const [completions, setCompletions] = useState<AZRCodeCompletion | null>(null);
  const [tests, setTests] = useState<AZRTestGeneration | null>(null);
  const [documentation, setDocumentation] = useState<{
    documentation: string;
    examples?: string[];
  } | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosition = useRef<number>(0);

  // Update local error when error from context changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
      onError?.(error);
    }
  }, [error, onError]);

  // Clear errors
  const clearError = useCallback(() => {
    setLocalError(null);
    clearServiceError();
  }, [clearServiceError]);

  // Handle code changes with debounce
  const handleCodeChange = useCallback(
    (newCode: string, cursorPos: number = 0) => {
      setCode(newCode);
      cursorPosition.current = cursorPos;

      // Clear any pending debounced calls
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Only auto-analyze if enabled
      if (autoAnalyze) {
        debounceTimer.current = setTimeout(() => {
          analyzeCode(newCode);
        }, config.ANALYSIS.DEBOUNCE_MS);
      }
    },
    [autoAnalyze, config.ANALYSIS.DEBOUNCE_MS]
  );

  // Analyze code
  const analyzeCode = useCallback(
    async (codeToAnalyze: string = code) => {
      if (!config.ANALYSIS.AUTO_ANALYZE) return null;

      setIsProcessing(true);
      try {
        const result = await analyzeCodeService(codeToAnalyze, filePath);
        if (result) {
          setAnalysis(result);
          onAnalysisComplete?.(result);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to analyze code');
        setLocalError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, filePath, analyzeCodeService, onAnalysisComplete, onError, config.ANALYSIS.AUTO_ANALYZE]
  );

  // Get code completions
  const getCodeCompletions = useCallback(
    async (prefix: string, suffix: string = '') => {
      setIsProcessing(true);
      try {
        const context = {
          language: language || contextLanguage,
          filePath,
          cursorPosition: cursorPosition.current,
        };

        const result = await getCodeCompletionsService(prefix, suffix, context);
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
    [filePath, getCodeCompletionsService, language, contextLanguage, onError]
  );

  // Generate tests
  const generateTests = useCallback(
    async (testFramework?: string, options: any = {}) => {
      setIsProcessing(true);
      try {
        const framework = testFramework || config.TEST_GENERATION.DEFAULT_FRAMEWORK;
        const result = await generateTestsService(code, framework as any, {
          ...options,
          language: language || contextLanguage,
          includeDescriptions:
            options.includeDescriptions ?? config.TEST_GENERATION.INCLUDE_DESCRIPTIONS,
          includeAssertions: options.includeAssertions ?? config.TEST_GENERATION.INCLUDE_ASSERTIONS,
          includeSetup: options.includeSetup ?? config.TEST_GENERATION.INCLUDE_SETUP,
        });
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
    [code, generateTestsService, language, contextLanguage, config.TEST_GENERATION, onError]
  );

  // Refactor code
  const refactorCode = useCallback(
    async (goals?: string[]) => {
      setIsProcessing(true);
      try {
        const refactorGoals = goals?.length ? goals : config.REFACTORING.DEFAULT_GOALS;
        const result = await refactorCodeService(code, refactorGoals as any);
        setRefactoredCode(result.refactored);
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
    [code, refactorCodeService, config.REFACTORING.DEFAULT_GOALS, onError]
  );

  // Generate documentation
  const generateDocumentation = useCallback(
    async (format?: string, options: any = {}) => {
      setIsProcessing(true);
      try {
        const docFormat = format || config.DOCUMENTATION.DEFAULT_FORMAT;
        const result = await generateDocumentationService(code, docFormat as any, {
          ...options,
          language: language || contextLanguage,
          includeExamples: options.includeExamples ?? config.DOCUMENTATION.INCLUDE_EXAMPLES,
          includeParamDescriptions:
            options.includeParamDescriptions ?? config.DOCUMENTATION.INCLUDE_PARAM_DESCRIPTIONS,
          includeReturnDocs: options.includeReturnDocs ?? config.DOCUMENTATION.INCLUDE_RETURN_DOCS,
        });
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
    [code, generateDocumentationService, language, contextLanguage, config.DOCUMENTATION, onError]
  );

  // Apply a completion
  const applyCompletion = useCallback(
    (completionText: string) => {
      if (!editorRef.current) return;

      const start = cursorPosition.current;
      const beforeCursor = code.slice(0, start);
      const afterCursor = code.slice(start);
      const newCode = beforeCursor + completionText + afterCursor;

      setCode(newCode);

      // Move cursor to the end of the inserted text
      const newCursorPos = start + completionText.length;
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);

      return newCode;
    },
    [code]
  );

  // Apply refactored code
  const applyRefactoring = useCallback(() => {
    if (!refactoredCode) return;
    setCode(refactoredCode);
    return refactoredCode;
  }, [refactoredCode]);

  // Clear all analysis data
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setCompletions(null);
    setTests(null);
    setDocumentation(null);
    setRefactoredCode(null);
    setLocalError(null);
    clearServiceError();
  }, [clearServiceError]);

  // Reset to initial code
  const resetCode = useCallback(() => {
    setCode(initialCode);
    clearAnalysis();
  }, [initialCode, clearAnalysis]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    // State
    code,
    analysis,
    completions,
    tests,
    documentation,
    refactoredCode,
    isProcessing: isProcessing || isAnalyzing,
    error: localError,
    language,
    languageConfig,

    // Refs
    editorRef,

    // Actions
    setCode: handleCodeChange,
    analyzeCode,
    getCodeCompletions,
    generateTests,
    refactorCode,
    generateDocumentation,
    applyCompletion,
    applyRefactoring,
    clearAnalysis,
    resetCode,
    clearError,
  };
};

export default useAZREditor;
