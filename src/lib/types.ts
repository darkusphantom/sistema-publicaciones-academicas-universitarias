/**
 * Define the possible roles for users in the platform.
 */
export type UserRole = "estudiante" | "profesor" | "admin";

/**
 * Represents a registered user in the system.
 */
export type User = {
  id: string;
  username: string;
  email: string;
  givenName: string;
  familyName: string;
  role: UserRole;
  createdAt: string;
};

/**
 * Represents an active user session.
 */
export type Session = {
  user: Pick<User, "id" | "username" | "role">;
  expiresAt: string;
};

/**
 * Utility type to represent field-level errors in a form based on its model.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Standardized result for authentication operations.
 */
export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

// ─── Feed domain types ────────────────────────────────────────────────────────

/** Institutional category of a publication. */
export type PostCategory =
  | "noticias"
  | "eventos"
  | "defensas"
  | "investigacion"
  | "convocatorias";

/**
 * Nature of the content according to the MVP.
 * Matches the values expected by filters and URL params.
 */
export type PostType = "post" | "articulo" | "ensenanza";

/**
 * Visibility and editorial state of a publication.
 * - `publicado`: visible to everyone.
 * - `borrador`: visible only to the author.
 * - `oculto`: hidden by admin; visible to author and admin.
 */
export type PostVisibility = "publicado" | "borrador" | "oculto";

/**
 * Represents a single publication in the platform.
 * The `content` field holds the full body in Markdown; during the static phase
 * it is displayed as plain text via `truncateText`.
 */
export type Post = {
  id: string;
  title: string;
  /** Full body in Markdown. Shown as plain text in the static phase. */
  content: string;
  authorId: string;
  category: PostCategory;
  type: PostType;
  visibility: PostVisibility;
  /** ISO 8601. Primary sort key for the feed (always descending). */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Always `null` in the static phase; the image arrives with the backend. */
  imageUrl: string | null;
};

/**
 * Active filter state for the feed.
 * `"todas"` / `"todos"` mean "no filter applied" for that dimension.
 */
export type PostFilters = {
  /** Keyword; searched in title and body. Max 80 chars after trim. */
  keyword: string;
  category: PostCategory | "todas";
  type: PostType | "todos";
  authorId: string | "todos";
  status: PostVisibility | "todos";
  /** `YYYY-MM-DD` or `null`. Inclusive lower bound. */
  dateFrom: string | null;
  /** `YYYY-MM-DD` or `null`. Inclusive upper bound. */
  dateTo: string | null;
};

/** Default filter state — no filters active. */
export const DEFAULT_POST_FILTERS: PostFilters = {
  keyword: "",
  category: "todas",
  type: "todos",
  authorId: "todos",
  status: "todos",
  dateFrom: null,
  dateTo: null,
};

/**
 * Page size for the "Cargar más" button.
 * Must be a multiple of 2 and 3 so the 1/2/3-column grid never has orphaned
 * cards at the bottom edge.
 */
export const POSTS_PAGE_SIZE = 6;

/**
 * Lightweight author data used in filter dropdowns and card metadata.
 * Resolved from `authorId` against the user repository.
 */
export type AuthorOption = {
  id: string;
  username: string;
  /** Full display name, e.g. "María Rivas". */
  fullName: string;
};
