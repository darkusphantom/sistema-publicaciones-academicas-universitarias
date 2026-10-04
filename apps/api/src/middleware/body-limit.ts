import { bodyLimit } from "hono/body-limit";
import type { MiddlewareHandler } from "hono";

/**
 * Límite global del cuerpo de petición (requisito R3 de threat-model-api.md).
 *
 * Devuelve `413` con un cuerpo JSON genérico cuando el tamaño declarado en
 * `content-length` supera el máximo configurado. La respuesta se construye con
 * `c.json` para que herede los headers del contexto (x-request-id, seguridad),
 * no un `Response` crudo que los perdería. Las rutas con multipart (uploads)
 * ajustarán su propio límite más adelante.
 *
 * @param maxSize - Tamaño máximo del cuerpo en bytes.
 * @returns Middleware de Hono.
 */
export function bodyLimitMiddleware(maxSize: number): MiddlewareHandler {
  return bodyLimit({
    maxSize,
    onError: (c) =>
      c.json(
        {
          error: "payload_too_large",
          message: "Request body exceeds the allowed limit",
        },
        413,
      ),
  });
}