/**
 * Parámetros de paginación utilizados en todos los repositorios del monorepo.
 */
export type PageOptions = {
  /** Máximo de ítems a devolver por página. */
  limit: number;
  /** Número de ítems a omitir (0-indexed). */
  offset: number;
};

/**
 * Resultado paginado genérico del repositorio.
 */
export type Page<T> = {
  items: T[];
  total: number;
};
