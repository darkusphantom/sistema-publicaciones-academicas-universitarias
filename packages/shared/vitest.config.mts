import { defineConfig } from "vitest/config";

/**
 * Configuración de Vitest para @redfacyt/shared.
 *
 * Entorno Node puro: el paquete no depende de DOM ni de React.
 * Cobertura >= 80 % (gate Husky alineado con el resto del monorepo).
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts", "src/index.ts"],
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
