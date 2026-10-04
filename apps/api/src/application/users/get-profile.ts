import type { Post } from "../../domain/post";
import type { PostRepository } from "../../domain/post";
import { DEFAULT_POST_FILTERS } from "../../domain/post";
import type { Session } from "../../domain/session";
import type { User, UserRepository } from "../../domain/user";
import { NotFoundError } from "../errors";

/** Dependencias del caso de uso de perfil de usuario. */
export type GetProfileDeps = {
  users: UserRepository;
  posts: PostRepository;
};

/**
 * Crea el caso de uso de perfil público (R18).
 *
 * Devuelve `{ user, posts }`: el usuario en forma wire más sus publicaciones
 * visibles para la sesión. El email de un perfil AJENO se redacta a `""`
 * (salvo que el llamante sea el propio usuario o un admin). Username
 * inexistente → 404 genérico (anti-enumeración).
 *
 * @param deps - Puertos de usuarios y posts.
 * @returns Caso de uso `(username, session) → { user, posts }`.
 */
export function getProfile(deps: GetProfileDeps) {
  return async (
    username: string,
    session: Session,
  ): Promise<{ user: User; posts: Post[] }> => {
    const user = await deps.users.findByUsername(username);
    if (!user) throw new NotFoundError();
    const page = await deps.posts.findVisible(
      { ...DEFAULT_POST_FILTERS, authorId: user.id },
      { limit: 100, offset: 0 },
      session,
    );
    const isOwner = user.id === session.user.id;
    const isAdmin = session.user.role === "admin";
    const profile = isOwner || isAdmin ? user : { ...user, email: "" };
    return { user: profile, posts: page.items };
  };
}