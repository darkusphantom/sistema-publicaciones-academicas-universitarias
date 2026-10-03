import {
  type Post,
  type PostFilters,
  type PostCategory,
  type PostType,
  type PostVisibility,
  type AuthorOption,
  DEFAULT_POST_FILTERS,
} from "./types";

// ─── Valid domain value sets ──────────────────────────────────────────────────

const VALID_CATEGORIES = new Set<PostCategory>([
  "noticias",
  "eventos",
  "defensas",
  "investigacion",
  "convocatorias",
]);

const VALID_TYPES = new Set<PostType>(["post", "articulo", "ensenanza"]);

const VALID_STATUSES = new Set<PostVisibility>([
  "publicado",
  "borrador",
  "oculto",
]);

/** ISO date pattern: YYYY-MM-DD. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ─── Pure utility functions ───────────────────────────────────────────────────

/**
 * Normalizes a search string for comparison: trim, lowercase, remove diacritics.
 *
 * Diacritics are stripped with `String.prototype.normalize("NFD")` +
 * a regex that removes combining marks. This keeps the function dependency-free.
 *
 * @param value - Raw input string.
 * @returns The normalized string.
 * @complexity O(n) — single pass over the string.
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Parses URL search params (in Spanish) into a `PostFilters` object.
 *
 * Tolerant: unknown or malformed values are silently replaced with their
 * defaults so that sharing a corrupt URL degrades to "no filter applied"
 * rather than a blank screen.
 *
 * URL param mapping (`docs/design/wireframes_feed.md` §4.3):
 * - `q`         → `q`
 * - `categoria` → `category`
 * - `tipo`      → `type`
 * - `autor`     → `authorId`
 * - `estado`    → `status`
 * - `desde`     → `dateFrom`
 * - `hasta`     → `dateTo`
 *
 * @param params - Key-value map from `searchParams` (Next.js server page prop).
 * @returns A fully-populated `PostFilters` value.
 * @complexity O(1) — constant number of field lookups.
 */
export function fromSearchParams(
  params: Record<string, string | string[] | undefined>,
): PostFilters {
  const getString = (key: string): string => {
    const v = params[key];
    return typeof v === "string" ? v : "";
  };

  const rawQ = getString("q").trim().slice(0, 80);

  const rawCategory = getString("categoria");
  const category = VALID_CATEGORIES.has(rawCategory as PostCategory)
    ? (rawCategory as PostCategory)
    : "todas";

  const rawType = getString("tipo");
  const type = VALID_TYPES.has(rawType as PostType)
    ? (rawType as PostType)
    : "todos";

  const rawStatus = getString("estado");
  const status = VALID_STATUSES.has(rawStatus as PostVisibility)
    ? (rawStatus as PostVisibility)
    : "todos";

  const authorId = getString("autor") || "todos";

  const rawDateFrom = getString("desde");
  const dateFrom =
    DATE_PATTERN.test(rawDateFrom) && !Number.isNaN(Date.parse(rawDateFrom))
      ? rawDateFrom
      : null;

  const rawDateTo = getString("hasta");
  const dateTo =
    DATE_PATTERN.test(rawDateTo) && !Number.isNaN(Date.parse(rawDateTo))
      ? rawDateTo
      : null;

  return { keyword: rawQ, category, type, authorId, status, dateFrom, dateTo };
}

/**
 * Serializes `PostFilters` into `URLSearchParams`, omitting default values so
 * the URL stays clean.
 *
 * Navigation is done via `router.replace` (not `push`) to avoid polluting the
 * browser history with every filter change.
 *
 * @param filters - Current filter state.
 * @returns A `URLSearchParams` instance ready to append to the pathname.
 * @complexity O(1) — constant field set.
 */
export function toSearchParams(filters: PostFilters): URLSearchParams {
  const params = new URLSearchParams();
  const d = DEFAULT_POST_FILTERS;

  if (filters.keyword !== d.keyword) params.set("q", filters.keyword);
  if (filters.category !== d.category) params.set("categoria", filters.category);
  if (filters.type !== d.type) params.set("tipo", filters.type);
  if (filters.authorId !== d.authorId) params.set("autor", filters.authorId);
  if (filters.status !== d.status) params.set("estado", filters.status);
  if (filters.dateFrom !== d.dateFrom) params.set("desde", filters.dateFrom!);
  if (filters.dateTo !== d.dateTo) params.set("hasta", filters.dateTo!);

  return params;
}

/**
 * Counts the number of filter dimensions that differ from their defaults.
 * Used to drive the "Filtros (2)" toggler label and the "Limpiar filtros"
 * conditional visibility.
 *
 * @param filters - Current filter state.
 * @returns Number of active (non-default) filters.
 * @complexity O(1) — constant comparisons.
 */
export function countActiveFilters(filters: PostFilters): number {
  const d = DEFAULT_POST_FILTERS;
  let count = 0;
  if (filters.keyword !== d.keyword) count++;
  if (filters.category !== d.category) count++;
  if (filters.type !== d.type) count++;
  if (filters.authorId !== d.authorId) count++;
  if (filters.status !== d.status) count++;
  if (filters.dateFrom !== d.dateFrom) count++;
  if (filters.dateTo !== d.dateTo) count++;
  return count;
}

/**
 * Validates that the date range is coherent (`dateFrom` ≤ `dateTo`).
 * When only one bound is set the range is always valid.
 *
 * @param filters - Current filter state.
 * @returns `false` only when both bounds are set and `dateFrom` > `dateTo`.
 * @complexity O(1).
 */
export function isDateRangeValid(filters: PostFilters): boolean {
  const { dateFrom, dateTo } = filters;
  if (!dateFrom || !dateTo) return true;
  return dateFrom <= dateTo;
}

/**
 * Returns a human-readable description of the active date range filter,
 * suitable for the "No results" empty state message.
 *
 * @param filters - Current filter state.
 * @param authors - Author options (used by the caller; included in signature for
 *   completeness with §4.3).
 * @returns A description string, or an empty string when no range is active.
 * @complexity O(1).
 */
export function describeActiveFilters(
  filters: PostFilters,
  authors: AuthorOption[],
): string {
  void authors; // reserved for future use when author name is shown in copy
  const { dateFrom, dateTo } = filters;
  if (dateFrom && dateTo) {
    return `No hay publicaciones publicadas entre el ${dateFrom} y el ${dateTo}.`;
  }
  return "";
}

/**
 * Applies the given filters to a post list and returns the matching posts
 * sorted by `publishedAt` descending (most recent first).
 *
 * All text comparisons are diacritics-insensitive via `normalizeSearchText`.
 * The sort is stable in modern JS engines (V8 since Node 11).
 *
 * @param posts   - Full list of (already visibility-filtered) posts.
 * @param filters - Active filter state.
 * @returns Filtered and sorted posts.
 * @complexity O(n log n) — dominated by the sort; filter is O(n).
 */
export function applyFilters(posts: Post[], filters: PostFilters): Post[] {
  const keyword = normalizeSearchText(filters.keyword);

  const result = posts.filter((post) => {
    // Category filter
    if (filters.category !== "todas" && post.category !== filters.category) {
      return false;
    }

    // Type filter
    if (filters.type !== "todos" && post.type !== filters.type) {
      return false;
    }

    // Author filter
    if (filters.authorId !== "todos" && post.authorId !== filters.authorId) {
      return false;
    }

    // Status filter
    if (filters.status !== "todos" && post.visibility !== filters.status) {
      return false;
    }

    // Date range filter (inclusive bounds, compared as date-only strings)
    const postDate = post.publishedAt.slice(0, 10); // YYYY-MM-DD
    if (filters.dateFrom && postDate < filters.dateFrom) return false;
    if (filters.dateTo && postDate > filters.dateTo) return false;

    // Keyword filter: search in normalized title and content
    if (keyword) {
      const inTitle = normalizeSearchText(post.title).includes(keyword);
      const inContent = normalizeSearchText(post.content).includes(keyword);
      if (!inTitle && !inContent) return false;
    }

    return true;
  });

  // Sort by publishedAt descending (most recent first)
  result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return result;
}
