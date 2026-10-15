/**
 * Montaje de la API de Red FaCyT (Hono) dentro del propio Next.js.
 *
 * Objetivo: **un único despliegue** en Vercel (plan gratis) — la web y la API
 * comparten dominio, de modo que las cookies de sesión son *first-party*, no
 * hay CORS cross-origin ni un segundo hosting (Railway/Render) que se duerma.
 *
 * El código de la API vive en `apps/api/` (se sigue ejecutando y testando igual
 * con `tsx`/Vitest en desarrollo); aquí solo se monta su `app.fetch` —que ya es
 * estándar Web `Request`/`Response`— como Route Handler.
 *
 * - `runtime = "nodejs"`: requerido por el Scrypt de Better Auth (`node:crypto`).
 * - `dynamic = "force-dynamic"`: la API no se prerenderiza.
 *
 * Variables de entorno requeridas en producción (`apps/api/src/config/env.ts`):
 * `CORS_ORIGINS`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (+ `RATE_LIMIT_*`).
 * `DATABASE_URL` (Supabase) activa los adaptadores PostgreSQL; sin ella se usa
 * el store en memoria (solo válido para demo/desarrollo).
 */
import { createApp } from "../../../../../apps/api/src/app";
import { parseEnv } from "../../../../../apps/api/src/config/env";
import { MemoryUserStore } from "../../../../../apps/api/src/infrastructure/repositories/in-memory/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiApp = ReturnType<typeof createApp>;

/** Instancia única por proceso (reutilizada entre peticiones del mismo worker). */
let cachedApp: ApiApp | null = null;

/**
 * Construye (una sola vez) la app Hono con el entorno del proceso.
 *
 * @returns La instancia de la API lista para atender peticiones.
 */
function getApiApp(): ApiApp {
  if (!cachedApp) {
    cachedApp = createApp({
      env: parseEnv(process.env),
      store: new MemoryUserStore(),
    });
  }
  return cachedApp;
}

/** Delegan en `app.fetch`; una por método HTTP. */
export function GET(request: Request): Response | Promise<Response> {
  return getApiApp().fetch(request);
}
export function POST(request: Request): Response | Promise<Response> {
  return getApiApp().fetch(request);
}
export function PATCH(request: Request): Response | Promise<Response> {
  return getApiApp().fetch(request);
}
export function PUT(request: Request): Response | Promise<Response> {
  return getApiApp().fetch(request);
}
export function DELETE(request: Request): Response | Promise<Response> {
  return getApiApp().fetch(request);
}
export function OPTIONS(request: Request): Response | Promise<Response> {
  return getApiApp().fetch(request);
}
