/**
 * Re-exportaciones de tipos de publicación desde `@redfacyt/shared`.
 *
 * Shim de compatibilidad: todos los imports existentes en `apps/api`
 * que apuntan a `../domain/post` continúan funcionando sin modificaciones.
 *
 * @module domain/post
 */

import type {
  Post,
  PostDraft,
  UpdatePost,
  PostPage,
  PageOptions,
  PostFilters,
  PostCategory,
  PostType,
  PostVisibility,
  ResearchArea,
  Session
} from "@redfacyt/shared";

/**TODO: aca se quito el from @redfacyt/shared. Revisar si cumple correctamente */
export type {
  Post,
  PostDraft,
  UpdatePost,
  PostPage,
  PageOptions,
  PostFilters,
  PostCategory,
  PostType,
  PostVisibility,
  ResearchArea,
};

export {
  DEFAULT_POST_FILTERS,
  POST_TYPES,
  POST_CATEGORIES,
  RESEARCH_AREA,
  POST_VISIBILITIES,
} from "@redfacyt/shared";

/**
 * Puerto hexagonal para el acceso a datos de publicaciones.
 *
 * Los adaptadores de `infrastructure/repositories/` implementan este puerto.
 */

export interface PostRepository {
  /**
   * Devuelve las publicaciones visibles para la sesión, filtradas y paginadas.
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