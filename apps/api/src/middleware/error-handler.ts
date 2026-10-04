import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import { AppError } from "../application/errors";
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
    if (err instanceof AppError) {
      logger.warn(
        { code: err.code, status: err.status, message: err.message, requestId },
        "Application error",
      );
      return c.json(
        { error: err.code, message: err.message },
        err.status as 400,
      );
    }
    if (err instanceof HTTPException) {
      logger.warn(
        { code: "http_error", status: err.status, message: err.message, requestId },
        "HTTP exception",
      );
      return c.json(
        { error: "http_error", message: err.message },
        err.status,
      );
    }
    const isProduction = env.NODE_ENV === "production";
    const detail = err instanceof Error ? err.message : String(err);
    const baseLog = { code: "internal_error", status: 500, requestId };
    if (isProduction) {
      // En producción el log no incluye el mensaje interno ni el stack.
      logger.error(
        { ...baseLog, message: "Internal server error" },
        "Unhandled error",
      );
    } else {
      logger.error(
        {
          ...baseLog,
          message: detail,
          stack: err instanceof Error ? err.stack : undefined,
        },
        "Unhandled error",
      );
    }
    const body = isProduction
      ? { error: "internal_error", message: "Internal server error" }
      : {
          error: "internal_error",
          message: "Internal server error",
          detail,
        };
    return c.json(body, 500);
  };
}