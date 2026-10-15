import { createClient } from "@supabase/supabase-js";
import type { Env } from "../../../config/env";

/**
 * Cliente de Supabase (`@supabase/supabase-js`).
 *
 * Se construye con la **secret key**, que da acceso total y **bypassa RLS**: por
 * eso SOLO se usa en el backend. El frontend nunca habla con Supabase.
 */
export type SupabaseClient = ReturnType<typeof createClient>;

/**
 * Crea el cliente de Supabase contra la Data API del proyecto.
 *
 * Sin `SUPABASE_URL` o `SUPABASE_SECRET_KEY` lanza (fail-fast): no hay defaults
 * silenciosos para credenciales. Se desactivan sesión/refresh en el cliente
 * porque el almacenamiento de sesión no es responsabilidad de este backend.
 *
 * @param env - Entorno tipado (lee `SUPABASE_URL` y `SUPABASE_SECRET_KEY`).
 * @returns Cliente de Supabase listo para consultar tablas.
 * @throws Error si falta la URL o la secret key.
 */
export function createSupabaseClient(env: Env): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error(
      "createSupabaseClient requires SUPABASE_URL and SUPABASE_SECRET_KEY",
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
