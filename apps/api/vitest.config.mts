import { defineConfig } from "vitest/config";

/**
 * Config de Vitest de la API: entorno node, cobertura >= 80% (gate Husky).
 *
 * `index.ts` y `server.ts` (bootstrap que abre puertos de red) se excluyen de
 * la cobertura: no son testeables por unidad sin abrir sockets y se verifican
 * con el smoke de `pnpm dev` (api-structure.md §9 DoD 3). Decisión documentada.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/index.ts",
        "src/server.ts",
      ],
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