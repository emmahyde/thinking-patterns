module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      // For ES modules support
      modules: false
    }],
    ['@babel/preset-typescript', {
      // Enable all TypeScript features
      isTSX: true,
      allExtensions: true
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          },
          // Jest requires CommonJS modules
          modules: 'commonjs'
        }],
        ['@babel/preset-typescript', {
          isTSX: true,
          allExtensions: true
        }]
      ]
    }
  }
};
