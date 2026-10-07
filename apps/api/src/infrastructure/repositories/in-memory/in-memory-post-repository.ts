import type {
  PageOptions,
  Post,
  PostDraft,
  PostFilters,
  PostPage,
  PostRepository,
  UpdatePost,
} from "../../../domain/post";
import type { Session } from "../../../domain/session";
import { randomUUID } from "node:crypto";
import { canViewPost } from "../../../domain/visibility";
import { MemoryUserStore } from "./user-store";

/**
 * Normaliza texto para búsqueda: trim, minúsculas y sin diacríticos.
 * Espejo de `normalizeSearchText` de `src/lib/filters.ts` (misma semántica).
 *
 * @param value - Texto crudo.
 * @returns Texto normalizado.
 * @complexity O(n).
 */
function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Aplica los filtros del feed sobre una lista ya filtrada por visibilidad.
 * Espejo de `applyFilters` de `src/lib/filters.ts`:
 * 1. keyword en título y cuerpo (sin diacríticos),
 * 2. categoría, tipo, autor, estado,
 * 3. rango de fechas inclusivo (YYYY-MM-DD),
 * 4. orden por `publishedAt` DESC.
 *
 * @param posts   - Publicaciones ya visibles para la sesión.
 * @param filters - Estado de filtros activo.
 * @returns Publicaciones filtradas y ordenadas.
 * @complexity O(n log n) dominado por el orden.
 */
function applyFilters(posts: Post[], filters: PostFilters): Post[] {
  const keyword = normalizeSearchText(filters.keyword);
  const result = posts.filter((post) => {
    if (filters.category !== "todas" && post.category !== filters.category) {
      return false;
    }
    if (filters.type !== "todos" && post.type !== filters.type) {
      return false;
    }
    if (filters.authorId !== "todos" && post.authorId !== filters.authorId) {
      return false;
    }
    if (filters.status !== "todos" && post.visibility !== filters.status) {
      return false;
    }
    const postDate = post.publishedAt.slice(0, 10);
    if (filters.dateFrom && postDate < filters.dateFrom) return false;
    if (filters.dateTo && postDate > filters.dateTo) return false;
    if (keyword) {
      const inTitle = normalizeSearchText(post.title).includes(keyword);
      const inContent = normalizeSearchText(post.content).includes(keyword);
      if (!inTitle && !inContent) return false;
    }
    return true;
  });
  result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return result;
}

/**
 * Implementación en memoria del puerto `PostRepository`.
 *
 * La parte de lectura replica el contrato del frontend
 * (`canViewPost` → `applyFilters` → orden DESC → paginación). La regla de
 * visibilidad se importa de `domain/visibility.ts` (fuente única de la regla,
 * QA-5). Las operaciones de escritura comparten el `MemoryUserStore` (fuente
 * única de verdad).
 */
export class InMemoryPostRepository implements PostRepository {
  /**
   * @param store - Store compartido (fuente única de verdad).
   * @param options - Opciones: reloj inyectable para `updatedAt` (tests).
   */
  constructor(
    private readonly store: MemoryUserStore,
    private readonly options: { now?: () => Date } = {},
  ) {}

  /**
   * Puebla el store con publicaciones iniciales (usado por tests y seed).
   *
   * @param posts - Publicaciones a insertar.
   */
  seed(posts: Post[]): void {
    for (const post of posts) {
      this.store.savePost(post);
    }
  }

  /**
   * Devuelve las publicaciones visibles para la sesión, filtradas, ordenadas
   * por `publishedAt` DESC y paginadas con `limit`/`offset`.
   *
   * @param filters - Estado de filtros activo.
   * @param page    - Opciones de paginación.
   * @param session - Sesión activa.
   * @returns Página de publicaciones visibles y total de coincidencias.
   * @complexity O(n log n) dominado por el orden del feed.
   */
  async findVisible(
    filters: PostFilters,
    page: PageOptions,
    session: Session,
  ): Promise<PostPage> {
    const visible = this.store.allPosts().filter((post) =>
      canViewPost(post, session),
    );
    const filtered = applyFilters(visible, filters);
    const total = filtered.length;
    const items = filtered.slice(page.offset, page.offset + page.limit);
    return { items, total };
  }

  /**
   * Busca una publicación por su id, sin importar la visibilidad (O(1)).
   *
   * @param id - Id de la publicación.
   * @returns La publicación, o `null`.
   */
  async findById(id: string): Promise<Post | null> {
    return this.store.postById(id) ?? null;
  }

  /**
   * Crea una publicación con los metadatos ya resueltos por el caso de uso.
   *
   * @param draft - Borrador completo con `authorId` y timestamps.
   * @returns La publicación creada.
   */
  async create(
    draft: PostDraft & {
      authorId: string;
      publishedAt: string;
      createdAt: string;
      updatedAt: string;
    },
  ): Promise<Post> {
    const post: Post = {
      id: randomUUID(),
      title: draft.title,
      content: draft.content,
      authorId: draft.authorId,
      category: draft.category,
      type: draft.type,
      researchArea: draft.researchArea,
      visibility: draft.visibility,
      publishedAt: draft.publishedAt,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      imageUrl: draft.imageUrl,
    };
    this.store.savePost(post);
    return post;
  }

  /**
   * Actualiza una publicación y devuelve la nueva versión.
   *
   * `updatedAt` se fija con el reloj inyectado en el constructor (o `Date` por
   * defecto), de modo que los tests no dependen del reloj real (QA-4).
   *
   * @param id    - Id de la publicación.
   * @param patch - Campos editables.
   * @returns La publicación actualizada, o `null` si no existe.
   */
  async update(id: string, patch: UpdatePost): Promise<Post | null> {
    const current = this.store.postById(id);
    if (!current) return null;
    const updated: Post = {
      ...current,
      ...patch,
      updatedAt: (this.options.now?.() ?? new Date()).toISOString(),
    };
    this.store.savePost(updated);
    return updated;
  }

  /**
   * Elimina una publicación.
   *
   * @param id - Id de la publicación.
   * @returns `true` si existía y fue eliminada.
   */
  async delete(id: string): Promise<boolean> {
    return this.store.removePost(id);
  }
}