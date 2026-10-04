import type { NotFoundHandler } from "hono";

/**
 * Respuesta 404 en JSON sin volcar la ruta solicitada (requisito R6).
 *
 * @param c - Contexto de Hono.
 * @returns Respuesta JSON 404 genérica.
 */
export const notFound: NotFoundHandler = (c) =>
  c.json({ error: "not_found", message: "Not found" }, 404);