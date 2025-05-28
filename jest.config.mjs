export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
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
    'node_modules/(?!(string-width|strip-ansi|ansi-regex|boxen|wrap-ansi|ansi-styles|chalk|cli-boxes|camelcase|widest-line)/)'
  ],
  moduleDirectories: ['src', 'node_modules'],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/testSetup.ts'],
};
