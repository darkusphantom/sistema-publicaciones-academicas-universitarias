import { z } from "zod";

/**
 * Esquema zod del entorno de la API.
 *
 * Fail-fast: si una variable requerida falta o tiene un valor inválido,
 * `parseEnv` lanza un error y el proceso no arranca. Nunca hay defaults
 * silenciosos para valores que importan en producción (p. ej. `CORS_ORIGINS`).
 */
export const envSchema = z.object({
  /** Entorno de ejecución: cambia el comportamiento del error handler. */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  /** Puerto HTTP de la API (el web vive en 3000; la API en 3001). */
  PORT: z.coerce.number().int().positive().default(3001),
  /** Interfaz de escucha del servidor. */
  HOST: z.string().min(1).default("0.0.0.0"),
  /** Whitelist estricta de orígenes CORS (CSV). Requerida en producción. */
  CORS_ORIGINS: z.string().trim().min(1).default("http://localhost:3000"),
  /** Límite global del cuerpo de petición en bytes. */
  MAX_BODY_BYTES: z.coerce.number().int().positive().default(102_400),
  /** Nivel de log para pino. */
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("info"),
  // Claves futuras reservadas (llegan con auth/DB): opcionales hasta entonces,
  // para que el contrato de configuración no cambie.
  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
});

/**
 * Entorno tipado resultante de `parseEnv`.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parsea el entorno de proceso con zod y falla rápido ante valores inválidos.
 *
 * Complejidad: O(k) con k = número de claves del esquema (constante).
 *
 * @param source - Fuente de variables (normalmente `process.env`).
 * @returns Entorno tipado con los defaults aplicados.
 * @throws Error si `NODE_ENV=production` y falta `CORS_ORIGINS`, o si alguna
 *         variable no cumple el esquema.
 */
export function parseEnv(source: NodeJS.ProcessEnv): Env {
  if (source.NODE_ENV === "production" && source.CORS_ORIGINS === undefined) {
    throw new Error(
      "Invalid environment: CORS_ORIGINS is required when NODE_ENV=production",
    );
  }
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${details}`);
  }
  return result.data;
}