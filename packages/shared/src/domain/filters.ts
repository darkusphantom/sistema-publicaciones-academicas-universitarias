import type { AuthorOption } from "../types/user";
import type { Post } from "../types/post";
import type { PostFilters } from "../types/filters";
import type { PostCategory } from "../taxonomy/post-category";
import type { PostType } from "../taxonomy/post-type";
import type { PostVisibility } from "../taxonomy/post-visibility";
import type { ResearchArea } from "../taxonomy/research-area";
import { POST_CATEGORIES } from "../taxonomy/post-category";
import { POST_TYPES } from "../taxonomy/post-type";
import { POST_VISIBILITIES } from "../taxonomy/post-visibility";
import { RESEARCH_AREA } from "../taxonomy/research-area";
import { DEFAULT_POST_FILTERS } from "../types/filters";

/** Conjunto de categorías válidas para validación O(1). */
const VALID_CATEGORIES = new Set<PostCategory>(POST_CATEGORIES);

/** Conjunto de tipos válidos para validación O(1). */
const VALID_TYPES = new Set<PostType>(POST_TYPES);

/** Conjunto de áreas de investigación válidas para validación O(1). */
const VALID_RESEARCH_AREAS = new Set<ResearchArea>(RESEARCH_AREA);

/** Conjunto de estados de visibilidad válidos para validación O(1). */
const VALID_STATUSES = new Set<PostVisibility>(POST_VISIBILITIES);

/** Patrón de fecha YYYY-MM-DD. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normaliza un string de búsqueda: trim, minúsculas, elimina diacríticos
 * y el prefijo `#`.
 *
 * Los diacríticos se eliminan con `String.prototype.normalize("NFD")` +
 * una regex que elimina marcas de combinación.
 *
 * @param value - String de entrada sin procesar.
 * @returns El string normalizado.
 * @complexity O(n) — un paso sobre el string.
 */
export function normalizeSearchText(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  return normalized.replace(/^#/, "");
}

/**
 * Analiza los search params de la URL (en español) en un objeto `PostFilters`.
 *
 * Tolerante: los valores desconocidos o mal formados se reemplazan
 * silenciosamente por sus valores por defecto.
 *
 * Mapeo de parámetros de URL (`docs/design/wireframes_feed.md` §4.3):
 * - `q`         → `keyword`
 * - `categoria` → `category`
 * - `tipo`      → `type`
 * - `area`      → `researchArea`
 * - `autor`     → `authorId`
 * - `estado`    → `status`
 * - `desde`     → `dateFrom`
 * - `hasta`     → `dateTo`
 *
 * @param params - Mapa clave-valor de `searchParams` (prop de página de Next.js).
 * @returns Un `PostFilters` completamente poblado.
 * @complexity O(1) — número constante de búsquedas de campos.
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

  const rawArea = getString("area");
  const researchArea = VALID_RESEARCH_AREAS.has(rawArea as ResearchArea)
    ? (rawArea as ResearchArea)
    : "todas";

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

  return {
    keyword: rawQ,
    category,
    type,
    researchArea,
    authorId,
    status,
    dateFrom,
    dateTo,
  };
}

/**
 * Serializa `PostFilters` en `URLSearchParams`, omitiendo los valores
 * por defecto para que la URL quede limpia.
 *
 * @param filters - Estado de filtros actual.
 * @returns Una instancia de `URLSearchParams` lista para añadir al pathname.
 * @complexity O(1) — conjunto de campos constante.
 */
export function toSearchParams(filters: PostFilters): URLSearchParams {
  const params = new URLSearchParams();
  const defaultPost = DEFAULT_POST_FILTERS;

  if (filters.keyword !== defaultPost.keyword) params.set("q", filters.keyword);
  if (filters.category !== defaultPost.category)
    params.set("categoria", filters.category);
  if (filters.type !== defaultPost.type) params.set("tipo", filters.type);
  if (filters.researchArea !== defaultPost.researchArea)
    params.set("area", filters.researchArea);
  if (filters.authorId !== defaultPost.authorId)
    params.set("autor", filters.authorId);
  if (filters.status !== defaultPost.status)
    params.set("estado", filters.status);
  if (filters.dateFrom !== defaultPost.dateFrom)
    params.set("desde", filters.dateFrom!);
  if (filters.dateTo !== defaultPost.dateTo)
    params.set("hasta", filters.dateTo!);

  return params;
}

/**
 * Cuenta el número de dimensiones de filtro que difieren de sus valores
 * por defecto.
 *
 * @param filters - Estado de filtros actual.
 * @returns Número de filtros activos (no por defecto).
 * @complexity O(1) — comparaciones constantes.
 */
export function countActiveFilters(filters: PostFilters): number {
  const defaultPost = DEFAULT_POST_FILTERS;
  let count = 0;
  if (filters.keyword !== defaultPost.keyword) count++;
  if (filters.category !== defaultPost.category) count++;
  if (filters.type !== defaultPost.type) count++;
  if (filters.researchArea !== defaultPost.researchArea) count++;
  if (filters.authorId !== defaultPost.authorId) count++;
  if (filters.status !== defaultPost.status) count++;
  if (filters.dateFrom !== defaultPost.dateFrom) count++;
  if (filters.dateTo !== defaultPost.dateTo) count++;
  return count;
}

/**
 * Valida que el rango de fechas sea coherente (`dateFrom` ≤ `dateTo`).
 *
 * @param filters - Estado de filtros actual.
 * @returns `false` solo cuando ambas cotas están definidas y `dateFrom` > `dateTo`.
 * @complexity O(1).
 */
export function isDateRangeValid(filters: PostFilters): boolean {
  const { dateFrom, dateTo } = filters;
  if (!dateFrom || !dateTo) return true;
  return dateFrom <= dateTo;
}

/**
 * Devuelve una descripción legible del filtro de rango de fechas activo,
 * adecuada para el mensaje de estado vacío.
 *
 * @param filters - Estado de filtros actual.
 * @param authors - Opciones de autor (incluidas en la firma para completitud).
 * @returns Un string de descripción, o un string vacío cuando no hay rango activo.
 * @complexity O(1).
 */
export function describeActiveFilters(
  filters: PostFilters,
  authors: AuthorOption[],
): string {
  void authors; // reservado para uso futuro cuando se muestre el nombre del autor
  const { dateFrom, dateTo } = filters;
  if (dateFrom && dateTo) {
    return `No hay publicaciones publicadas entre el ${dateFrom} y el ${dateTo}.`;
  }
  return "";
}

/**
 * Aplica los filtros dados a una lista de publicaciones y devuelve las
 * coincidencias ordenadas por `publishedAt` descendente (más reciente primero).
 *
 * Todas las comparaciones de texto son insensibles a diacríticos mediante
 * `normalizeSearchText`. El ordenamiento es estable en motores JS modernos.
 *
 * @param posts   - Lista completa de publicaciones (ya filtradas por visibilidad).
 * @param filters - Estado de filtros activo.
 * @returns Publicaciones filtradas y ordenadas.
 * @complexity O(n log n) — dominado por el ordenamiento; el filtrado es O(n).
 */
export function applyFilters(posts: Post[], filters: PostFilters): Post[] {
  const keyword = normalizeSearchText(filters.keyword);

  const result = posts.filter((post) => {
    // Filtro de categoría
    if (filters.category !== "todas" && post.category !== filters.category) {
      return false;
    }

    // Filtro de tipo
    if (filters.type !== "todos" && post.type !== filters.type) {
      return false;
    }

    // Filtro de área de investigación
    if (
      filters.researchArea !== "todas" &&
      post.researchArea !== filters.researchArea
    ) {
      return false;
    }

    // Filtro de autor
    if (filters.authorId !== "todos" && post.authorId !== filters.authorId) {
      return false;
    }

    // Filtro de estado/visibilidad
    if (filters.status !== "todos" && post.visibility !== filters.status) {
      return false;
    }

    // Filtro de rango de fechas (cotas inclusivas, comparadas como strings de fecha)
    const postDate = post.publishedAt.slice(0, 10); // YYYY-MM-DD
    if (filters.dateFrom && postDate < filters.dateFrom) return false;
    if (filters.dateTo && postDate > filters.dateTo) return false;

    // Filtro de palabra clave: busca en título y contenido normalizados
    if (keyword) {
      const inTitle = normalizeSearchText(post.title).includes(keyword);
      const inContent = normalizeSearchText(post.content).includes(keyword);
      if (!inTitle && !inContent) return false;
    }

    return true;
  });

  // Ordenar por publishedAt descendente (más reciente primero)
  result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return result;
}
