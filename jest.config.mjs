export default {
  // Tell Jest to treat .ts/.tsx as modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    // Embed your ts-jest options here—no more globals block
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ---- ts-jest options ----
        useESM: true,             // emit native ESM
        isolatedModules: true,    // faster transpile-only mode
        tsconfig: {
          module: 'ESNext',       // ensure TS outputs ESM
          target: 'ES2020',
          esModuleInterop: true
        }
        // ------------------------
      }
    ]
  },
  testEnvironment: 'node',
  // when running, still require:
  // NODE_OPTIONS=--experimental-vm-modules npx jest
};
