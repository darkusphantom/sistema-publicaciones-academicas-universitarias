import { Hono } from "hono";
import { pino } from "pino";
import type { Logger } from "pino";
import type { Env } from "./config/env";
import { bodyLimitMiddleware } from "./middleware/body-limit";
import { corsWhitelist } from "./middleware/cors";
import { createErrorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { rateLimitSkeleton } from "./middleware/rate-limit";
import { requestId } from "./middleware/request-id";
import { securityHeaders } from "./middleware/security-headers";

/**
 * Opciones de creación de la app: entorno tipado y, a futuro, puertos.
 */
export type AppOptions = {
  env: Env;
  /**
   * Logger pino opcional (p. ej. inyectado por el bootstrap). Si no se
   * proporciona, `createApp` crea uno con el nivel de `env.LOG_LEVEL`.
   */
  logger?: Logger;
  // A futuro, sin romper la firma:
  // postRepository?: PostRepository;
  // userRepository?: UserRepository;
  // authHandler?: Hono;
};

/**
 * Crea la app Hono con el pipeline de seguridad del scaffold.
 *
 * Función pura (no abre puertos): los tests llaman `app.request()`. Los
 * middlewares de seguridad se aplican antes de las rutas, en orden:
 * request-id → security headers → CORS → body limit → rate limit (slot).
 *
 * @param options - Opciones tipadas (entorno; a futuro, puertos hexagonales).
 * @returns Instancia de Hono configurada y lista para servir.
 */
export function createApp(options: AppOptions): Hono {
  const { env, logger = pino({ level: env.LOG_LEVEL }) } = options;
  const app = new Hono();

  app.use("*", requestId());
  app.use("*", securityHeaders());
  app.use("*", corsWhitelist(env.CORS_ORIGINS));
  app.use("*", bodyLimitMiddleware(env.MAX_BODY_BYTES));
  app.use("*", rateLimitSkeleton(env));

  app.get("/api/v1/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  );

  app.notFound(notFound);
  app.onError(createErrorHandler({ env, logger }));
  return app;
}