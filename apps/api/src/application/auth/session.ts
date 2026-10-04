import type { AppAuth } from "../../infrastructure/auth/auth.config";
import type { Session } from "../../domain/session";
import type { UserRepository } from "../../domain/user";
import { UnauthorizedError } from "../errors";

/**
 * Convierte las `Set-Cookie` de una respuesta de Better Auth en headers de
 * PETICIÓN con `Cookie`, para poder llamar a `auth.api.getSession` tras un
 * `signUpEmail`/`signInEmail` (que devuelven las cookies en `Set-Cookie`, no en
 * un header `Cookie` de entrada).
 *
 * @param setCookies - Valores `Set-Cookie` serializados.
 * @returns Headers de petición con la cookie de sesión.
 */
export function requestHeadersFromSetCookies(setCookies: string[]): Headers {
  const cookiePairs: string[] = [];
  for (const cookie of setCookies) {
    const pair = cookie.split(";")[0];
    if (pair.includes("=")) cookiePairs.push(pair);
  }
  const headers = new Headers();
  if (cookiePairs.length > 0) headers.set("cookie", cookiePairs.join("; "));
  return headers;
}

/**
 * Devuelve la sesión wire actual (rol FRESCO del store, R14) o `null`.
 *
 * La identidad se resuelve por la cookie de sesión de Better Auth (sesión de
 * BD en memoria, revocable — ver desvío H4 en `auth.config.ts`); el rol se
 * re-lee del repositorio en cada petición, de modo que un cambio de rol por
 * admin (incluida la democión) es efectivo de inmediato y el claim de la
 * cookie nunca autoriza por sí solo.
 *
 * @param auth    - Instancia de Better Auth.
 * @param users   - Puerto de usuarios (rol fresco).
 * @param headers - Headers de la petición (cookie de sesión).
 * @returns Sesión wire, o `null` si no hay sesión válida o el usuario
 *          ya no existe.
 */
export async function getCurrentSession(
  auth: AppAuth,
  users: UserRepository,
  headers: HeadersInit,
): Promise<Session | null> {
  const result = await auth.api.getSession({ headers });
  if (!result) return null;
  const fresh = await users.findById(result.user.id);
  if (!fresh) return null;
  return {
    user: {
      id: fresh.id,
      username: fresh.username,
      role: fresh.role,
    },
    expiresAt: result.session.expiresAt.toISOString(),
  };
}

/**
 * Devuelve la sesión wire actual o lanza 401 (para las rutas de contrato).
 *
 * @param auth    - Instancia de Better Auth.
 * @param users   - Puerto de usuarios (rol fresco).
 * @param headers - Headers de la petición.
 * @returns Sesión wire.
 * @throws UnauthorizedError si no hay sesión.
 */
export async function requireCurrentSession(
  auth: AppAuth,
  users: UserRepository,
  headers: HeadersInit,
): Promise<Session> {
  const session = await getCurrentSession(auth, users, headers);
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Cierra la sesión del usuario y devuelve los `Set-Cookie` que expiran las
 * cookies de sesión. Idempotente: sin sesión válida también devuelve 204.
 *
 * @param auth    - Instancia de Better Auth.
 * @param headers - Headers de la petición.
 * @returns Cabeceras `Set-Cookie` a reenviar al cliente.
 */
export async function signOutUser(
  auth: AppAuth,
  headers: HeadersInit,
): Promise<string[]> {
  const result = await auth.api.signOut({
    headers,
    returnHeaders: true,
    returnStatus: true,
  });
  return result.headers.getSetCookie();
}