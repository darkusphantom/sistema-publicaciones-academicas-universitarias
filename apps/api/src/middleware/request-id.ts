import { randomUUID } from "node:crypto";
import type { MiddlewareHandler } from "hono";

const REQUEST_ID_HEADER = "x-request-id";
const VALID_REQUEST_ID = /^[a-zA-Z0-9-]{1,64}$/;

/**
 * Asigna un `x-request-id` a cada respuesta para trazabilidad segura.
 *
 * Reutiliza un id entrante bien formado (para continuar una traza existente) o
 * genera un UUID v4. Un id entrante malformado se reemplaza para evitar
 * header-injection. El id queda disponible en el contexto (`requestId`) para
 * que el error handler correlacione sus logs con la respuesta.
 *
 * Complejidad: O(1) por request.
 *
 * @returns Middleware de Hono.
 */
export function requestId(): MiddlewareHandler {
  return async (c, next) => {
    const incoming = c.req.header(REQUEST_ID_HEADER);
    const id =
      incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
    c.set("requestId", id);
    c.header(REQUEST_ID_HEADER, id);
    await next();
  };
}