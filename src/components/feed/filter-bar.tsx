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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {/* Category */}
          <SelectField
            label="Categoría"
            name="categoria"
            value={filters.category}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value as PostFilters["category"],
                researchArea: "todas", // Reset area when category changes
              })
            }
          >
            <option value="todas">Todas las categorías</option>
            <optgroup label="Disciplinas">
              <option value="matematicas">Matemáticas</option>
              <option value="biologia">Biología</option>
              <option value="quimica">Química</option>
              <option value="fisica">Física</option>
              <option value="computacion">Computación</option>
            </optgroup>
            <optgroup label="Desarrollo profesional">
              <option value="crecimiento-profesional">Desarrollo profesional</option>
            </optgroup>
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
            <option value="noticias">Noticias</option>
            <option value="eventos">Eventos</option>
            <option value="defensas">Defensas</option>
            <option value="investigacion">Investigación</option>
            <option value="convocatorias">Convocatorias</option>
          </SelectField>

          {/* Research Area */}
          <SelectField
            label="Área de investigación"
            name="area"
            value={filters.researchArea}
            onChange={(e) =>
              onChange({
                ...filters,
                researchArea: e.target.value as PostFilters["researchArea"],
              })
            }
          >
            <option value="todas">Todas las áreas</option>
            {(filters.category === "todas" || filters.category === "matematicas") && (
              <optgroup label="Matemáticas">
                <option value="general">General</option>
                <option value="estadistica">Estadística</option>
                <option value="probabilidad">Probabilidad</option>
                <option value="optimizacion">Optimización</option>
                <option value="matematicas-aplicadas">Matemáticas Aplicadas</option>
                <option value="modelado-matematico">Modelado Matemático</option>
              </optgroup>
            )}
            {(filters.category === "todas" || filters.category === "biologia") && (
              <optgroup label="Biología">
                <option value="general">General</option>
                <option value="biotecnologia">Biotecnología</option>
                <option value="bioquimica">Bioquímica</option>
                <option value="genetica">Genética</option>
                <option value="microbiologia">Microbiología</option>
                <option value="ecologia">Ecología</option>
                <option value="bioinformatica">Bioinformática</option>
              </optgroup>
            )}
            {(filters.category === "todas" || filters.category === "quimica") && (
              <optgroup label="Química">
                <option value="general">General</option>
                <option value="quimica-analitica">Química Analítica</option>
                <option value="quimica-organica">Química Orgánica</option>
                <option value="quimica-inorganica">Química Inorgánica</option>
                <option value="fisicoquimica">Fisicoquímica</option>
                <option value="quimica-medioambiental">Química Medioambiental</option>
              </optgroup>
            )}
            {(filters.category === "todas" || filters.category === "fisica") && (
              <optgroup label="Física">
                <option value="general">General</option>
                <option value="fisica-computacional">Física Computacional</option>
                <option value="fisica-de-materiales">Física de Materiales</option>
                <option value="astronomia">Astronomía</option>
                <option value="fisica-nuclear">Física Nuclear</option>
                <option value="mecanica-de-fluidos">Mecánica de Fluidos</option>
              </optgroup>
            )}
            {(filters.category === "todas" || filters.category === "computacion") && (
              <optgroup label="Computación">
                <option value="general">General</option>
                <option value="inteligencia-artificial">Inteligencia Artificial</option>
                <option value="aprendizaje-automatico">Aprendizaje Automático</option>
                <option value="ciencia-de-datos">Ciencia de Datos</option>
                <option value="desarrollo-web">Desarrollo Web</option>
                <option value="ingenieria-software">Ingeniería de Software</option>
                <option value="redes-telecomunicaciones">Redes y Telecomunicaciones</option>
                <option value="seguridad-informatica">Seguridad Informática</option>
                <option value="sistemas-distribuidos">Sistemas Distribuidos</option>
                <option value="bases-de-datos">Bases de Datos</option>
                <option value="computacion-grafica">Computación Gráfica</option>
                <option value="robotica">Robótica</option>
                <option value="arquitectura-computadores">Arquitectura de Computadores</option>
              </optgroup>
            )}
            {(filters.category === "todas" || filters.category === "crecimiento-profesional") && (
              <optgroup label="Desarrollo profesional">
                <option value="general">General</option>
                <option value="gestion-proyectos">Gestión de Proyectos</option>
                <option value="liderazgo">Liderazgo y Gestión de Equipos</option>
                <option value="emprendimiento">Emprendimiento</option>
                <option value="comunicacion-profesional">Comunicación Profesional</option>
                <option value="etica-profesional">Ética Profesional</option>
              </optgroup>
            )}
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
