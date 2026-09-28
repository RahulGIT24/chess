import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      // Add any forked worker entrypoint (e.g. "src/worker/scheduler.ts") here once one exists.
      exclude: ["src/**/*.test.ts", "src/types/**", "src/index.ts"],
    },
  },
});
