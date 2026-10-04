import type { Post } from "./post";
import type { Session } from "./session";

/**
 * Determina si la sesión puede ver una publicación (espejo de
 * `canViewPost` de `src/lib/visibility.ts`):
 * - `publicado`: visible para todos.
 * - `borrador`: visible solo para el autor (aunque sea admin).
 * - `oculto`: visible para el autor o para cualquier admin.
 *
 * @param post    - Publicación a evaluar.
 * @param session - Sesión activa.
 * @returns `true` si la sesión puede verla.
 * @complexity O(1).
 */
export function canViewPost(post: Post, session: Session): boolean {
  const { visibility, authorId } = post;
  const { id: userId, role } = session.user;
  if (visibility === "publicado") return true;
  if (authorId === userId) return true;
  if (visibility === "oculto" && role === "admin") return true;
  return false;
}

/**
 * Filtra una lista de publicaciones a las visibles para la sesión,
 * preservando el orden de entrada (el repositorio controla el orden).
 *
 * @param posts   - Publicaciones completas.
 * @param session - Sesión activa.
 * @returns Solo las publicaciones visibles.
 * @complexity O(n).
 */
export function filterVisiblePosts(posts: Post[], session: Session): Post[] {
  return posts.filter((post) => canViewPost(post, session));
}