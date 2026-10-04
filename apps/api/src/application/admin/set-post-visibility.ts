import type { Post } from "../../domain/post";
import type { PostRepository } from "../../domain/post";
import { NotFoundError } from "../errors";

/** Dependencias del caso de uso de moderación de visibilidad. */
export type SetPostVisibilityDeps = {
  posts: PostRepository;
};

/**
 * Crea el caso de uso de moderación de visibilidad por admin (R16).
 *
 * Oculta (`"oculto"`) o restaura (`"publicado"`) cualquier publicación; es la
 * única vía para fijar `oculto`. El resultado se refleja de inmediato en el
 * feed (R15).
 *
 * @param deps - Puerto de posts.
 * @returns Caso de uso `(id, visibility) → Post`.
 */
export function setPostVisibility(deps: SetPostVisibilityDeps) {
  return async (
    id: string,
    visibility: "publicado" | "oculto",
  ): Promise<Post> => {
    const updated = await deps.posts.update(id, { visibility });
    if (!updated) throw new NotFoundError();
    return updated;
  };
}