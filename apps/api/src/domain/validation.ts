import { z } from "zod";
import type { PostCategory, ResearchArea } from "./post";
import {
  POST_CATEGORIES,
  POST_TYPES,
  RESEARCH_AREAS,
  isResearchAreaInCategory,
} from "./taxonomy";

/**
 * Esquemas zod compartidos de la API (requisito R8 de threat-model-api.md).
 *
 * Revalidan EN EL SERVIDOR las reglas de `docs/design/auth.md` §4 y los
 * esquemas de `api-structure.md` §9.1. La validación del cliente es UX, nunca
 * control de acceso.
 */

/** Letras (incl. acentos), espacio, guion y apóstrofo para nombres propios. */
const NAME_RE = /^[\p{L}' -]+$/u;

/** Correo: trim, normalizado a minúsculas, máx. 254 (auth.md §4). */
export const emailSchema = z.string().trim().toLowerCase().email().max(254);

/** Contraseña de registro: 8–128, SIN trim (los espacios son válidos). */
export const passwordRegisterSchema = z.string().min(8).max(128);

/** Contraseña de login: 1–128 (sin min-8 para no revelar la política). */
export const passwordLoginSchema = z.string().min(1).max(128);

/** Nombre/apellido: trim, 2–60, solo letras, espacio, `-` y `'`. */
export const nameSchema = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(NAME_RE, "invalid_name");

/** Username: minúsculas, dígitos, `.`, `_` y `-`; máx. 50. */
export const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9._-]+$/, "invalid_username");

/** Id de recurso (post, usuario). */
export const idSchema = z.string().min(1).max(64);

/** Fecha wire del feed: YYYY-MM-DD. */
export const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Rubro de clasificación de una publicación (6 valores). */
export const postCategorySchema = z.enum(POST_CATEGORIES);

/** Naturaleza institucional de una publicación (5 valores). */
export const postTypeSchema = z.enum(POST_TYPES);

/** Área de investigación (39 valores: 38 específicas + `general`). */
export const researchAreaSchema = z.enum(RESEARCH_AREAS);

/** Visibilidad y estado editorial completo. */
export const postVisibilitySchema = z.enum([
  "publicado",
  "borrador",
  "oculto",
]);

/** Visibilidad que puede fijar el autor al crear/editar (`oculto` solo admin). */
export const authorVisibilitySchema = z.enum(["publicado", "borrador"]);

/** URL de imagen: solo `http`/`https`, máx. 500 (espejo de `validateImageUrl`). */
const imageUrlSchema = z
  .string()
  .max(500, "invalid_image_url")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "invalid_image_url");

/**
 * Añade un issue si `researchArea` no pertenece a `category`.
 *
 * Solo verifica cuando AMBOS campos están presentes: en un parche parcial la
 * coherencia del par efectivo se valida en el caso de uso contra la
 * publicación existente (`updatePost`).
 *
 * @param value - Objeto con `category`/`researchArea` opcionales.
 * @param ctx   - Contexto de refinamiento de zod.
 */
function checkResearchAreaPair(
  value: { category?: PostCategory; researchArea?: ResearchArea },
  ctx: z.RefinementCtx,
): void {
  if (
    value.category !== undefined &&
    value.researchArea !== undefined &&
    !isResearchAreaInCategory(value.researchArea, value.category)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "invalid_research_area",
      path: ["researchArea"],
    });
  }
}

/**
 * Campos editables de una publicación (crear/editar). Límites tomados de
 * `wireframes_posts.md` §4.4: título 5–120, cuerpo 30–4000, imagen http/https.
 */
const postEditableShape = {
  title: z.string().trim().min(5).max(120),
  /** Cuerpo Markdown; límite anti-DoS y de producto. */
  content: z.string().min(30).max(4000),
  category: postCategorySchema,
  type: postTypeSchema,
  researchArea: researchAreaSchema,
  visibility: authorVisibilitySchema,
  imageUrl: imageUrlSchema.nullable(),
};

/** Cuerpo de creación de publicación (api-structure.md §9.3). */
export const PostDraftSchema = z
  .object(postEditableShape)
  .extend({ imageUrl: postEditableShape.imageUrl.default(null) })
  .superRefine(checkResearchAreaPair);

/** Parche de edición para autor/admin (no vacío y par categoría/área coherente). */
const postPatchShape = z.object(postEditableShape).partial();
export const UpdatePostSchema = postPatchShape.superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: "custom", message: "empty_patch", path: [] });
    return;
  }
  checkResearchAreaPair(value, ctx);
});

/** Variante del PATCH para admin: puede fijar además `oculto` (moderación). */
export const AdminUpdatePostSchema = postPatchShape
  .extend({ visibility: postVisibilitySchema.optional() })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({ code: "custom", message: "empty_patch", path: [] });
      return;
    }
    checkResearchAreaPair(value, ctx);
  });

/** Cuerpo de moderación de visibilidad por admin (única vía para `oculto`). */
export const AdminSetVisibilitySchema = z.object({
  visibility: z.enum(["publicado", "oculto"]),
});

/** Cuerpo de asignación de rol por admin. */
export const SetUserRoleSchema = z.object({
  role: z.enum(["estudiante", "profesor", "admin"]),
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
  desde: dateParamSchema.nullable().optional().default(null),
  hasta: dateParamSchema.nullable().optional().default(null),
  limit: z.coerce.number().int().min(1).max(100).optional().default(6),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Cuerpo de registro público (R12): el rol no es aceptable aquí; cualquier
 * campo extra (p. ej. `role`) se descarta por el parseo de zod.
 */
export const RegisterSchema = z.object({
  givenName: nameSchema,
  familyName: nameSchema,
  email: emailSchema,
  password: passwordRegisterSchema,
});

/** Cuerpo de login (R13): username + contraseña. */
export const LoginSchema = z.object({
  username: usernameSchema,
  password: passwordLoginSchema,
});

// ─── Formas wire 1:1 (src/lib/types.ts) ──────────────────────────────────────

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

/** `Session` wire: sesión activa. */
export const sessionSchema = z
  .object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      role: z.enum(["estudiante", "profesor", "admin"]),
    }),
    expiresAt: z.string(),
  })
  .strict();

/** `User` wire: usuario registrado. */
export const userSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    role: z.enum(["estudiante", "profesor", "admin"]),
    createdAt: z.string(),
  })
  .strict();