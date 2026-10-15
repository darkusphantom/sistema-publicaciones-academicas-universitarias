import type { Env } from "../../config/env";
import type { PostRepository } from "../../domain/post";
import type { UserRepository } from "../../domain/user";
import { InMemoryPostRepository } from "./in-memory/in-memory-post-repository";
import { InMemoryUserRepository } from "./in-memory/in-memory-user-repository";
import type { MemoryUserStore } from "./in-memory/user-store";
import { PostgresPostRepository } from "./postgres/postgres-post-repository";
import { PostgresUserRepository } from "./postgres/postgres-user-repository";

/** Par de repositorios inyectados en `createApp`. */
export type RepositorySet = {
  posts: PostRepository;
  users: UserRepository;
};

/**
 * Selecciona los adaptadores de persistencia según el entorno.
 *
 * - Con `DATABASE_URL` definida → adaptadores **PostgreSQL (Supabase)**. Hoy son
 *   stubs que lanzan `NotImplementedError` (501): el contrato es el definitivo,
 *   falta la implementación contra el esquema real.
 * - Sin `DATABASE_URL` (desarrollo local/tests) → adaptadores **en memoria**,
 *   que siguen siendo el fallback temporal mientras no exista la base de datos.
 *
 * Decisión de diseño: la memoria **no** debe usarse en producción; el objetivo
 * es Supabase como única fuente de verdad, accedida solo desde esta API.
 *
 * @param env   - Entorno tipado (lee `DATABASE_URL`).
 * @param store - Store en memoria compartido (fallback de desarrollo).
 * @returns El par de repositorios activo.
 */
export function createRepositories(
  env: Env,
  store: MemoryUserStore,
): RepositorySet {
  if (env.DATABASE_URL) {
    return {
      posts: new PostgresPostRepository(env.DATABASE_URL),
      users: new PostgresUserRepository(env.DATABASE_URL),
    };
  }
  return {
    posts: new InMemoryPostRepository(store),
    users: new InMemoryUserRepository(store),
  };
}
