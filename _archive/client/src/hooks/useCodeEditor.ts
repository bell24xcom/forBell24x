import { useState, useCallback, useRef, useEffect } from 'react';
import { AZRCodeAnalysis, AZRCodeCompletion, AZRTestGeneration } from '../services/azrCoderService';
import { useAZRCoder } from '../contexts/AZRCoderContext';

interface UseCodeEditorProps {
  initialCode?: string;
  language?: string;
  filePath?: string;
  autoAnalyze?: boolean;
  onCodeChange?: (code: string) => void;
  onAnalysisComplete?: (analysis: AZRCodeAnalysis | null) => void;
  onError?: (error: Error) => void;
}

export const useCodeEditor = ({
  initialCode = '',
  language = 'typescript',
  filePath,
  autoAnalyze = true,
  onCodeChange,
  onAnalysisComplete,
  onError,
}: UseCodeEditorProps = {}) => {
  // State for code and analysis results
  const [code, setCode] = useState(initialCode);
  const [analysis, setAnalysis] = useState<AZRCodeAnalysis | null>(null);
  const [completions, setCompletions] = useState<AZRCodeCompletion | null>(null);
  const [tests, setTests] = useState<AZRTestGeneration | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<{
    documentation: string;
    examples?: string[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for tracking editor state
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisTime = useRef<number>(0);

  // Get the AZR Coder service
  const {
    analyzeCode: analyzeWithAZR,
    getCodeCompletions: getCompletionsFromAZR,
    generateTests: generateTestsWithAZR,
    refactorCode: refactorWithAZR,
    generateDocumentation: generateDocsWithAZR,
    isAnalyzing: isAZRAnalyzing,
    error: azrError,
    clearError: clearAZRError,
  } = useAZRCoder();

  // Handle errors from the AZR Coder service
  useEffect(() => {
    if (azrError) {
      setError(azrError);
      onError?.(azrError);
    }
  }, [azrError, onError]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
    clearAZRError();
  }, [clearAZRError]);

  // Update code and trigger analysis if auto-analyze is enabled
  const updateCode = useCallback(
    (newCode: string, triggerAnalysis: boolean = autoAnalyze) => {
      setCode(newCode);
      onCodeChange?.(newCode);

      // Clear any existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set a new timer for auto-analyze
      if (triggerAnalysis) {
        debounceTimer.current = setTimeout(() => {
          analyzeCode(newCode);
        }, 1000); // 1 second debounce
      }
    },
    [autoAnalyze, onCodeChange]
  );

  // Analyze code
  const analyzeCode = useCallback(
    async (codeToAnalyze: string = code) => {
      // Prevent too frequent analysis (min 2 seconds between analyses)
      const now = Date.now();
      if (now - lastAnalysisTime.current < 2000) {
        return null;
      }
      lastAnalysisTime.current = now;

      try {
        setIsProcessing(true);
        const result = await analyzeWithAZR(codeToAnalyze, filePath);
        setAnalysis(result);
        onAnalysisComplete?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to analyze code');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, filePath, analyzeWithAZR, onAnalysisComplete, onError]
  );

  // Get code completions at the current cursor position
  const getCodeCompletions = useCallback(
    async (prefix: string, suffix: string = '') => {
      if (!editorRef.current) return null;

      try {
        setIsProcessing(true);
        const result = await getCompletionsFromAZR(prefix, suffix, { language });
        setCompletions(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get code completions');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [getCompletionsFromAZR, language, onError]
  );

  // Generate tests for the current code
  const generateTests = useCallback(
    async (testFramework: 'jest' | 'mocha' | 'jasmine' | 'pytest' = 'jest') => {
      try {
        setIsProcessing(true);
        const result = await generateTestsWithAZR(code, testFramework, { language });
        setTests(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate tests');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, generateTestsWithAZR, language, onError]
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
        const result = await refactorWithAZR(code, goals);
        setRefactoredCode(result.refactored);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to refactor code');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, refactorWithAZR, onError]
  );

  // Generate documentation for the current code
  const generateDocumentation = useCallback(
    async (format: 'jsdoc' | 'tsdoc' | 'markdown' = 'jsdoc') => {
      try {
        setIsProcessing(true);
        const result = await generateDocsWithAZR(code, format, { language });
        setDocumentation(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate documentation');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [code, generateDocsWithAZR, language, onError]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Space for code completions
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        if (editorRef.current) {
          const cursorPos = editorRef.current.selectionStart || 0;
          const prefix = code.slice(0, cursorPos);
          const suffix = code.slice(cursorPos);
          getCodeCompletions(prefix, suffix);
        }
      }
      // Ctrl+Enter to analyze code
      else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        analyzeCode();
      }
    },
    [code, getCodeCompletions, analyzeCode]
  );

  // Clean up on unmount
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
    refactoredCode,
    documentation,
    isProcessing: isProcessing || isAZRAnalyzing,
    error,

    // Refs
    editorRef,

    // Actions
    updateCode,
    analyzeCode,
    getCodeCompletions,
    generateTests,
    refactorCode,
    generateDocumentation,
    handleKeyDown,
    clearError,
  };
};

export default useCodeEditor;
