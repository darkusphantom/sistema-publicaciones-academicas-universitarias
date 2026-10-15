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

/**
 * Scaffold del adaptador PostgreSQL (Supabase) del puerto `PostRepository`.
 *
 * **Funciones vacías a propósito.** El contrato (mismo que el frontend y el
 * adaptador en memoria) está fijado; la implementación llega cuando el esquema
 * de la base de datos esté modelado (responsable: José/darkus). Mientras tanto,
 * cada método lanza `NotImplementedError` (→ 501) para **fallar de forma
 * explícita** en lugar de servir datos en memoria en producción.
 *
 * Conexión prevista: cadena de Supabase (pooler de sesión o directa) vía
 * `pg`/`postgres.js`; consultas **parametrizadas** (anti SQL injection) y con
 * RLS como defensa en profundidad. El frontend nunca habla con Supabase.
 */
export class PostgresPostRepository implements PostRepository {
  /**
   * @param connectionString - Cadena `postgresql://…` de Supabase. Solo se
   *   valida aquí; el pool de conexiones se abre al implementar las consultas.
   * @throws Error si la cadena viene vacía (fail-fast de configuración).
   */
  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error("PostgresPostRepository requires a DATABASE_URL");
    }
  }

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
    throw new NotImplementedError("PostgresPostRepository.findVisible");
  }

  /**
   * (Contrato) Publicación por id.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findById(_id: string): Promise<Post | null> {
    throw new NotImplementedError("PostgresPostRepository.findById");
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
    throw new NotImplementedError("PostgresPostRepository.create");
  }

  /**
   * (Contrato) Actualizar publicación.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async update(_id: string, _patch: UpdatePost): Promise<Post | null> {
    throw new NotImplementedError("PostgresPostRepository.update");
  }

  /**
   * (Contrato) Eliminar publicación.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async delete(_id: string): Promise<boolean> {
    throw new NotImplementedError("PostgresPostRepository.delete");
  }
}
