/** @type {import('jest').Config} */
const config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
  ],

  // An array of directory names to be searched recursively inside the `rootDir`
  moduleDirectories: [
    "node_modules",
  ],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|svg)$': `<rootDir>/__mocks__/fileMock.js`,

    // Handle module aliases (if configured in tsconfig.json or jsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // A list of paths to modules that run some code to configure or set up the testing environment before each test

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],

  // An array of regexp pattern strings that are matched against all test paths before executing a test
  testPathIgnorePatterns: [
    "/node_modules/",
    "/e2e/" // Ignore the e2e directory
  ],

  // This option sets the URL for the jsdom environment. It is required to run tests that rely on window.location.href
  testEnvironment: "jsdom",

  // A map from regular expressions to paths to transformers
  transform: {
    // Use swc-jest for transforming TypeScript and JavaScript files
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },

  // An array of regexp pattern strings that are matched against all source file paths before transformation
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

module.exports = config;