import type { Session } from "../domain/session";

/**
 * Augmentation de variables de contexto de Hono para la API.
 *
 * `requestId` se establece en `request-id.ts` (W4/H2) y lo consume el error
 * handler para correlacionar los logs con el `x-request-id` de la respuesta.
 * `session` lo establece `requireSession` con el rol FRESCO del store (R14).
 * Es el mecanismo estándar de Hono para tipar `c.set`/`c.get` sin repetir
 * generics en cada middleware.
 */
declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
    session: Session;
  }
}

export {};