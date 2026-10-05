import type { AuthorOption, Post, PostFilters } from "@/lib/types";
import type { Session } from "@/lib/types";

/**
 * A paginated result page from the post repository.
 */
export type PostPage = {
  /** Posts visible to the session on this page. */
  items: Post[];
  /** Total number of visible posts matching the filters (before pagination). */
  total: number;
};

/**
 * Pagination parameters for a repository query.
 */
export type PageOptions = {
  /**
   * Maximum number of items to return.
   * FeedView uses a growing limit (limit = visibleCount) with offset 0 to
   * implement "Cargar más" without cursor-based pagination.
   */
  limit: number;
  /** Starting offset. Always 0 in the current "Cargar más" strategy. */
  offset: number;
};

import { type PostCategory, type PostType, type ResearchArea, type PostVisibility } from "@/lib/types";

export type CreatePostInput = {
  title: string;
  content: string;
  imageUrl: string | null;
  type: PostType;
  category: PostCategory;
  researchArea: ResearchArea;
  /** Derivada del botón pulsado, no de un campo del formulario. */
  visibility: Extract<PostVisibility, "publicado" | "borrador">;
};

export type UpdatePostInput = Partial<Omit<CreatePostInput, "visibility">>;

/**
 * Hexagonal port for post data access.
 *
 * Implementations:
 * - `post-repository.static.ts` — reads `src/data/posts.ts` (static phase).
 * - Future: Supabase/PostgreSQL adapter (same interface, no changes to callers).
 *
 * Note: `frontend-structure.md` §2 originally listed `findAll`; this interface
 * uses `findVisible` instead because the feed requires session-aware visibility
 * and limit/offset pagination. The deviation is documented in `progress.md`.
 */
export interface PostRepository {
  /**
   * Returns posts visible to the session, filtered and paginated.
   *
   * Applies visibility rules (`canViewPost`), then filters, then sorts by
   * `publishedAt` DESC, then paginates.
   *
   * @param filters - Active filter state.
   * @param page    - Pagination options.
   * @param session - Active user session for visibility decisions.
   * @returns A page of visible posts and the total count of matching posts.
   */
  findVisible(
    filters: PostFilters,
    page: PageOptions,
    session: Session,
  ): Promise<PostPage>;

  /**
   * Looks up a single post by its ID, regardless of visibility.
   * Returns `null` when the post does not exist.
   *
   * @param id - Post ID.
   * @returns The post, or `null`.
   */
  findById(id: string): Promise<Post | null>;

  /** Crea una publicación. Fija `authorId` desde la sesión, nunca desde el formulario. */
  create(input: CreatePostInput, session: Session): Promise<Post>;

  /** Actualiza. Lanza si la publicación no existe o si la sesión no es su autor. */
  update(id: string, patch: UpdatePostInput, session: Session): Promise<Post>;

  /** Borrado definitivo. Ver §10.5. */
  remove(id: string, session: Session): Promise<void>;

  /** Solo `admin`. Único camino hacia "oculto" (§10.5). */
  setVisibility(
    id: string,
    visibility: PostVisibility,
    session: Session,
  ): Promise<Post>;
}

/**
 * Hexagonal port for user data access (read-only subset used by the feed).
 */
export interface UserRepository {
  /**
   * Returns the list of users who have at least one publication in the system.
   * Used to populate the "Autor" filter dropdown.
   *
   * The list is sorted alphabetically by `fullName` using the `"es"` locale
   * so the order is stable regardless of the host system locale.
   *
   * @returns Author options sorted by full name.
   */
  listAuthors(): Promise<AuthorOption[]>;
}
