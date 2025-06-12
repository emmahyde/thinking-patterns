export default {
  // Tell Jest to treat .ts/.tsx as modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Map .js imports to TypeScript source files
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // Embed your ts-jest options here—no more globals block
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ---- ts-jest options ----
        useESM: true,             // emit native ESM
        // ------------------------
      }
    ]
  },
  testEnvironment: 'node',
  // when running, still require:
  // NODE_OPTIONS=--experimental-vm-modules npx jest
};
