/**
 * Re-exportaciones de lógica de filtros desde `@redfacyt/shared`.
 *
 * Shim de compatibilidad: los imports existentes en `@/lib/filters`
 * continúan funcionando sin modificaciones.
 *
 * @module lib/filters
 */

export {
  normalizeSearchText,
  fromSearchParams,
  toSearchParams,
  countActiveFilters,
  isDateRangeValid,
  describeActiveFilters,
  applyFilters,
} from "@redfacyt/shared";
