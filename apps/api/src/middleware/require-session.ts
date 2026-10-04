import type { MiddlewareHandler } from "hono";
import type { UserRepository } from "../domain/user";
import { UnauthorizedError } from "../application/errors";
import { getCurrentSession } from "../application/auth/session";
import type { AppAuth } from "../infrastructure/auth/auth.config";

/**
 * Middleware de identidad por cookie (requisito R10/R13/R14).
 *
 * Resuelve la sesión por la cookie de sesión de Better Auth (sesión de BD en
 * memoria, revocable — ver desvío H4 en `auth.config.ts`) y fija
 * `c.var.session` con el rol FRESCO del store (nunca del claim de la cookie).
 * Sin sesión válida (o con el usuario ya eliminado) responde 401.
 *
 * @param auth  - Instancia de Better Auth.
 * @param users - Puerto de usuarios (rol fresco por petición).
 * @returns Middleware de Hono.
 */
export function requireSession(
  auth: AppAuth,
  users: UserRepository,
): MiddlewareHandler {
  return async (c, next) => {
    const session = await getCurrentSession(auth, users, c.req.raw.headers);
    if (!session) throw new UnauthorizedError();
    c.set("session", session);
    await next();
  };
}