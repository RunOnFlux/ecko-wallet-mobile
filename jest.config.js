module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {'\\.svg$': '<rootDir>/__mocks__/svgMock.js'},
  // Many dependencies ship untranspiled ES modules; let babel transform all of them.
  transformIgnorePatterns: [],
};
