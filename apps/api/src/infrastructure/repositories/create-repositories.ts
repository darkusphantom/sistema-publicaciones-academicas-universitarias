import type { Env } from "../../config/env";
import type { PostRepository } from "../../domain/post";
import type { UserRepository } from "../../domain/user";
import { InMemoryPostRepository } from "./in-memory/in-memory-post-repository";
import { InMemoryUserRepository } from "./in-memory/in-memory-user-repository";
import type { MemoryUserStore } from "./in-memory/user-store";
import { createSupabaseClient } from "./supabase/supabase-client";
import { SupabasePostRepository } from "./supabase/supabase-post-repository";
import { SupabaseUserRepository } from "./supabase/supabase-user-repository";

/** Par de repositorios inyectados en `createApp`. */
export type RepositorySet = {
  posts: PostRepository;
  users: UserRepository;
};

/**
 * Selecciona los adaptadores de persistencia según el entorno.
 *
 * - Con `SUPABASE_URL` + `SUPABASE_SECRET_KEY` → adaptadores que usan la **API de
 *   Supabase** (`supabase-js`, Data API). Hoy son stubs que lanzan
 *   `NotImplementedError` (501): el contrato es el definitivo, falta la
 *   implementación contra el esquema real.
 * - Sin esas claves (desarrollo local/tests) → adaptadores **en memoria**, que
 *   siguen siendo el fallback temporal mientras no exista el esquema.
 *
 * Decisión de diseño: la memoria **no** debe usarse en producción; el objetivo
 * es Supabase como única fuente de verdad, accedida solo desde esta API.
 *
 * @param env   - Entorno tipado (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`).
 * @param store - Store en memoria compartido (fallback de desarrollo).
 * @returns El par de repositorios activo.
 */
export function createRepositories(
  env: Env,
  store: MemoryUserStore,
): RepositorySet {
  if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
    const client = createSupabaseClient(env);
    return {
      posts: new SupabasePostRepository(client),
      users: new SupabaseUserRepository(client),
    };
  }
  return {
    posts: new InMemoryPostRepository(store),
    users: new InMemoryUserRepository(store),
  };
}
