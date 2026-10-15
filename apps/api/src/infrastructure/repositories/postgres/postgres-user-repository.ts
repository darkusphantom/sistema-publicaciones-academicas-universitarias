import type {
  AuthorOption,
  User,
  UserRepository,
  UserRole,
} from "../../../domain/user";
import { NotImplementedError } from "../../../application/errors";

/**
 * Scaffold del adaptador PostgreSQL (Supabase) del puerto `UserRepository`.
 *
 * **Funciones vacías a propósito** hasta que exista el esquema de la base de
 * datos. Cada método lanza `NotImplementedError` (→ 501) para fallar de forma
 * explícita. La exclusión de `email`/`role` en `listAuthors` (R18) y la
 * actualización de rol con efecto inmediato (R14) se conservan en el contrato;
 * la implementación SQL debe respetarlas.
 */
export class PostgresUserRepository implements UserRepository {
  /**
   * @param connectionString - Cadena `postgresql://…` de Supabase.
   * @throws Error si la cadena viene vacía (fail-fast de configuración).
   */
  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error("PostgresUserRepository requires a DATABASE_URL");
    }
  }

  /**
   * (Contrato) Autores con al menos una publicación, sin `email` ni `role`.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async listAuthors(): Promise<AuthorOption[]> {
    throw new NotImplementedError("PostgresUserRepository.listAuthors");
  }

  /**
   * (Contrato) Usuario por id.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findById(_id: string): Promise<User | null> {
    throw new NotImplementedError("PostgresUserRepository.findById");
  }

  /**
   * (Contrato) Usuario por username (unicidad sin distinguir mayúsculas).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findByUsername(_username: string): Promise<User | null> {
    throw new NotImplementedError("PostgresUserRepository.findByUsername");
  }

  /**
   * (Contrato) Usuario por email (unicidad sin distinguir mayúsculas).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findByEmail(_email: string): Promise<User | null> {
    throw new NotImplementedError("PostgresUserRepository.findByEmail");
  }

  /**
   * (Contrato) Actualizar rol (efecto inmediato, rol fresco por petición).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async updateRole(_id: string, _role: UserRole): Promise<User | null> {
    throw new NotImplementedError("PostgresUserRepository.updateRole");
  }
}
