/**
 * Re-exportaciones de lógica de visibilidad desde `@redfacyt/shared`.
 *
 * Shim de compatibilidad: todos los imports existentes en `apps/api`
 * que apuntan a `../domain/visibility` continúan funcionando sin modificaciones.
 *
 * @module domain/visibility
 */

export { canViewPost, filterVisiblePosts } from "@redfacyt/shared";