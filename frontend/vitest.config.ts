import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],               // normal Vite plugins still work
  resolve: { alias: { "@": "./src" } },

  //  Vitest-specific configuration
  test: {
    globals: true,
    environment: "jsdom",     // or "node"
    setupFiles: "./src/setupTests.ts",
    coverage: { provider: "v8" },
  },
});
