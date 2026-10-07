import type { PostCategory } from "../taxonomy/post-category";
import type { PostType } from "../taxonomy/post-type";
import type { PostVisibility } from "../taxonomy/post-visibility";
import type { ResearchArea } from "../taxonomy/research-area";

/**
 * Estado de filtros activos del feed.
 * `"todas"` / `"todos"` significan "sin filtro" en esa dimensión.
 */
export type PostFilters = {
  /** Palabra clave; buscada en título y cuerpo. Máx. 80 caracteres tras trim. */
  keyword: string;
  category: PostCategory | "todas";
  type: PostType | "todos";
  researchArea: ResearchArea | "todas";
  authorId: string | "todos";
  status: PostVisibility | "todos";
  /** `YYYY-MM-DD` o `null`. Cota inferior inclusiva. */
  dateFrom: string | null;
  /** `YYYY-MM-DD` o `null`. Cota superior inclusiva. */
  dateTo: string | null;
};

/** Estado de filtros por defecto — sin filtros activos. */
export const DEFAULT_POST_FILTERS: PostFilters = {
  keyword: "",
  category: "todas",
  type: "todos",
  researchArea: "todas",
  authorId: "todos",
  status: "todos",
  dateFrom: null,
  dateTo: null,
};

/** Tamaño de página para el botón "Cargar más". */
export const POSTS_PAGE_SIZE = 6;
