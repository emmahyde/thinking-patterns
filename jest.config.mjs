export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^#ansi-styles$': 'ansi-styles',
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.ts$': ['ts-jest', { 
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        moduleResolution: 'Node'
      }
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ansi-styles)/)'
  ],
  moduleDirectories: ['node_modules'],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/testSetup.ts'],
};
