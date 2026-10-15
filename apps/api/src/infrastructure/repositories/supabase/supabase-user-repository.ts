import type {
  AuthorOption,
  User,
  UserRepository,
  UserRole,
} from "../../../domain/user";
import { NotImplementedError } from "../../../application/errors";
import type { SupabaseClient } from "./supabase-client";

/**
 * Scaffold del adaptador de `UserRepository` sobre la **API de Supabase**.
 *
 * **Funciones vacías a propósito** hasta que exista el esquema. Cada método
 * lanza `NotImplementedError` (→ 501). El contrato conserva la exclusión de
 * `email`/`role` en `listAuthors` (R18) y la actualización de rol con efecto
 * inmediato (R14); la implementación contra las tablas debe respetarlas.
 */
export class SupabaseUserRepository implements UserRepository {
  /**
   * @param client - Cliente de Supabase (secret key).
   */
  constructor(private readonly client: SupabaseClient) {}

  /**
   * (Contrato) Autores con al menos una publicación, sin `email` ni `role`.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async listAuthors(): Promise<AuthorOption[]> {
    throw new NotImplementedError("SupabaseUserRepository.listAuthors");
  }

  /**
   * (Contrato) Usuario por id.
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findById(_id: string): Promise<User | null> {
    throw new NotImplementedError("SupabaseUserRepository.findById");
  }

  /**
   * (Contrato) Usuario por username (unicidad sin distinguir mayúsculas).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findByUsername(_username: string): Promise<User | null> {
    throw new NotImplementedError("SupabaseUserRepository.findByUsername");
  }

  /**
   * (Contrato) Usuario por email (unicidad sin distinguir mayúsculas).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async findByEmail(_email: string): Promise<User | null> {
    throw new NotImplementedError("SupabaseUserRepository.findByEmail");
  }

  /**
   * (Contrato) Actualizar rol (efecto inmediato, rol fresco por petición).
   *
   * @throws NotImplementedError hasta que exista el esquema.
   */
  async updateRole(_id: string, _role: UserRole): Promise<User | null> {
    throw new NotImplementedError("SupabaseUserRepository.updateRole");
  }
}
