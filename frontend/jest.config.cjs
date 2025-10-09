/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
        isolatedModules: true,
        useESM: false
      },
    ],
  },

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  testMatch: ["**/tests/**/*.test.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],

  //  Optional but helps ensure clean module resolution
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
