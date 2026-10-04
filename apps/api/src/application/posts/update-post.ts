import type { Post } from "../../domain/post";
import type { PostRepository } from "../../domain/post";
import type { UpdatePost } from "../../domain/post";
import type { Session } from "../../domain/session";
import { ForbiddenError, NotFoundError } from "../errors";

/** Dependencias del caso de uso de edición de publicaciones. */
export type UpdatePostDeps = {
  posts: PostRepository;
  /** Reloj inyectable para tests (por defecto `Date`). */
  now?: () => Date;
};

/**
 * Crea el caso de uso de edición de publicación (R15).
 *
 * Enforcement: solo el autor o un admin pueden editar (403 en otro caso; 404
 * si el id no existe). Reglas:
 * - `publishedAt` es inmutable, salvo la transición `borrador → publicado`,
 *   que fija `publishedAt = now`.
 * - `updatedAt` siempre se actualiza (lo gestiona el repositorio).
 *
 * @param deps - Repositorio de posts y reloj inyectable.
 * @returns Caso de uso `(id, patch, session) → Post`.
 */
export function updatePost(deps: UpdatePostDeps) {
  return async (
    id: string,
    patch: UpdatePost,
    session: Session,
  ): Promise<Post> => {
    const existing = await deps.posts.findById(id);
    if (!existing) throw new NotFoundError();
    const isAuthor = existing.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";
    if (!isAuthor && !isAdmin) throw new ForbiddenError();
    if (patch.visibility === "oculto" && !isAdmin) {
      // Solo el admin puede fijar `oculto` (moderación, spec §9.3/R16).
      throw new ForbiddenError();
    }

    let publishedAt = existing.publishedAt;
    if (
      existing.visibility === "borrador" &&
      patch.visibility === "publicado"
    ) {
      publishedAt = (deps.now?.() ?? new Date()).toISOString();
    }

    const updated = await deps.posts.update(id, { ...patch, publishedAt });
    if (!updated) throw new NotFoundError();
    return updated;
  };
}