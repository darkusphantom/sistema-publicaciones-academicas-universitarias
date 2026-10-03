import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Source directory resolved as an absolute path for the "@" alias.
 */
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Vitest configuration for the Red FaCyT project.
 *
 * - jsdom environment for component rendering tests.
 * - v8 coverage provider with a >= 80% threshold on lines, functions,
 *   branches and statements (enforced by the Husky pre-commit hook).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      reporter: ["text", "html", "lcov"],
    },
  },
});