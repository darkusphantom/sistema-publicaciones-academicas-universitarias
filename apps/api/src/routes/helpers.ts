import type { Context } from "hono";
import type { ZodError } from "zod";

/**
 * Construye la respuesta 400 de validación con detalle por campo.
 *
 * Forma wire de `api-structure.md` §9:
 * `{ "error": "validation_error", "message", "details": [{ field, message }] }`.
 *
 * @param c     - Contexto de Hono.
 * @param error - Error de zod con los issues de validación.
 * @returns Respuesta JSON 400.
 */
export function validationError(c: Context, error: ZodError): Response {
  const details = error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
  return c.json(
    {
      error: "validation_error",
      message: "Datos inválidos",
      details,
    },
    400,
  );
}

/**
 * Reenvía las cabeceras `Set-Cookie` devueltas por Better Auth al cliente.
 *
 * `auth.api.*` con `returnHeaders: true` devuelve un objeto `Headers` con las
 * cookies de sesión/CSRF; aquí se aplican una a una a la respuesta de Hono.
 *
 * @param c       - Contexto de Hono.
 * @param cookies - Valores `Set-Cookie` serializados.
 */
export function applySetCookies(c: Context, cookies: string[]): void {
  for (const cookie of cookies) {
    c.header("set-cookie", cookie, { append: true });
  }
}

/**
 * Parsea el cuerpo JSON de la petición de forma tolerante.
 *
 * @param c - Contexto de Hono.
 * @returns Objeto parseado, o `null` si el cuerpo no es JSON válido.
 */
export async function parseJsonBody(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}