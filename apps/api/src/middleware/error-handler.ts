import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import type { Env } from "../config/env";

/**
 * Opciones del manejador de errores central.
 */
type CreateErrorHandlerOptions = {
  env: Env;
  logger: Logger;
};

/**
 * Manejador central de errores sin fuga de detalle interno (requisito R2).
 *
 * Las `HTTPException` de Hono (errores controlados, p. ej. validaciones o
 * auth) devuelven su status y mensaje sin pasar por el 500 genérico. El resto
 * de errores se devuelve como 500: en `NODE_ENV=production` el cuerpo es
 * exactamente el genérico; fuera de producción se incluye `detail` (el
 * mensaje), pero jamás el stack. El error se loguea en el servidor junto al
 * `x-request-id` (leído del contexto) para correlación segura.
 *
 * @param options - Entorno tipado y logger pino.
 * @returns Manejador de errores de Hono.
 */
export function createErrorHandler(
  options: CreateErrorHandlerOptions,
): ErrorHandler {
  const { env, logger } = options;
  return (err, c) => {
    const requestId = c.get("requestId") ?? c.req.header("x-request-id");
    if (err instanceof HTTPException) {
      logger.warn({ err, requestId }, "HTTP exception");
      return c.json(
        { error: "http_error", message: err.message },
        err.status,
      );
    }
    logger.error({ err, requestId }, "Unhandled error");
    const isProduction = env.NODE_ENV === "production";
    const body = isProduction
      ? { error: "internal_error", message: "Internal server error" }
      : {
          error: "internal_error",
          message: "Internal server error",
          detail: err instanceof Error ? err.message : String(err),
        };
    return c.json(body, 500);
  };
}