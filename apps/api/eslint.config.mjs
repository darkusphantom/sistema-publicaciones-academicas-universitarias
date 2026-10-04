import tseslint from "typescript-eslint";

/**
 * Config de ESLint flat para la API (independiente del web).
 * Usa typescript-eslint recomendado; el web usa eslint-config-next.
 */
export default tseslint.config(
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
);