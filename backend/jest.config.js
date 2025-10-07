const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/tests/**/*.test.ts"], // look for tests inside /tests
  setupFiles: ["dotenv/config"],        // loads environment vars
  verbose: true,                        //  show full test output
  clearMocks: true,                     // resets mocks between tests
  forceExit: true,                      // ensures Jest exits cleanly
};
