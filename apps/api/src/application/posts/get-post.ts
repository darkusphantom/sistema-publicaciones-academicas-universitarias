import type { Post } from "../../domain/post";
import type { PostFilters } from "../../domain/post";
import type { PageOptions } from "../../domain/post";
import type { PostPage } from "../../domain/post";
import type { PostRepository } from "../../domain/post";
import type { Session } from "../../domain/session";
import { NotFoundError } from "../errors";
import { canViewPost } from "../../domain/visibility";

/** Dependencias del caso de uso de lectura de publicaciones. */
export type GetPostDeps = {
  posts: PostRepository;
};

/**
 * Crea el caso de uso de obtención de una publicación por id (R15).
 *
 * Aplica `canViewPost`: si la publicación no es visible para la sesión se
 * responde 404 (no se revela la existencia de borradores/ocultos ajenos).
 *
 * @param deps - Repositorio de posts.
 * @returns Caso de uso `(id, session) → Post`.
 */
export function getPost(deps: GetPostDeps) {
  return async (id: string, session: Session): Promise<Post> => {
    const post = await deps.posts.findById(id);
    if (!post || !canViewPost(post, session)) throw new NotFoundError();
    return post;
  };
}

/**
 * Crea el caso de uso del feed (R11/R15).
 *
 * Delega en el repositorio, que replica `canViewPost` → `applyFilters` →
 * orden DESC → paginación.
 *
 * @param deps - Repositorio de posts.
 * @returns Caso de uso `(filters, page, session) → PostPage`.
 */
export function getFeed(deps: GetPostDeps) {
  return async (
    filters: PostFilters,
    page: PageOptions,
    session: Session,
  ): Promise<PostPage> => deps.posts.findVisible(filters, page, session);
}