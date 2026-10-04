import type { Post } from "../../domain/post";
import type { PostDraft } from "../../domain/post";
import type { PostRepository } from "../../domain/post";
import type { Session } from "../../domain/session";

/** Dependencias del caso de uso de creación de publicaciones. */
export type CreatePostDeps = {
  posts: PostRepository;
  /** Reloj inyectable para tests (por defecto `Date`). */
  now?: () => Date;
};

/**
 * Crea el caso de uso de creación de publicación (R15).
 *
 * El `authorId` siempre proviene de la sesión (nunca del body); `createdAt`,
 * `updatedAt` y `publishedAt` se fijan a `now` por el servidor.
 *
 * @param deps - Repositorio de posts y reloj inyectable.
 * @returns Caso de uso `(draft, session) → Post`.
 */
export function createPost(deps: CreatePostDeps) {
  return async (draft: PostDraft, session: Session): Promise<Post> => {
    const now = (deps.now?.() ?? new Date()).toISOString();
    return deps.posts.create({
      ...draft,
      authorId: session.user.id,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  };
}