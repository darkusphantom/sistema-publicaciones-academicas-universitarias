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
import { NotImplementedError } from "../../../application/errors";
import type { SupabaseClient } from "./supabase-client";

/**
 * Scaffold del adaptador de `PostRepository` sobre la **API de Supabase**
 * (`@supabase/supabase-js` → Data API del proyecto).
 *
 * **Funciones vacías a propósito.** El contrato (idéntico al espejo del
 * frontend y al adaptador en memoria) está fijado; la implementación llega
 * cuando el esquema esté modelado. Mientras tanto, cada método lanza
 * `NotImplementedError` (→ 501) para **fallar de forma explícita** en vez de
 * servir datos en memoria en producción.
 *
 * La autorización (rol/propietario) la aplica esta API; el cliente usa la
 * secret key, que bypassa RLS.
 */
export class SupabasePostRepository implements PostRepository {
  /**
   * @param client - Cliente de Supabase (secret key).
   */
  constructor(private readonly client: SupabaseClient) {}

  /**
   * (Contrato) Publicaciones visibles para la sesión, filtradas y paginadas.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findVisible(
    _filters: PostFilters,
    _page: PageOptions,
    _session: Session,
  ): Promise<PostPage> {
    throw new NotImplementedError("SupabasePostRepository.findVisible");
  }

  /**
   * (Contrato) Publicación por id.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findById(_id: string): Promise<Post | null> {
    throw new NotImplementedError("SupabasePostRepository.findById");
  }

  /**
   * (Contrato) Crear publicación (el `authorId` lo fija el caso de uso).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async create(
    _draft: PostDraft & {
      authorId: string;
      publishedAt: string;
      createdAt: string;
      updatedAt: string;
    },
  ): Promise<Post> {
    throw new NotImplementedError("SupabasePostRepository.create");
  }

  /**
   * (Contrato) Actualizar publicación.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async update(_id: string, _patch: UpdatePost): Promise<Post | null> {
    throw new NotImplementedError("SupabasePostRepository.update");
  }

  /**
   * (Contrato) Eliminar publicación.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async delete(_id: string): Promise<boolean> {
    throw new NotImplementedError("SupabasePostRepository.delete");
  }
}
