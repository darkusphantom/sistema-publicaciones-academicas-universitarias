"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FilterBar } from "./filter-bar";
import { PostCard } from "./post-card";
import { LoadMore } from "./load-more";
import { EmptyState } from "@/components/shared/empty-state";
import { useSession } from "@/lib/session/session-provider";
import { StaticPostRepository, StaticUserRepository } from "@/lib/repositories/post-repository.static";
import { toSearchParams, isDateRangeValid, countActiveFilters } from "@/lib/filters";
import { POSTS_PAGE_SIZE } from "@/lib/types";
import { HomeIcon, SearchIcon } from "@/components/ui/icons";
import type { Post, PostFilters, AuthorOption } from "@/lib/types";

/** Props accepted by {@link FeedView}. */
export type FeedViewProps = {
  /** Initial filter state parsed from URL search params by the parent page. */
  filters: PostFilters;
  /** Pre-loaded author list from the parent page for the filter dropdown. */
  authors: AuthorOption[];
};

const postRepo = new StaticPostRepository();
const userRepo = new StaticUserRepository();

/**
 * Client-side feed orchestrator.
 *
 * Responsibilities (`docs/design/wireframes_feed.md` §6.6):
 * 1. Reads the session via `useSession()`.
 * 2. Fetches posts from `postRepository.findVisible` on filter/page changes.
 * 3. Manages the `visibleCount` state for "Cargar más" pagination.
 * 4. Resets `visibleCount` when filters change by receiving a new `key` prop
 *    from the parent page (`key={JSON.stringify(filters)}`).
 * 5. Computes `showStatusFilter` and `dateRangeError` for `FilterBar`.
 * 6. Writes filter changes back to the URL via `router.replace`.
 * 7. Renders: FilterBar → result counter → grid of PostCard → LoadMore / EmptyState.
 *
 * This component is mounted with `key={JSON.stringify(filters)}` in the parent
 * page, so any filter change triggers a remount and resets `visibleCount` to
 * `POSTS_PAGE_SIZE` without needing a `useEffect` to watch `filters`.
 *
 * @param props - FeedView props.
 * @returns The full feed view: filters, counter, grid, pagination.
 */
export function FeedView({ filters, authors: initialAuthors }: FeedViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(POSTS_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [authors, setAuthors] = useState<AuthorOption[]>(initialAuthors);

  // Compute derived state
  const dateRangeError = !isDateRangeValid(filters)
    ? "La fecha inicial no puede ser posterior a la final."
    : null;

  const activeFilterCount = countActiveFilters(filters);

  // Whether to show the status filter: user is author of at least one
  // non-published post, OR is admin.
  const showStatusFilter =
    session?.user.role === "admin" ||
    posts.some(
      (p) =>
        p.authorId === session?.user.id &&
        (p.visibility === "borrador" || p.visibility === "oculto"),
    );

  // Load author list on mount
  useEffect(() => {
    userRepo.listAuthors().then(setAuthors).catch(() => { });
  }, []);

  // Fetch posts whenever visibleCount changes or on mount
  useEffect(() => {
    if (!session) return;
    if (dateRangeError) return;

    let cancelled = false;

    postRepo
      .findVisible(filters, { limit: visibleCount, offset: 0 }, session)
      .then(({ items, total: t }) => {
        if (cancelled) return;
        setPosts(items);
        setTotal(t);
        setFetchError(false);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, session]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleFilterChange(next: PostFilters) {
    const params = toSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleClear() {
    router.replace(pathname);
  }

  function handleLoadMore() {
    setLoading(true);
    setVisibleCount((c) => c + POSTS_PAGE_SIZE);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const counterText = (() => {
    const unit = total === 1 ? "publicación" : "publicaciones";
    if (loading) return "Cargando…";
    if (activeFilterCount > 0) return `${total} ${unit} encontrada${total === 1 ? "" : "s"}`;
    return `${total} ${unit}`;
  })();

  if (fetchError) {
    return (
      <EmptyState
        title="No pudimos cargar las publicaciones."
        description="Ocurrió un error inesperado. Intenta de nuevo."
        action={{ label: "Reintentar", onClick: () => window.location.reload() }}
      />
    );
  }

  const isEmpty = !loading && total === 0;
  const noFiltersActive = activeFilterCount === 0;

  // ── Full render ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Only show filter bar when there are posts or filters are active */}
      {(!isEmpty || !noFiltersActive) && (
        <FilterBar
          filters={filters}
          authors={authors}
          showStatusFilter={showStatusFilter}
          dateRangeError={dateRangeError}
          onChange={handleFilterChange}
          onClear={handleClear}
        />
      )}

      {/* Result counter */}
      {!dateRangeError && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-text-muted"
        >
          {counterText}
        </p>
      )}

      {/* Empty state: no posts at all (no filters active) */}
      {isEmpty && noFiltersActive && (
        <EmptyState
          icon={<HomeIcon className="size-10" />}
          title="Todavía no has publicado nada"
          description="Tus publicaciones aparecerán aquí en cuanto publiques la primera."
          action={{ label: "Crear publicación", href: "/posts/new" }}
        />
      )}

      {/* Empty state: no results from filters */}
      {isEmpty && !noFiltersActive && !dateRangeError && (
        <EmptyState
          icon={<SearchIcon className="size-10" />}
          title="No hay publicaciones que coincidan"
          description={
            filters.dateFrom && filters.dateTo
              ? `No hay publicaciones publicadas entre el ${filters.dateFrom} y el ${filters.dateTo}.`
              : "Prueba con menos filtros o con otras palabras."
          }
          action={{ label: "Limpiar filtros", onClick: handleClear }}
        />
      )}

      {/* Post grid */}
      {!isEmpty && !dateRangeError && (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {posts.map((post) => {
            const author =
              authors.find((a) => a.id === post.authorId) ?? null;
            return (
              <li key={post.id}>
                <PostCard post={post} author={author} />
              </li>
            );
          })}
        </ul>
      )}

      {/* Load more */}
      {!isEmpty && !dateRangeError && (
        <LoadMore
          shown={posts.length}
          total={total}
          pageSize={POSTS_PAGE_SIZE}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}
