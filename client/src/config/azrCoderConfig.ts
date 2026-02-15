/**
 * Configuration for AZR-CODER-7B integration
 */

export const AZR_CODER_CONFIG = {
  // Base URL for the AZR-CODER-7B API
  API_BASE_URL: process.env.NEXT_PUBLIC_AZR_CODER_API_URL || 'http://localhost:5000/api',

  // Default API key (should be stored in environment variables in production)
  API_KEY: process.env.NEXT_PUBLIC_AZR_CODER_API_KEY || '',

  // Default language settings
  DEFAULT_LANGUAGE: 'typescript',

  // Analysis settings
  ANALYSIS: {
    // Whether to automatically analyze code on change
    AUTO_ANALYZE: true,
    // Debounce time in milliseconds for auto-analysis
    DEBOUNCE_MS: 1000,
    // Maximum file size to analyze (in bytes)
    MAX_FILE_SIZE: 1024 * 1024, // 1MB
  },

  // Code completion settings
  COMPLETION: {
    // Maximum number of completions to return
    MAX_COMPLETIONS: 5,
    // Minimum confidence score for completions (0-1)
    MIN_CONFIDENCE: 0.3,
  },

  // Test generation settings
  TEST_GENERATION: {
    // Default test framework
    DEFAULT_FRAMEWORK: 'jest',
    // Whether to include test descriptions
    INCLUDE_DESCRIPTIONS: true,
    // Whether to include test assertions
    INCLUDE_ASSERTIONS: true,
    // Whether to include test setup/teardown
    INCLUDE_SETUP: true,
  },

  // Documentation generation settings
  DOCUMENTATION: {
    // Default documentation format
    DEFAULT_FORMAT: 'jsdoc',
    // Whether to include examples in documentation
    INCLUDE_EXAMPLES: true,
    // Whether to include parameter descriptions
    INCLUDE_PARAM_DESCRIPTIONS: true,
    // Whether to include return type documentation
    INCLUDE_RETURN_DOCS: true,
  },

  // Refactoring settings
  REFACTORING: {
    // Default refactoring goals
    DEFAULT_GOALS: ['best-practices', 'readability'],
    // Whether to include explanations for refactorings
    INCLUDE_EXPLANATIONS: true,
  },

  // UI settings
  UI: {
    // Whether to show analysis notifications
    SHOW_ANALYSIS_NOTIFICATIONS: true,
    // Whether to show success notifications
    SHOW_SUCCESS_NOTIFICATIONS: true,
    // Whether to show error notifications
    SHOW_ERROR_NOTIFICATIONS: true,
    // Whether to show warning notifications
    SHOW_WARNING_NOTIFICATIONS: true,
    // Notification display duration in milliseconds
    NOTIFICATION_DURATION: 5000,
  },
};

// Language-specific configurations
export const LANGUAGE_CONFIGS = {
  typescript: {
    fileExtensions: ['.ts', '.tsx'],
    testFrameworks: ['jest', 'mocha', 'jasmine'],
    documentationFormats: ['jsdoc', 'tsdoc', 'markdown'],
  },
  javascript: {
    fileExtensions: ['.js', '.jsx'],
    testFrameworks: ['jest', 'mocha', 'jasmine'],
    documentationFormats: ['jsdoc', 'markdown'],
  },
  python: {
    fileExtensions: ['.py'],
    testFrameworks: ['pytest', 'unittest'],
    documentationFormats: ['google', 'numpydoc', 'restructuredtext'],
  },
  // Add more languages as needed
};

// Get configuration for a specific language
export function getLanguageConfig(language: string) {
  return (
    LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS] || {
      fileExtensions: [],
      testFrameworks: [],
      documentationFormats: ['markdown'],
    }
  );
}

// Get the appropriate language from a file extension
export function getLanguageFromExtension(extension: string): string {
  for (const [lang, config] of Object.entries(LANGUAGE_CONFIGS)) {
    if (config.fileExtensions.includes(extension)) {
      return lang;
    }
  }
  return 'plaintext';
}

// Default export for backward compatibility
export default AZR_CODER_CONFIG;
