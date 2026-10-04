# Arquitectura de la API — Red FaCyT (`apps/api`)

Guía de implementación del scaffold inicial de la API de Red FaCyT como aplicación separada del monorepo pnpm (`apps/api`). Define la **estructura objetivo** y las decisiones de stack para que el `developer` implemente el scaffold sin ambigüedad y para que la API crezca hacia Better Auth + PostgreSQL + repositorios hexagonales **sin rework**.

> **Estado**: documento de diseño (fase de diseño, agente `security-architect`). El estado real de implementación vive en `docs/architecture/progress.md` (dinámico). Este documento NO es inmutable como `frontend-structure.md`, pero solo cambia por revisión de arquitectura.

Referencias obligatorias:

- [`../security/crown-jewels.md`](../security/crown-jewels.md) — joyas de la corona (P0/P1/P2) y controles obligatorios.
- [`../security/threat-model-api.md`](../security/threat-model-api.md) — modelo de amenaza de la superficie API (emitido junto a este documento).
- [`frontend-structure.md`](frontend-structure.md) — arquitectura frontend (inmutable): el contrato que la API debe cumplir.
- [`../design/auth.md`](../design/auth.md) §11.2 — contrato de seguridad de la transición al backend.
- [`../../src/lib/repositories/post-repository.ts`](../../src/lib/repositories/post-repository.ts) — interfaces hexagonales `PostRepository` / `UserRepository`.
- [`../../src/lib/types.ts`](../../src/lib/types.ts) — tipos compartidos `Post`, `PostFilters`, `Session`, `User`, `AuthorOption`, etc.
- [`../implementation/implementation_base.md`](../implementation/implementation_base.md) — alcance MVP.

---

## 1. Propósito y alcance del scaffold

El objetivo de este entregable es crear la **estructura inicial** de la API en `apps/api`, lista para crecer hacia auth, base de datos y endpoints de negocio **sin rework**. El scaffold **no** implementa:

- Endpoints de negocio (feed, publicaciones, perfiles, admin).
- Conexión a PostgreSQL.
- Better Auth / sesiones reales.
- CORS *abierto* ni headers sin política definida.

Sí crea la **base verificable**: patrón `createApp`, configuración de entorno tipada y estricta, middleware de seguridad (CORS whitelist, security headers, body limit, error handler sin fuga, 404 JSON), endpoint de salud (`GET /api/v1/health`), puertos hexagonales espejo del contrato frontend y configuración Vitest/tsconfig con umbral ≥ 80%.

Regla de idioma del equipo: **código en inglés** (identificadores, archivos), **documentación/comentarios en español**.

---

## 2. Stack y decisiones (justificadas)

| Decisión | Elección | Justificación |
| --- | --- | --- |
| Framework | **Hono 4** | Minimalista, TypeScript nativo, middleware-first, ecosistema de seguridad oficial (`@hono/secure-headers`, `hono/body-limit`, `hono/cors`), y factoría `Hono` pura que se testea sin abrir puertos (`app.request()`). Decisiones ya tomadas por el equipo, se documentan. |
| Servidor HTTP | **`@hono/node-server`** | Adapter estándar de Node para Hono. Solo se importa en el bootstrap (`src/index.ts` / `server.ts`), nunca en `app.ts`, para que `createApp` siga siendo puro y testable. |
| Lenguaje | **TypeScript 5** (strict) | Mismo estándar que el web. El contrato frontend está tipado; el backend debe verificar los mismos tipos en servidor. |
| Validación de entorno y de request | **`zod`** | Estándar del ecosistema Hono (`@hono/zod-validator`). La validación de entorno (env) es estricta y *fail-fast*; la de request llega con los endpoints. |
| Seguridad de cabeceras | **`@hono/secure-headers`** | Middleware oficial de Hono (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`). Evita implementación casera. |
| Rate limiting | **`hono-rate-limiter`** (MemoryStore) | Cuando llegue auth. En el scaffold se define el **slot** (middleware + claves de env), sin lógica de negocio. Un store en memoria es suficiente para el MVP; se puede migrar a Redis sin cambiar el middleware. |
| Logging | **`pino` + `pino-http`** | Logging estructurado, sin PII ni credenciales (requisito P2 de `crown-jewels.md`). |
| Dev / build | **`tsx watch`** (dev), **`tsup`** (build ESM) | `tsx` ejecuta TS en Node sin build; `tsup` produce un bundle ESM limpio para producción. Alternativa al `next build` del web. |
| Tests | **Vitest 5** (entorno `node`) + `@vitest/coverage-v8` | Mismo runner y umbral que el web (≥ 80% líneas, funciones, ramas, sentencias). Entorno `node`, no `jsdom`. |
| Lint | **ESLint 9** (flat config, `typescript-eslint`) | Mismo major que el web; config independiente del web (el web usa `eslint-config-next`, que no aplica a Node). |

**Dependencias mínimas del scaffold** (dev): `typescript`, `vitest`, `@vitest/coverage-v8`, `tsx`, `tsup`, `eslint`, `typescript-eslint`, `@types/node`. (runtime): `hono`, `@hono/node-server`, `@hono/secure-headers`, `zod`, `pino`, `pino-http`. Versiones a fijar por el `developer` con las compatibles a Hono 4 y Vitest 5.

---

## 3. Estructura de carpetas objetivo de `apps/api`

```
apps/api/
├── package.json                 → name: "@red-facyt/api", type: "module", scripts (ver §8)
├── tsconfig.json                → strict, sin emit (typecheck); build vía tsup
├── vitest.config.mts            → entorno node, umbral ≥ 80%, exclude de tests
├── eslint.config.mjs            → flat config con typescript-eslint
├── .env.example                 → claves sin valores reales (NUNCA secretos)
└── src/
    ├── index.ts                 → bootstrap: parseEnv + serve(@hono/node-server)   [scaffold]
    ├── server.ts                → createServer(): arranca app y escucha              [scaffold]
    ├── app.ts                   → createApp(options): devuelve Hono (puro, testable) [scaffold]
    ├── app.test.ts              → smoke: /health 200, 404 JSON, headers, CORS        [scaffold]
    ├── config/
    │   ├── env.ts               → parseEnv() con zod, fail-fast                      [scaffold]
    │   └── env.test.ts          → valida defaults y fallos                            [scaffold]
    ├── middleware/              → middleware reutilizable de seguridad
    │   ├── security-headers.ts  → @hono/secure-headers (CSP, HSTS, nosniff, RP)      [scaffold]
    │   ├── cors.ts              → whitelist estricta desde env (sin reflejo)         [scaffold]
    │   ├── body-limit.ts        → límite global de cuerpo JSON                       [scaffold]
    │   ├── error-handler.ts     → onError → JSON genérico sin stack (prod)          [scaffold]
    │   ├── not-found.ts         → 404 JSON                                          [scaffold]
    │   ├── request-id.ts        → x-request-id para trazabilidad segura              [scaffold]
    │   └── rate-limit.ts        → slot para hono-rate-limiter (config por ruta)      [esqueleto]
    ├── domain/                  → puertos hexagonales (espejo del contrato frontend)
    │   ├── post.ts              → Post, PostFilters, PostPage, PageOptions, PostRepository [esqueleto]
    │   ├── user.ts              → User, UserRole, AuthorOption, UserRepository       [esqueleto]
    │   └── session.ts           → Session                                            [esqueleto]
    ├── application/             → casos de uso / servicios (inyectan puertos)        [futuro]
    │   └── auth/                → signIn/signUp/getSession/signOut (Better Auth)     [futuro]
    └── infrastructure/          → adaptadores de los puertos
        ├── repositories/
        │   ├── in-memory/       → InMemoryPostRepository / InMemoryUserRepository    [futuro: contract tests]
        │   └── postgres/        → PostgresPostRepository / PostgresUserRepository    [futuro]
        └── auth/                → adapter Better Auth → Hono                         [futuro]
```

**Leyenda:** `[scaffold]` = se crea en esta tarea · `[esqueleto]` = se crea la interfaz/port vacío o el slot (sin lógica de negocio) · `[futuro]` = llega con auth/DB/endpoints.

Convenciones (mismas del web, `frontend-structure.md` §2):

- **Colocation de tests**: `module.ts` → `module.test.ts` en la misma carpeta.
- **JSDoc** obligatorio en toda función/método público.
- **Código en inglés** (identificadores, nombres de archivo); **comentarios y doc en español**.
- **Interfaces hexagonales en `domain/`**: espejo fiel de `src/lib/repositories/` y `src/lib/types.ts` (ver §6). La API *implementa* estos puertos; el frontend no cambia.

---

## 4. Entry point y patrón `createApp` (testabilidad)

La clave de testabilidad: **`createApp` es una función pura que devuelve una instancia `Hono`**; solo el bootstrap abre el puerto. Los tests llaman `app.request(path, init)` sin servidor.

### 4.1 `src/app.ts`

```ts
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { Env } from "./config/env";
import { securityHeaders } from "./middleware/security-headers";
import { corsWhitelist } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { requestId } from "./middleware/request-id";
import { rateLimitSkeleton } from "./middleware/rate-limit";

/** Opciones de creación de la app: entorno tipado + (a futuro) puertos. */
export type AppOptions = {
  env: Env;
  // A futuro, sin romper la firma:
  // postRepository?: PostRepository;
  // userRepository?: UserRepository;
  // authHandler?: Hono;            // adapter de Better Auth
};

/** Crea la app Hono con el pipeline de seguridad del scaffold. */
export function createApp(options: AppOptions): Hono {
  const app = new Hono();
  const { env } = options;

  app.use("*", requestId());
  app.use("*", securityHeaders());
  app.use("*", corsWhitelist(env.CORS_ORIGINS));
  app.use("*", bodyLimit({ maxSize: env.MAX_BODY_BYTES, onError: () => new Response("Body too large", { status: 413 }) }));
  app.use("*", rateLimitSkeleton(env)); // P0 cuando llegue auth; hoy define el slot

  app.get("/api/v1/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

  app.notFound(notFound);
  app.onError(errorHandler);
  return app;
}
```

> **Comentario sobre el ejemplo**: es una ilustración del contrato de firma, no código final; el `developer` implementa en TDD (test primero) y ajusta detalles. El punto de arquitectura es que los middlewares de seguridad se aplican **antes** de las rutas y que `createApp` no conoce el servidor.

### 4.2 `src/server.ts` (arranque, separado de la app)

```ts
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { parseEnv } from "./config/env";

/** Arranca el servidor HTTP. Usado solo por index.ts (no por los tests). */
export function createServer(envSource: NodeJS.ProcessEnv) {
  const env = parseEnv(envSource); // fail-fast si falta una variable requerida
  const app = createApp({ env });
  return serve({ fetch: app.fetch, port: env.PORT, hostname: env.HOST });
}
```

### 4.3 `src/index.ts`

```ts
import { createServer } from "./server";

createServer(process.env);
```

El scaffold puede incluir un handler de apagado limpio (`SIGTERM`/`SIGINT`) que cierre el server — se documenta como mejora P2.

### 4.4 Testabilidad (verificación)

- Los tests construyen `createApp({ env: testEnv })` con un env de prueba y llaman `app.request("/api/v1/health")` → 200.
- `app.test.ts` verifica además: 404 JSON, cabeceras de seguridad presentes, CORS con `Origin` permitido y denegado, `413` con cuerpo excesivo, y que los errores no filtran stack.
- `@hono/node-server` **no** se importa en `app.ts` (solo en `server.ts`/`index.ts`), de modo que los tests nunca abren puertos.

---

## 5. Configuración de entorno (env) y secretos

`src/config/env.ts` parsea `process.env` con `zod`. Reglas (alineadas con `crown-jewels.md` P1 secretos):

- **Fail-fast**: si falta una variable requerida (p. ej. `CORS_ORIGINS` en `NODE_ENV=production`), `parseEnv` lanza error y el proceso no arranca. Nunca defaults silenciosos para secretos.
- **`.env.example`** con claves y comentarios, **sin valores reales**. `.gitignore` raíz ya ignora `.env*` salvo `.env.example` (verificado).
- **Sin secretos en el scaffold** (no hay DB ni auth aún), pero el esquema ya reserva las claves futuras (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) como `optional` hasta que existan, para que el contrato de config no cambie.

Claves del scaffold:

| Clave | Tipo | Default | Requerida | Nota |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | `development \| production \| test` | `development` | no | Cambia el comportamiento del error handler (stack solo en dev). |
| `PORT` | number | `3001` | no | El web vive en 3000; la API en 3001. |
| `HOST` | string | `0.0.0.0` | no | |
| `CORS_ORIGINS` | string (CSV) | `http://localhost:3000` | **sí en production** | Whitelist estricta, sin reflejo de `Origin`. |
| `MAX_BODY_BYTES` | number | `102_400` (100 KB) | no | Límite global; rutas con multipart (uploads) lo ajustarán. |
| `LOG_LEVEL` | string | `info` | no | Para `pino`. |

Futuras (cuando existan): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.

---

## 6. Contrato hexagonal con el frontend (sin rework)

La API debe cumplir a futuro las interfaces de `src/lib/repositories/post-repository.ts` y los tipos de `src/lib/types.ts`. Como el frontend es una app Next.js en la raíz y la API es otro workspace (`apps/*`), **no comparten import de TypeScript**; el contrato se materializa en dos planos:

1. **Puertos espejo** en `apps/api/src/domain/*` con las mismas firmas (`findVisible(filters, page, session): Promise<PostPage>`, `findById(id): Promise<Post | null>`, `listAuthors(): Promise<AuthorOption[]>`), en inglés. Los adaptadores (`infrastructure/repositories/postgres/`) los implementan; los *use cases* (`application/`) los inyectan.
2. **Formato wire (JSON)** documentado aquí como **fuente de verdad** del intercambio. Ambos lados (frontend web y API) mapean hacia/desde este JSON. `frontend-structure.md` es inmutable y no se toca: es el frontend quien ya consume estas formas.

Formas wire (deben coincidir 1:1 con `src/lib/types.ts`):

- `Post`: `{ id, title, content, authorId, category, type, visibility, publishedAt, createdAt, updatedAt, imageUrl }`.
- `PostPage`: `{ items: Post[], total: number }` (de `post-repository.ts`).
- `AuthorOption`: `{ id, username, fullName }`.
- `Session`: `{ user: { id, username, role }, expiresAt }`.
- `User`: `{ id, username, email, givenName, familyName, role, createdAt }`.

**Cómo se garantiza sin rework** (verificación):

- Contract tests del API (cuando existan endpoints): fixtures con las mismas formas que `src/data/*` y asserts sobre el JSON devuelto.
- Los filtros del feed (`PostFilters`) se transmiten como query params normalizados igual que el frontend (`keyword`, `category`, `type`, `authorId`, `status`, `dateFrom`, `dateTo`) con paginación `limit`/`offset` (el frontend usa `limit` creciente + `offset 0` para "Cargar más"; la API debe aceptar ese patrón).
- Cualquier desvío de contrato se registra en `progress.md` (como ya ocurrió con `findAll→findVisible`).

---

## 7. Mapa de endpoints futuros (coherente con el contrato frontend)

Prefijo de versión **`/api/v1`**. La versión protege el contrato del frontend cuando la API evolucione.

| Contrato frontend (método) | Ruta API | Método | Acceso | Request | Respuesta |
| --- | --- | --- | --- | --- | --- |
| `authGateway.signIn(username, password)` | `/api/v1/auth/login` | POST | público | `{ username, password }` | `Session` + cookie `httpOnly; Secure; SameSite` |
| `authGateway.signUp(givenName, familyName, email, password)` | `/api/v1/auth/register` | POST | público | `{ givenName, familyName, email, password }` | `Session` + cookie |
| `authGateway.getSession()` | `/api/v1/auth/session` | GET | sesión (cookie) | — | `Session` o 401 |
| `authGateway.signOut()` | `/api/v1/auth/logout` | POST | sesión | — | 204 (invalida cookie) |
| `postRepo.findVisible(filters, page, session)` | `/api/v1/posts` | GET | sesión | query: `keyword, category, type, authorId, status, dateFrom, dateTo, limit, offset` | `PostPage` |
| `postRepo.findById(id)` | `/api/v1/posts/:id` | GET | sesión | — | `Post` o 404 |
| crear publicación (futuro) | `/api/v1/posts` | POST | sesión | `PostDraft` (sin `authorId`: lo toma de la sesión) | `Post` (201) |
| editar publicación | `/api/v1/posts/:id` | PATCH | autor/admin | `PostDraft` parcial | `Post` |
| eliminar publicación | `/api/v1/posts/:id` | DELETE | autor/admin | — | 204 |
| `userRepo.listAuthors()` | `/api/v1/users/authors` | GET | sesión | — | `AuthorOption[]` |
| perfil `/profile/[username]` | `/api/v1/users/:username` | GET | sesión | — | `User` (público limitado) + sus `Post[]` visibles |
| admin: asignar rol | `/api/v1/admin/users/:id/role` | PATCH | solo `admin` | `{ role }` | 204 |
| subida de imagen (futuro) | `/api/v1/uploads` | POST | sesión | multipart | `{ imageUrl }` |

Restricciones transversales del mapa (requisitos de `threat-model-api.md`, verificación en ese documento):

- **Enforcement server-side** por rol/propietario en cada ruta (joya P0 acceso) — nunca confiar en el rol del cliente.
- Los endpoints de auth (`login`/`register`) llevan **rate limiting** (joya P0 credenciales).
- Toda ruta valida entrada con `zod` (joya P1 API); el cliente no es control de acceso, solo UX (`auth.md` §11.2).
- Errores JSON sin fuga (`error-handler`), 404 JSON, límite de cuerpo global.

---

## 8. Configuración Vitest / tsconfig (bloques de referencia)

### 8.1 `apps/api/tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "vitest.config.mts", "eslint.config.mjs"]
}
```

> `noEmit: true`: el typecheck lo hace `tsc --noEmit`; el build lo hace `tsup` (ESM). Se evita el problema de extensiones de `NodeNext` en imports.

### 8.2 `apps/api/vitest.config.mts`

```ts
import { defineConfig } from "vitest/config";

/** Config de Vitest de la API: entorno node, cobertura >= 80% (gate Husky). */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      reporter: ["text", "html", "lcov"],
    },
  },
});
```

### 8.3 `apps/api/package.json` (scripts)

```jsonc
{
  "name": "@red-facyt/api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm --dts --clean",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint --max-warnings 0 .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

> **Dependencia/bloqueo para el `developer`**: el web en la raíz usa `pnpm lint` / `pnpm test:coverage` en el hook Husky (`docs/husky.md`). Con la API como segundo workspace hay que decidir si el gate de Husky pasa a cubrir ambos (p. ej. `pnpm -r lint` + `pnpm -r test:coverage`, o scripts raíz `lint:all`/`test:all`). Esta es una coordinación con `devops`/`product-manager`, no una decisión de este documento; el scaffold de la API debe exponer `lint`/`test`/`test:coverage` como contrato para que el hook se pueda ampliar sin tocar la API.

---

## 9. Definición de hecho (Definition of Done) del scaffold

El `developer` marca el scaffold como terminado cuando, verificablemente:

1. `pnpm --filter @red-facyt/api test:coverage` pasa con **≥ 80%** en líneas, funciones, ramas y sentencias.
2. `pnpm --filter @red-facyt/api typecheck` y `lint` pasan sin errores ni warnings.
3. `GET /api/v1/health` responde `{ status: "ok", ... }` con la API arrancada (`pnpm --filter @red-facyt/api dev`).
4. `app.test.ts` verifica: 404 JSON, cabeceras de seguridad, CORS whitelist (permitido/denegado), `413` en cuerpo excesivo y ausencia de stack en errores.
5. `.env.example` existe sin secretos reales; `parseEnv` falla rápido con env inválido (test de `env.test.ts`).
6. Los puertos de `src/domain/*` existen con las firmas de `src/lib/repositories/post-repository.ts` y `src/lib/types.ts` (JSDoc incluido).
7. `docs/architecture/progress.md` y el Kanban reflejan el estado (lo actualiza el `developer`/documentación, no este agente).

---

## 10. Referencias cruzadas

- Modelo de amenaza y requisitos P0/P1 del scaffold: `docs/security/threat-model-api.md`.
- Contrato de transición de auth al backend: `docs/design/auth.md` §11.2.
- Puertos hexagonales a cumplir: `src/lib/repositories/post-repository.ts`.
- Joyas de la corona: `docs/security/crown-jewels.md`.