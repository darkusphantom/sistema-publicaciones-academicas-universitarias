import type { Post } from "../types/post";
import type { Session } from "../types/session";

/**
 * Determina si la sesión puede ver una publicación específica.
 *
 * Matriz de visibilidad (`docs/design/wireframes_feed.md` §4.4):
 * - `publicado`: visible para todos.
 * - `borrador`:  visible solo para el autor (aunque sea admin).
 * - `oculto`:    visible para el autor O para cualquier admin.
 *
 * @param post    - Publicación a evaluar.
 * @param session - Sesión activa del usuario.
 * @returns `true` si la sesión tiene permiso para ver la publicación.
 * @complexity O(1) — comparaciones constantes.
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
 * Filtra un array de publicaciones a las visibles para la sesión dada.
 *
 * Preserva el orden original del array de entrada para que el llamador
 * (típicamente el repositorio) controle la ordenación.
 *
 * @param posts   - Lista completa de publicaciones a filtrar.
 * @param session - Sesión activa del usuario.
 * @returns Nuevo array con solo las publicaciones que la sesión puede ver.
 * @complexity O(n) — un paso sobre el array de publicaciones.
 */
export function filterVisiblePosts(posts: Post[], session: Session): Post[] {
  return posts.filter((post) => canViewPost(post, session));
}
