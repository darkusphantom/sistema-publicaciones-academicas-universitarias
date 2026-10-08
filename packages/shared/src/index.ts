/**
 * @redfacyt/shared — Fuente de verdad del monorepo Red FaCyT.
 *
 * Exporta en orden:
 * 1. Taxonomía (enums de valores)
 * 2. Tipos de dominio
 * 3. Esquemas Zod
 * 4. Lógica de dominio puro
 */

// ─── Taxonomía ───────────────────────────────────────────────────────────────

export {
  POST_TYPES,
  type PostType,
} from "./taxonomy/post-type";

export {
  POST_CATEGORIES,
  type PostCategory,
} from "./taxonomy/post-category";

export {
  RESEARCH_AREA,
  type ResearchArea,
} from "./taxonomy/research-area";

export {
  POST_VISIBILITIES,
  type PostVisibility,
} from "./taxonomy/post-visibility";

// ─── Tipos de dominio ─────────────────────────────────────────────────────────

export type {
  Post,
  PostDraft,
  UpdatePost,
  PostPage,
  PageOptions,
  PostFormValues,
  PostSubmitIntent,
} from "./types/post";

export type {
  UserRole,
  User,
  AuthorOption,
} from "./types/user";

export type { Session } from "./types/session";

export {
  DEFAULT_POST_FILTERS,
  POSTS_PAGE_SIZE,
  type PostFilters,
} from "./types/filters";

export type { Page } from "./types/pagination";

// ─── Esquemas Zod ─────────────────────────────────────────────────────────────

export {
  postCategorySchema,
  postTypeSchema,
  researchAreaSchema,
  postVisibilitySchema,
  authorVisibilitySchema,
  PostDraftSchema,
  UpdatePostSchema,
  AdminUpdatePostSchema,
  AdminSetVisibilitySchema,
  FeedQuerySchema,
  postSchema,
  postPageSchema,
  authorOptionSchema,
} from "./schemas/post";

export {
  emailSchema,
  passwordRegisterSchema,
  passwordLoginSchema,
  nameSchema,
  usernameSchema,
  idSchema,
  RegisterSchema,
  LoginSchema,
  sessionSchema,
  userSchema,
  SetUserRoleSchema,
} from "./schemas/auth";

export {
  bioSchema,
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  avatarFileSchema,
  AVATAR_DATA_URL_MAX_CHARS,
  avatarDataUrlSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from "./schemas/profile";

// ─── Lógica de dominio puro ───────────────────────────────────────────────────

export {
  canViewPost,
  filterVisiblePosts,
} from "./domain/can-view-post";

export {
  normalizeSearchText,
  fromSearchParams,
  toSearchParams,
  countActiveFilters,
  isDateRangeValid,
  describeActiveFilters,
  applyFilters,
} from "./domain/filters";
