import { z } from "zod";
import { POST_CATEGORIES } from "../taxonomy/post-category";
import { POST_TYPES } from "../taxonomy/post-type";
import { POST_VISIBILITIES } from "../taxonomy/post-visibility";
import { RESEARCH_AREA } from "../taxonomy/research-area";

/**
 * Esquemas Zod de publicaciones — fuente de verdad para web y API.
 *
 * Revalidan EN EL SERVIDOR las reglas de `docs/design/auth.md` §4 y los
 * esquemas de `api-structure.md` §9.1. La validación del cliente es UX,
 * nunca control de acceso.
 */

/** Categoría institucional de una publicación. */
export const postCategorySchema = z.enum(POST_CATEGORIES);

/** Naturaleza del contenido según el MVP. */
export const postTypeSchema = z.enum(POST_TYPES);

/** Área de investigación específica. */
export const researchAreaSchema = z.enum(RESEARCH_AREA);

/** Visibilidad y estado editorial completo. */
export const postVisibilitySchema = z.enum(POST_VISIBILITIES);

/** Visibilidad que puede fijar el autor al crear/editar (`oculto` solo admin). */
export const authorVisibilitySchema = z.enum(["publicado", "borrador"] as const);

/** Campos editables de una publicación (forma compartida por crear/editar). */
const postEditableShape = {
  title: z.string().trim().min(1).max(200),
  /** Cuerpo Markdown; límite anti-DoS. */
  content: z.string().min(1).max(10000),
  category: postCategorySchema,
  type: postTypeSchema,
  researchArea: researchAreaSchema,
  visibility: authorVisibilitySchema,
  imageUrl: z.string().url().max(2048).nullable().optional(),
};

/** Cuerpo de creación de publicación (api-structure.md §9.3). */
export const PostDraftSchema = z.object({
  ...postEditableShape,
  imageUrl: postEditableShape.imageUrl.default(null),
});

/** Parche de edición para autor/admin (no vacío). */
const postPatchShape = z.object(postEditableShape).partial();
export const UpdatePostSchema = postPatchShape.refine(
  (value) => Object.keys(value).length > 0,
  { message: "empty_patch" },
);

/** Variante del PATCH para admin: puede fijar además `oculto` (moderación). */
export const AdminUpdatePostSchema = postPatchShape
  .extend({ visibility: postVisibilitySchema.optional() })
  .refine((value) => Object.keys(value).length > 0, {
    message: "empty_patch",
  });

/** Cuerpo de moderación de visibilidad por admin (única vía para `oculto`). */
export const AdminSetVisibilitySchema = z.object({
  visibility: z.enum(["publicado", "oculto"] as const),
});

/**
 * Query del feed con los nombres wire del frontend (`toSearchParams` de
 * `src/lib/filters.ts`): `q`, `categoria`, `tipo`, `area`, `autor`, `estado`,
 * `desde`, `hasta`, más `limit`/`offset`.
 */
export const FeedQuerySchema = z.object({
  q: z.string().trim().max(80).optional().default(""),
  categoria: postCategorySchema
    .or(z.literal("todas"))
    .optional()
    .default("todas"),
  tipo: postTypeSchema.or(z.literal("todos")).optional().default("todos"),
  area: researchAreaSchema.or(z.literal("todas")).optional().default("todas"),
  autor: z.string().max(64).optional().default("todos"),
  estado: postVisibilitySchema
    .or(z.literal("todos"))
    .optional()
    .default("todos"),
  desde: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .default(null),
  hasta: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .default(null),
  limit: z.coerce.number().int().min(1).max(100).optional().default(6),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Formas wire de la API (fuente de verdad del contrato, api-structure.md §6).
 * `strict()` para que los contract tests detecten campos extra o ausentes.
 */

/** `Post` wire: publicación completa. */
export const postSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    authorId: z.string(),
    category: postCategorySchema,
    type: postTypeSchema,
    researchArea: researchAreaSchema,
    visibility: postVisibilitySchema,
    publishedAt: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    imageUrl: z.string().nullable(),
  })
  .strict();

/** `PostPage` wire: página de publicaciones. */
export const postPageSchema = z
  .object({
    items: z.array(postSchema),
    total: z.number().int().nonnegative(),
  })
  .strict();

/** `AuthorOption` wire: autor ligero (sin email ni rol). */
export const authorOptionSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    fullName: z.string(),
  })
  .strict();
