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

/** Estado de filtros por defecto — sin filtros activos (espejo del frontend). */
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
 * Datos de creación de publicación aportados por el cliente
 * (api-structure.md §9.3). El `authorId` y los timestamps los fija el
 * servidor; nunca vienen del body.
 */
export type PostDraft = {
  title: string;
  content: string;
  category: PostCategory;
  type: PostType;
  /** El autor solo puede crear `publicado` o `borrador`; `oculto` es de admin. */
  visibility: "publicado" | "borrador";
  imageUrl: string | null;
};

/**
 * Parche de edición de publicación.
 *
 * `publishedAt` solo lo fija el SERVIDOR en la transición `borrador → publicado`
 * (los esquemas zod de las rutas nunca lo aceptan del cliente). `visibility`
 * admite además `oculto` para la vía de moderación por admin. Los campos
 * inmutables (`id`, `authorId`, `createdAt`) nunca forman parte del parche.
 */
export type UpdatePost = Partial<
  Pick<
    Post,
    "title" | "content" | "category" | "type" | "visibility" | "imageUrl" | "publishedAt"
  >
>;

/**
 * Puerto hexagonal para el acceso a datos de publicaciones.
 *
 * Espejo fiel de `PostRepository` del frontend (`src/lib/repositories/`) para
 * que el backend sea plug-and-play sin rework del frontend (parte de lectura),
 * más las extensiones de escritura de la API (api-structure.md §11.3). Los
 * adaptadores de `infrastructure/repositories/` implementan este puerto.
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

  /**
   * Crea una publicación. `authorId` y los timestamps ya vienen resueltos
   * por el caso de uso (nunca del body del cliente).
   *
   * @param draft - Borrador completo con metadatos de servidor.
   * @returns La publicación creada.
   */
  create(
    draft: PostDraft & {
      authorId: string;
      publishedAt: string;
      createdAt: string;
      updatedAt: string;
    },
  ): Promise<Post>;

  /**
   * Actualiza una publicación existente y devuelve la versión nueva.
   *
   * @param id    - Id de la publicación.
   * @param patch - Campos editables.
   * @returns La publicación actualizada, o `null` si el id no existe.
   */
  update(id: string, patch: UpdatePost): Promise<Post | null>;

  /**
   * Elimina una publicación.
   *
   * @param id - Id de la publicación.
   * @returns `true` si existía y fue eliminada; `false` si no existía.
   */
  delete(id: string): Promise<boolean>;
}