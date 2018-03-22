module.exports = {
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  transform: {
    '^.+\\.ts$': '<rootDir>/preprocessor.js'
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  testMatch: [
    '**/src/**/__tests__/*.(ts|js)',
  ],
};