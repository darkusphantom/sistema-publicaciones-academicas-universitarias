import { mockPosts } from "@/data/posts";
import { mockUsers } from "@/data/users";
import { applyFilters } from "@/lib/filters";
import { filterVisiblePosts } from "@/lib/visibility";
import type { AuthorOption, Post } from "@/lib/types";
import type {
  PageOptions,
  PostPage,
  PostRepository,
  UserRepository,
} from "./post-repository";
import type { PostFilters, Session } from "@/lib/types";

/**
 * Static implementation of {@link PostRepository}.
 *
 * Reads from `src/data/posts.ts` (in-memory mock). The interface is identical
 * to the future Supabase implementation, so swapping adapters does not require
 * changes to callers (FeedView, page components, tests).
 *
 * Visibility is applied first (O(n)), then filters and sort via `applyFilters`
 * (O(n log n)), then pagination (O(1) slice).
 */
export class StaticPostRepository implements PostRepository {
  /**
   * Returns posts visible to the session, filtered and paginated.
   *
   * @param filters - Active filter state.
   * @param page    - Pagination: `{ limit, offset }`.
   * @param session - Active session for visibility gating.
   * @returns Paginated visible posts plus total count.
   * @complexity O(n log n) — visibility O(n) + filter+sort O(n log n) + slice O(1).
   */
  async findVisible(
    filters: PostFilters,
    page: PageOptions,
    session: Session,
  ): Promise<PostPage> {
    const visible = filterVisiblePosts(mockPosts, session);
    const filtered = applyFilters(visible, filters);

    const total = filtered.length;
    const items = filtered.slice(page.offset, page.offset + page.limit);

    return { items, total };
  }

  /**
   * Looks up a single post by ID, regardless of visibility.
   *
   * @param id - Post ID.
   * @returns The post or `null`.
   * @complexity O(n) — linear scan of the mock array.
   */
  async findById(id: string): Promise<Post | null> {
    return mockPosts.find((p) => p.id === id) ?? null;
  }
}

/**
 * Static implementation of {@link UserRepository}.
 *
 * Derives the author list from `src/data/users.ts` filtered to users who have
 * at least one post in `src/data/posts.ts`. Sorted alphabetically by full name
 * with the Spanish locale for stable ordering.
 */
export class StaticUserRepository implements UserRepository {
  /**
   * Returns authors sorted by full name in Spanish locale order.
   *
   * Filtering to "users with posts" is done client-side against the full mock
   * dataset (not visibility-filtered) because the dropdown must list all authors
   * who have ever published, not just those visible to the current session.
   *
   * @returns Author options sorted by `fullName`.
   * @complexity O(m log m) — m = number of unique authors with posts.
   */
  async listAuthors(): Promise<AuthorOption[]> {
    const authorIds = new Set(mockPosts.map((p) => p.authorId));

    const authors: AuthorOption[] = mockUsers
      .filter((u) => authorIds.has(u.id))
      .map((u) => ({
        id: u.id,
        username: u.username,
        fullName: `${u.givenName} ${u.familyName}`,
      }));

    authors.sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" }),
    );

    return authors;
  }
}
