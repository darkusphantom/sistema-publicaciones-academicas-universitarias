import type { PostCategory } from "../taxonomy/post-category";
import type { PostType } from "../taxonomy/post-type";
import type { PostVisibility } from "../taxonomy/post-visibility";
import type { ResearchArea } from "../taxonomy/research-area";

/**
 * Publicación completa de la plataforma Red FaCyT.
 * Fuente de verdad: este tipo es la referencia para `apps/web` y `apps/api`.
 */
export type Post = {
  id: string;
  title: string;
  /** Cuerpo completo en Markdown. */
  content: string;
  authorId: string;
  type: PostType;
  category: PostCategory;
  researchArea: ResearchArea;
  visibility: PostVisibility;
  /** ISO 8601. Clave primaria de orden del feed (siempre descendente). */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  /** URL de imagen de portada; `null` si no se ha asignado. */
  imageUrl: string | null;
};

/**
 * Datos de creación de publicación aportados por el cliente.
 * El `authorId` y los timestamps los fija el servidor; nunca vienen del body.
 */
export type PostDraft = {
  title: string;
  content: string;
  category: PostCategory;
  type: PostType;
  researchArea: ResearchArea;
  /** El autor solo puede crear `publicado` o `borrador`; `oculto` es de admin. */
  visibility: "publicado" | "borrador";
  imageUrl: string | null;
};

/**
 * Parche de edición de publicación.
 *
 * `publishedAt` solo lo fija el SERVIDOR en la transición `borrador → publicado`
 * (los esquemas zod de las rutas nunca lo aceptan del cliente).
 */
export type UpdatePost = Partial<
  Pick<
    Post,
    | "title"
    | "content"
    | "category"
    | "type"
    | "researchArea"
    | "visibility"
    | "imageUrl"
    | "publishedAt"
  >
>;

/**
 * Página de resultados del repositorio de publicaciones.
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
 * Valores del formulario de creación/edición de publicación.
 * Visibility se omite porque la dicta el botón de envío presionado.
 */
export type PostFormValues = {
  title: string;
  content: string;
  imageUrl: string;
  type: PostType;
  category: PostCategory;
  researchArea: ResearchArea;
};

/** Discrimina qué botón de envío fue presionado. */
export type PostSubmitIntent = "publicar" | "guardar-borrador";
