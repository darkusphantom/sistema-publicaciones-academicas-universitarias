import type { Post, Session } from "./types";

/**
 * Determines whether the given session can view a specific post.
 *
 * Visibility matrix (`docs/design/wireframes_feed.md` §4.4):
 * - `publicado`: visible to everyone.
 * - `borrador`:  visible only to the author (even if admin).
 * - `oculto`:    visible to the author OR to any admin.
 *
 * @param post    - The post to evaluate.
 * @param session - The active user session.
 * @returns `true` if the session is allowed to view the post.
 * @complexity O(1) — constant comparisons.
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
 * Filters an array of posts to those visible to the given session.
 *
 * Uses short-circuit evaluation via `Array.filter` + `canViewPost`.
 * Preserves the original order of the input array so that the caller
 * (typically the repository) controls sorting.
 *
 * @param posts   - Full list of posts to filter.
 * @param session - The active user session.
 * @returns A new array containing only the posts the session may view.
 * @complexity O(n) — single pass over the posts array.
 */
export function filterVisiblePosts(posts: Post[], session: Session): Post[] {
  return posts.filter((post) => canViewPost(post, session));
}
