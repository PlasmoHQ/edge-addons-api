/**
 * @type {import('@jest/types').Config.InitialOptions}
 */

const config = {
  testTimeout: 60000 * 5, // Test can run for 5 minutes

  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  verbose: true,
  moduleNameMapper: {
    "^~(.*)$": "<rootDir>/dist/$1"
  }
}
export default config
