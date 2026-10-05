/**
 * Define the possible roles for users in the platform.
 */
export type UserRole = "estudiante" | "profesor" | "admin";

/**
 * Represents a registered user in the system.
 */
export type User = {
  id: string;
  username: string;
  email: string;
  givenName: string;
  familyName: string;
  role: UserRole;
  createdAt: string;
};

/**
 * Represents an active user session.
 */
export type Session = {
  user: Pick<User, "id" | "username" | "role">;
  expiresAt: string;
};

/**
 * Utility type to represent field-level errors in a form based on its model.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Standardized result for authentication operations.
 */
export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

// ─── Feed domain types ────────────────────────────────────────────────────────

/**
 * Nature of the content (Naturaleza institucional).
 */
export type PostType =
  | "post" | "articulo" | "ensenanza"
  | "noticias"
  | "eventos"
  | "defensas"
  | "investigacion"
  | "convocatorias";

/**
 * Classification Realm / Disciplines (Rubro de clasificación).
 * Five disciplines of the FCT plus one professional development track.
 */
export type PostCategory =
  | "matematicas"
  | "biologia"
  | "quimica"
  | "fisica"
  | "computacion"
  | "crecimiento-profesional";

/**
 * Specific research area within a category. 38 areas + "general".
 */
export type ResearchArea =
  | "general"
  | "estadistica" | "probabilidad" | "optimizacion"
  | "matematicas-aplicadas" | "modelado-matematico"
  | "biotecnologia" | "bioquimica" | "genetica" | "microbiologia"
  | "ecologia" | "bioinformatica"
  | "quimica-analitica" | "quimica-organica" | "quimica-inorganica"
  | "fisicoquimica" | "quimica-medioambiental"
  | "fisica-computacional" | "fisica-de-materiales" | "astronomia"
  | "fisica-nuclear" | "mecanica-de-fluidos"
  | "inteligencia-artificial" | "aprendizaje-automatico" | "ciencia-de-datos"
  | "desarrollo-web" | "ingenieria-software" | "redes-telecomunicaciones"
  | "seguridad-informatica" | "sistemas-distribuidos" | "bases-de-datos"
  | "computacion-grafica" | "robotica" | "arquitectura-computadores"
  | "gestion-proyectos" | "liderazgo" | "emprendimiento"
  | "comunicacion-profesional" | "etica-profesional";

/**
 * Visibility and editorial state of a publication.
 * - `publicado`: visible to everyone.
 * - `borrador`: visible only to the author.
 * - `oculto`: hidden by admin; visible to author and admin.
 */
export type PostVisibility = "publicado" | "borrador" | "oculto";

/**
 * Represents a single publication in the platform.
 */
export type Post = {
  id: string;
  title: string;
  /** Full body in Markdown. Shown as plain text in the static phase. */
  content: string;
  authorId: string;
  type: PostType;
  category: PostCategory;
  researchArea: ResearchArea;
  visibility: PostVisibility;
  /** ISO 8601. Primary sort key for the feed (always descending). */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Optional image banner. */
  imageUrl: string | null;
};

/**
 * Values for the post creation/editing form.
 * Visibility is omitted because it is dictated by the submit button pressed.
 */
export type PostFormValues = {
  title: string;
  content: string;
  imageUrl: string;
  type: PostType;
  category: PostCategory;
  researchArea: ResearchArea;
};

/** Discriminates which submit button was pressed. */
export type PostSubmitIntent = "publicar" | "guardar-borrador";

/**
 * Active filter state for the feed.
 * `"todas"` / `"todos"` mean "no filter applied" for that dimension.
 */
export type PostFilters = {
  /** Keyword; searched in title and body. Max 80 chars after trim. */
  keyword: string;
  category: PostCategory | "todas";
  type: PostType | "todos";
  researchArea: ResearchArea | "todas";
  authorId: string | "todos";
  status: PostVisibility | "todos";
  /** `YYYY-MM-DD` or `null`. Inclusive lower bound. */
  dateFrom: string | null;
  /** `YYYY-MM-DD` or `null`. Inclusive upper bound. */
  dateTo: string | null;
};

/** Default filter state — no filters active. */
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

/**
 * Page size for the "Cargar más" button.
 */
export const POSTS_PAGE_SIZE = 6;

/**
 * Lightweight author data used in filter dropdowns and card metadata.
 */
export type AuthorOption = {
  id: string;
  username: string;
  /** Full display name, e.g. "María Rivas". */
  fullName: string;
};
