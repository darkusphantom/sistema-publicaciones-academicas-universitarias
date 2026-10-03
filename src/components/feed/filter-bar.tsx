"use client";

import { useState, useEffect, useId } from "react";
import { SelectField } from "@/components/ui/select-field";
import { SlidersIcon, SearchIcon, AlertTriangleIcon } from "@/components/ui/icons";
import { buttonStyles } from "@/components/ui/button";
import { countActiveFilters } from "@/lib/filters";
import { cn } from "@/lib/cn";
import type { PostFilters, AuthorOption } from "@/lib/types";

/** Props accepted by {@link FilterBar}. */
export type FilterBarProps = {
  /** Current filter state (parsed from URL by the parent page). */
  filters: PostFilters;
  /** Author options for the author dropdown. */
  authors: AuthorOption[];
  /**
   * When `false`, the status filter is hidden and `status` is forced to
   * `"todos"`. Only shown when the session can have private posts
   * (`docs/design/wireframes_feed.md` §5.2).
   */
  showStatusFilter: boolean;
  /**
   * Validation error for an incoherent date range.
   * Shown as a `role="alert"` above the card grid.
   */
  dateRangeError: string | null;
  /**
   * Called when any filter changes. The parent writes the new values to the
   * URL with `router.replace` so this component never reads `useSearchParams`
   * and needs no `<Suspense>` wrapper.
   */
  onChange: (next: PostFilters) => void;
  /** Called to reset all filters to their defaults. */
  onClear: () => void;
};

/**
 * Responsive filter bar for the feed.
 *
 * Layout rules (`docs/design/wireframes_feed.md` §6.3):
 * - Mobile: search + filter toggler button. Panel collapses/expands with
 *   `hidden` attribute (not display toggle) so the content remains in the DOM
 *   for zoom/keyboard without needing a modal focus trap.
 * - Desktop (≥768px): search on full width, then six selectors in a row.
 *
 * UX rules:
 * - Search input: 300ms debounce. Avoids firing on every keystroke.
 * - Selects and dates: applied immediately (no debounce).
 * - `Limpiar filtros` button only mounts when `countActiveFilters > 0`.
 * - Tab order = visual order: search → toggler → (panel) → clear.
 *
 * @param props - Filter bar props.
 * @returns The filter form element.
 */
export function FilterBar({
  filters,
  authors,
  showStatusFilter,
  dateRangeError,
  onChange,
  onClear,
}: FilterBarProps) {
  const panelId = useId();
  const [panelOpen, setPanelOpen] = useState(false);
  const [prevKeyword, setPrevKeyword] = useState(filters.keyword);
  const [searchValue, setSearchValue] = useState(filters.keyword);

  // Sync local search value when external filters change (e.g. on clear)
  if (filters.keyword !== prevKeyword) {
    setPrevKeyword(filters.keyword);
    setSearchValue(filters.keyword);
  }

  // Debounced search: fires onChange 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.keyword) {
        onChange({ ...filters, keyword: searchValue });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const activeCount = countActiveFilters(filters);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onChange({ ...filters, keyword: searchValue });
      }}
      className="flex flex-col gap-3"
      aria-label="Filtros de publicaciones"
    >
      {/* ── Search input (full width) ── */}
      <div className="relative">
        <label htmlFor="feed-search" className="sr-only">
          Buscar publicaciones
        </label>
        <input
          id="feed-search"
          type="search"
          name="q"
          enterKeyHint="search"
          maxLength={80}
          placeholder="defensas, talleres, avisos…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            "w-full min-h-11 rounded-md border border-text-muted bg-surface px-4 pr-10 text-base text-text",
            "placeholder:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
          )}
        />
        <SearchIcon
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden={true}
        />
      </div>

      {/* ── Mobile filter toggler ── */}
      <button
        type="button"
        id="feed-filter-toggler"
        aria-expanded={panelOpen}
        aria-controls={panelId}
        onClick={() => setPanelOpen((v) => !v)}
        className={cn(
          "md:hidden flex items-center gap-2",
          buttonStyles({ variant: "secondary", size: "sm" }),
        )}
      >
        <SlidersIcon />
        {activeCount > 0 ? `Filtros (${activeCount})` : "Filtros"}
      </button>

      {/* ── Filter controls: collapsible on mobile, always visible on desktop ── */}
      <div
        id={panelId}
        {...(!panelOpen && { hidden: true })}
        className="md:block"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {/* Category */}
          <SelectField
            label="Categoría"
            name="categoria"
            value={filters.category}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value as PostFilters["category"],
              })
            }
          >
            <option value="todas">Todas las categorías</option>
            <option value="noticias">Noticias</option>
            <option value="eventos">Eventos</option>
            <option value="defensas">Defensas</option>
            <option value="investigacion">Investigación</option>
            <option value="convocatorias">Convocatorias</option>
          </SelectField>

          {/* Type */}
          <SelectField
            label="Tipo de publicación"
            name="tipo"
            value={filters.type}
            onChange={(e) =>
              onChange({
                ...filters,
                type: e.target.value as PostFilters["type"],
              })
            }
          >
            <option value="todos">Todos los tipos</option>
            <option value="post">Post</option>
            <option value="articulo">Artículo</option>
            <option value="ensenanza">Enseñanza</option>
          </SelectField>

          {/* Author */}
          <SelectField
            label="Autor"
            name="autor"
            value={filters.authorId}
            onChange={(e) =>
              onChange({ ...filters, authorId: e.target.value })
            }
          >
            <option value="todos">Todos los autores</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName}
              </option>
            ))}
          </SelectField>

          {/* Status (conditional) */}
          {showStatusFilter && (
            <SelectField
              label="Estado"
              name="estado"
              value={filters.status}
              onChange={(e) =>
                onChange({
                  ...filters,
                  status: e.target.value as PostFilters["status"],
                })
              }
            >
              <option value="todos">Todos los estados</option>
              <option value="publicado">Publicado</option>
              <option value="borrador">Borrador</option>
              <option value="oculto">Oculto</option>
            </SelectField>
          )}

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="feed-date-from"
              className="text-sm font-medium text-text"
            >
              Desde
            </label>
            <input
              id="feed-date-from"
              type="date"
              name="desde"
              value={filters.dateFrom ?? ""}
              aria-invalid={dateRangeError ? true : undefined}
              onChange={(e) =>
                onChange({ ...filters, dateFrom: e.target.value || null })
              }
              className={cn(
                "min-h-11 w-full rounded-md border border-text-muted bg-surface px-3 text-base text-text",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                dateRangeError && "border-danger",
              )}
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="feed-date-to"
              className="text-sm font-medium text-text"
            >
              Hasta
            </label>
            <input
              id="feed-date-to"
              type="date"
              name="hasta"
              value={filters.dateTo ?? ""}
              aria-invalid={dateRangeError ? true : undefined}
              onChange={(e) =>
                onChange({ ...filters, dateTo: e.target.value || null })
              }
              className={cn(
                "min-h-11 w-full rounded-md border border-text-muted bg-surface px-3 text-base text-text",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                dateRangeError && "border-danger",
              )}
            />
          </div>
        </div>

        {/* Date range error */}
        {dateRangeError && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-md border border-danger bg-surface px-4 py-3 text-sm text-danger"
          >
            <AlertTriangleIcon aria-hidden="true" />
            {dateRangeError}
          </div>
        )}
      </div>

      {/* ── Clear filters button ── */}
      {activeCount > 0 && (
        <div>
          <button
            type="button"
            onClick={onClear}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </form>
  );
}
