module.exports = {
  collectCoverageFrom: [
    'client/**/*.{js,jsx}',
    '!client/**/*.test.{js,jsx}',
    '!client/*/RbGenerated*/*.{js,jsx}',
    '!client/app.js',
    '!client/global-styles.js',
    '!client/*/*/Loadable.{js,jsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 91,
      functions: 98,
      lines: 98,
    },
  },
  moduleDirectories: ['node_modules', 'client'],
  moduleNameMapper: {
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/system/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/system/mocks/image.js',
  },
  setupTestFrameworkScriptFile: '<rootDir>/system/testing/test-bundler.js',
  setupFiles: ['raf/polyfill', '<rootDir>/system/testing/enzyme-setup.js'],
  testRegex: 'tests/.*\\.test\\.js$',
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
