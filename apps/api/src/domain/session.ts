/**
 * Re-exportaciones del tipo Session desde `@redfacyt/shared`.
 *
 * Shim de compatibilidad: todos los imports existentes en `apps/api`
 * que apuntan a `../domain/session` continúan funcionando sin modificaciones.
 *
 * @module domain/session
 */

export type { Session } from "@redfacyt/shared";