module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['<rootDir>/src/js/__tests__/setupTests.js'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['<rootDir>/src/js/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};
