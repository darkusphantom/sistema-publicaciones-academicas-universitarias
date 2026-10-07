import tseslint from "typescript-eslint";

/**
 * Config de ESLint flat para @redfacyt/shared.
 * Usa typescript-eslint recomendado, igual que la API.
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
