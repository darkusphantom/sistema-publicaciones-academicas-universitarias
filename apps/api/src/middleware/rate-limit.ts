import type { MiddlewareHandler } from "hono";
import type { Env } from "../config/env";

/**
 * Slot [esqueleto] de rate limiting (requisito P0 R7 de threat-model-api.md).
 *
 * Hoy no limita: es el punto donde se conectará `hono-rate-limiter`
 * (MemoryStore) sobre `/auth/login` y `/auth/register` cuando llegue auth,
 * usando `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW_MS` de la configuración.
 *
 * @param _env - Entorno tipado (config futura del limiter).
 * @returns Middleware de Hono que por ahora solo pasa al siguiente handler.
 */
export function rateLimitSkeleton(_env: Env): MiddlewareHandler {
  return async (_context, next) => {
    await next();
  };
}