import type { Session } from "./session";

/**
 * Categoría institucional de una publicación (espejo de `src/lib/types.ts`).
 */
export type PostCategory =
  | "noticias"
  | "eventos"
  | "defensas"
  | "investigacion"
  | "convocatorias";

/**
 * Naturaleza del contenido según el MVP (espejo de `src/lib/types.ts`).
 */
export type PostType = "post" | "articulo" | "ensenanza";

/**
 * Visibilidad y estado editorial de una publicación:
 * - `publicado`: visible para todos.
 * - `borrador`: visible solo para el autor.
 * - `oculto`: oculto por el admin; visible para el autor y el admin.
 */
export type PostVisibility = "publicado" | "borrador" | "oculto";

/**
 * Representa una publicación de la plataforma (espejo de `src/lib/types.ts`).
 */
export type Post = {
  id: string;
  title: string;
  /** Cuerpo completo en Markdown. */
  content: string;
  authorId: string;
  category: PostCategory;
  type: PostType;
  visibility: PostVisibility;
  /** ISO 8601. Clave primaria de orden del feed (siempre descendente). */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Siempre `null` en la fase estática; la imagen llega con el backend. */
  imageUrl: string | null;
};

/**
 * Estado de filtros activos del feed (espejo de `src/lib/types.ts`).
 * `"todas"` / `"todos"` significan "sin filtro" en esa dimensión.
 */
export type PostFilters = {
  keyword: string;
  category: PostCategory | "todas";
  type: PostType | "todos";
  authorId: string | "todos";
  status: PostVisibility | "todos";
  /** `YYYY-MM-DD` o `null`. Cota inferior inclusiva. */
  dateFrom: string | null;
  /** `YYYY-MM-DD` o `null`. Cota superior inclusiva. */
  dateTo: string | null;
};

/**
 * Página de resultados del repositorio de publicaciones (espejo de
 * `post-repository.ts`).
 */
export type PostPage = {
  items: Post[];
  total: number;
};

/**
 * Parámetros de paginación de una consulta al repositorio.
 */
export type PageOptions = {
  limit: number;
  offset: number;
};

/**
 * Puerto hexagonal para el acceso a datos de publicaciones.
 *
 * Espejo fiel de `PostRepository` del frontend (`src/lib/repositories/`) para
 * que el backend sea plug-and-play sin rework del frontend. Los adaptadores de
 * `infrastructure/repositories/` implementan este puerto.
 */
export interface PostRepository {
  /**
   * Devuelve las publicaciones visibles para la sesión, filtradas y paginadas.
   *
   * Aplica reglas de visibilidad, luego filtros, luego orden por `publishedAt`
   * DESC y finalmente paginación.
   *
   * @param filters - Estado de filtros activo.
   * @param page    - Opciones de paginación.
   * @param session - Sesión activa para decisiones de visibilidad.
   * @returns Página de publicaciones visibles y total de coincidencias.
   */
  findVisible(
    filters: PostFilters,
    page: PageOptions,
    session: Session,
  ): Promise<PostPage>;

  /**
   * Busca una publicación por su id, sin importar la visibilidad.
   *
   * @param id - Id de la publicación.
   * @returns La publicación, o `null` si no existe.
   */
  findById(id: string): Promise<Post | null>;
}