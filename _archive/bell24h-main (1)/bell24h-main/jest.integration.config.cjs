// jest.integration.config.js
const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/integration/**/*.[jt]s?(x)',
    '**/?(*.)+(integration|spec|test).[jt]s?(x)',
  ],
  // Override moduleNameMapper if necessary for backend paths, or clear it if not needed
  // For example, if your backend doesn't use the same '@/' aliases as the client:
  moduleNameMapper: {
    // Add any specific backend aliases here if needed
    // '^@/server/(.*)$': '<rootDir>/src/server/$1',
    // If client-side aliases cause issues, you might need to unset them or provide mocks
    '^@/(.*)$': '<rootDir>/src/$1', // Assuming src is the root for backend files too for now
    '^@/components/(.*)$': '<rootDir>/src/components/$1', // Example, adjust as needed
  },
  // If your integration tests are in a specific directory (e.g., src/__tests__/integration)
  // and don't need Next.js specific transforms, you can simplify the transform config
  // or remove it if ts-jest/babel-jest is handled by the base config appropriately.
  // transform: {
  //   '^.+\\.(ts|tsx)$': 'ts-jest',
  // },
  // Ensure setupFilesAfterEnv points to a relevant setup for integration tests if needed
  // setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
};
