module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: './',
    moduleDirectories: ['node_modules'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    },
  };
  