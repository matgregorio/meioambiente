export default {
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
};
