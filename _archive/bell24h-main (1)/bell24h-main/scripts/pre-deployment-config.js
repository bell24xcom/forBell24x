module.exports = {
  // File checks configuration
  requiredFiles: [
    'package.json',
    'package-lock.json',
    'src/index.js',
    'public/index.html',
    '.gitignore'
  ],

  // Environment variables configuration
  requiredEnvVars: [
    'NODE_ENV',
    'REACT_APP_API_URL'
  ],

  // Security configuration
  sensitiveFiles: [
    '.env.local',
    '.env.production',
    'private.key',
    'server.key'
  ],

  // Performance thresholds
  performance: {
    maxBundleSize: 5 * 1024 * 1024, // 5MB
    warningBundleSize: 1024 * 1024, // 1MB
    minCodeCoverage: 80,
    warningCodeCoverage: 60
  },

  // Security patterns
  securityPatterns: [
    /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
    /secret\s*[:=]\s*["'][^"']+["']/i,
    /password\s*[:=]\s*["'][^"']+["']/i,
    /token\s*[:=]\s*["'][^"']+["']/i
  ],

  // Build configuration
  build: {
    requiredFiles: ['index.html', 'static'],
    maxAge: 10 // minutes
  },

  // Test configuration
  test: {
    requiredFiles: [
      'src/App.test.js',
      'src/setupTests.js'
    ],
    coverageThreshold: 80
  },

  // Code quality configuration
  codeQuality: {
    requiredConfigs: [
      '.eslintrc',
      '.prettierrc'
    ],
    fileExtensions: ['.js', '.jsx', '.ts', '.tsx']
  },

  // Accessibility configuration
  accessibility: {
    requiredDependencies: [
      '@axe-core/react',
      'react-axe',
      '@testing-library/jest-dom'
    ],
    semanticElements: [
      'main',
      'nav',
      'article',
      'section',
      'header',
      'footer',
      'aside'
    ]
  },

  // API configuration
  api: {
    configPaths: [
      'src/config/api.js',
      'src/config/api.ts',
      'src/services/api.js',
      'src/services/api.ts',
      'src/utils/api.js',
      'src/utils/api.ts'
    ],
    docPaths: [
      'api-docs',
      'docs/api'
    ]
  },

  // Deployment readiness thresholds
  deployment: {
    maxWarnings: 3,
    requiredScripts: ['start', 'build', 'test']
  }
}; 