import type { PostRepository } from "../../domain/post";
import type { Session } from "../../domain/session";
import { ForbiddenError, NotFoundError } from "../errors";

/** Dependencias del caso de uso de eliminación de publicaciones. */
export type DeletePostDeps = {
  posts: PostRepository;
};

/**
 * Crea el caso de uso de eliminación de publicación (R15).
 *
 * Solo el autor o un admin pueden eliminar (403 en otro caso; 404 si el id no
 * existe). IDOR horizontal y vertical bloqueados.
 *
 * @param deps - Repositorio de posts.
 * @returns Caso de uso `(id, session) → void`.
 */
export function deletePost(deps: DeletePostDeps) {
  return async (id: string, session: Session): Promise<void> => {
    const existing = await deps.posts.findById(id);
    if (!existing) throw new NotFoundError();
    const isAuthor = existing.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";
    if (!isAuthor && !isAdmin) throw new ForbiddenError();
    await deps.posts.delete(id);
  };
}