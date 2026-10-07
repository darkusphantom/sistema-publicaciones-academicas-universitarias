/**
 * Re-exportaciones desde `@redfacyt/shared`.
 *
 * Este archivo actúa como shim de compatibilidad: los imports existentes en
 * todo el frontend (`@/lib/types`) continúan funcionando sin modificaciones
 * mientras la fuente de verdad vive en el paquete compartido.
 *
 * @module lib/types
 */

export type {
  UserRole,
  User,
  Session,
  AuthorOption,
  Post,
  PostDraft,
  UpdatePost,
  PostPage,
  PageOptions,
  PostFormValues,
  PostSubmitIntent,
  PostFilters,
  PostCategory,
  PostType,
  PostVisibility,
  ResearchArea,
} from "@redfacyt/shared";

export {
  DEFAULT_POST_FILTERS,
  POSTS_PAGE_SIZE,
} from "@redfacyt/shared";

/**
 * Tipos utilitarios propios del frontend (no compartidos con la API).
 */

/** Errores a nivel de campo en un formulario basados en su modelo. */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/** Resultado estándar para operaciones de autenticación. */
export type AuthResult =
  | { success: true; session: import("@redfacyt/shared").Session }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
