# Modelo de Amenaza — API Red FaCyT

Documento de seguridad (agente `security-architect`) sobre la **superficie de la API inicial** (`apps/api`, Hono 4). Cubre el scaffold (endpoint de salud + middleware) y las superficies que llegarán con auth, base de datos y endpoints de negocio. Define requisitos de seguridad **P0/P1** concretos y **cómo se comprobará cada uno**.

> Este documento es la contrapartida de `docs/architecture/api-structure.md`. La prioridad de todo requisito sigue a `docs/security/crown-jewels.md`.

---

## 1. Alcance y supuestos

- **En alcance**: la superficie HTTP expuesta por `apps/api` (entry point `@hono/node-server`, pipeline de middleware, config/env, endpoint `GET /api/v1/health`) y las superficies futuras planificadas (auth Better Auth, PostgreSQL, CRUD de publicaciones, admin, uploads).
- **Fuera de alcance de este documento**: la superficie del frontend Next.js (protegida en su propia fase) y el modelo de datos PostgreSQL en sí (lo tratará `security-reviewer` con RLS/policies cuando exista, `crown-jewels.md` §P0-BD).
- **Supuesto**: la API se despliega detrás de un reverse proxy (Caddy/Nginx) que termina TLS; HSTS se emite por la API, la terminación TLS es del proxy. El CORS whitelist es estricto porque el navegador es el único cliente confiable de origen cruzado.

---

## 2. Actores

| Actor | Motivación | Superficie API principal |
| --- | --- | --- |
| Atacante externo (Internet) | Escaneo, DoS, fuga de datos, abuso de endpoints | `/health`, cualquier ruta no autenticada, abuso de cuerpo/headers |
| Usuario autenticado malicioso | IDOR, escalada de rol, manipulación de publicaciones ajenas | CRUD de posts, `/users/:username`, `/admin/*` |
| Bots / scripts | Fuerza bruta en login, spam de registro, scraping del feed | `/auth/*`, `/posts` |
| Insider (admin comprometido) | Exfiltración, manipulación de contenidos, escalada a otros admins | `/admin/*`, `/users/*` |
| Proveedor de dependencias | Supply chain (dependencia maliciosa) | `package.json`/lockfile de `apps/api` |

---

## 3. Superficies de ataque

| # | Superficie | Estado | Descripción |
| --- | --- | --- | --- |
| S1 | Entry point HTTP (`@hono/node-server`) | scaffold | Acepta cualquier request TCP/HTTP; primer punto de control de headers, cuerpo y método. |
| S2 | Pipeline de middleware | scaffold | Orden y correctitud de: request-id, security headers, CORS whitelist, body limit, rate limit, error handler, 404. |
| S3 | `GET /api/v1/health` | scaffold | Único endpoint. No debe filtrar env, stack ni datos. |
| S4 | Config/env (`parseEnv`) | scaffold | Manipulación del entorno (variables ausentes/maliciosas) y fuga de secretos en logs. |
| S5 | Auth (`/auth/*`) | futuro (Better Auth) | Login, registro, sesión, logout. Joya P0 credenciales/sesiones. |
| S6 | Posts (`/posts*`) | futuro | CRUD con visibilidad (publicado/borrador/oculto) y propiedad. Joya P0 publicaciones. |
| S7 | Usuarios (`/users/:username`, `/users/authors`) | futuro | Exposición de datos de perfil; enumeración. |
| S8 | Admin (`/admin/*`) | futuro | Asignación de roles; joya P0 acceso. |
| S9 | Uploads (`/uploads`) | futuro | Multipart; DoS por tamaño y fuga de archivos. |
| S10 | Dependencias | scaffold+futuro | Supply chain (Hono, node-server, secure-headers, pino, zod, etc.). |

---

## 4. Impacto sobre las joyas de la corona (`crown-jewels.md`)

Tabla que traza cada superficie API a las joyas P0/P1/P2 que comprometería un ataque exitoso.

| Superficie | Joya afectada | Escenario de ataque | Severidad si se concreta |
| --- | --- | --- | --- |
| S2 (CORS) | P1 API | Origin reflejado → script externo lee respuestas autenticadas (robo de sesión/datos) | 🔴 Crítico (toca P0 sesión) |
| S2 (error handler) | P1 API / P2 hardening | Stack trace o detalle interno en respuesta → fuga de rutas, libs, DB | 🟡 Advertencia |
| S2 (body limit) | P1 API | Cuerpo gigante en `/health` u otro endpoint → DoS / saturación de memoria | 🟡 Advertencia |
| S3 (health) | P1 secretos | Health que refleje env/versiones → ayuda a fingerprinting | 🔵 Sugerencia (P2) |
| S4 (env) | P1 secretos | Variable requerida con default silencioso o secreto en log → credenciales filtradas | 🔴 Crítico |
| S5 (auth) | P0 credenciales/sesiones | Fuerza bruta, enumeración de usuarios, session fixation, cookies inseguras | 🔴 Crítico |
| S6 (posts) | P0 publicaciones + P0 acceso | IDOR horizontal (editar post ajeno), ver `borrador`/`oculto` ajeno, falta de validación | 🔴 Crítico |
| S8 (admin) | P0 acceso | Usuario no-admin llama a `/admin/*`, escalada de rol | 🔴 Crítico |
| S9 (uploads) | P1 API | Multipart sin límite → DoS; path traversal en archivo | 🟡 Advertencia |
| S10 (deps) | P1 secretos (config) | Dependencia comprometida en runtime | 🟡 Advertencia |
| S5 (auth) / S6 (posts) | P2 disponibilidad | Sin rate limit → saturación de login o de creación | 🟡 Advertencia |

---

## 5. Requisitos de seguridad mínimos

Cada requisito indica su prioridad (P0/P1/P2), cuándo aplica (**scaffold** ahora o **auth/DB/endpoints** después) y **cómo se comprobará**. Los requisitos P0/P1 son obligatorios; los P2 se implementan como hardening.

### R1 — CORS con whitelist estricta (P1 · scaffold · joya P1-API)

- Configurar `hono/cors` con lista de orígenes desde `CORS_ORIGINS` (env). **Sin reflejo del header `Origin`** y **sin** `Access-Control-Allow-Origin: *`. Rechazar `Origin: null`.
- **Cómo se comprobará** (test `cors.test.ts` en `app.test.ts`):
  - Request con `Origin: http://localhost:3000` (origen permitido) → respuesta con `Access-Control-Allow-Origin` = ese origen.
  - Request con `Origin: https://evil.example` (no permitido) → respuesta **sin** cabecera `Access-Control-Allow-Origin` (o 403 si se decide rechazo explícito).
  - Request con `Origin: null` → sin cabecera.
  - No existe `Access-Control-Allow-Origin: *` en ningún test ni en el código.

### R2 — Errores sin fuga de detalle interno (P1 · scaffold · joya P1-API + P2-hardening)

- `onError` central devuelve JSON genérico: `{ "error": "internal_error", "message": "Internal server error" }`.
- En `NODE_ENV=production` jamás se incluye `stack`, mensaje interno ni ruta del módulo. El detalle solo va al log del servidor (redactado, ver R9).
- **Cómo se comprobará**:
  - Test que fuerza un error 500 en un handler de prueba y assert de que el cuerpo NO contiene `at `, `Error:`, nombres de archivo (`src/`), ni `stack`.
  - Test que verifica que en `production` el cuerpo es exactamente el genérico y que en `development` puede incluir detalle (pero nunca credenciales).
  - Review estática: grep en `src/` de `c.json(` con valores internos y de `console.log` de requests.

### R3 — Límite de tamaño de cuerpo y profundidad (P1 · scaffold · joya P1-API)

- `hono/body-limit` global con `MAX_BODY_BYTES` (100 KB por defecto) devolviendo `413`.
- Profundidad JSON limitada (cuando llegue la validación de request): usar parser que rechace anidación excesiva (config de `zod`/`hono`); se documenta como requisito del paso auth/endpoints.
- **Cómo se comprobará**:
  - Test: `POST /api/v1/health` con cuerpo > `MAX_BODY_BYTES` → `413`.
  - Test de config: cambiar `MAX_BODY_BYTES` y verificar que el límite cambia.
  - (futuro) Test con JSON de profundidad > N → `400`/`413`.

### R4 — Cabeceras de seguridad (P2 · scaffold · joya P2-hardening)

- `@hono/secure-headers` con: `Content-Security-Policy` razonable para una API JSON (por defecto `default-src 'none'`, `frame-ancestors 'none'`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`. Sin `X-Powered-By` ni `Server` revelador.
- **Cómo se comprobará** (test `app.test.ts`): `GET /api/v1/health` debe incluir `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`; y NO debe incluir `X-Powered-By`.

### R5 — Secretos en env, nunca en repo ni logs (P1 · scaffold · joya P1-secretos)

- `parseEnv` con `zod`: fail-fast si falta variable **requerida** en `production`; sin defaults silenciosos para secretos.
- `.env.example` sin valores reales; `.gitignore` ya ignora `.env*` salvo `.env.example` (verificado).
- Cero secretos en código fuente, tests, ni `console.log`.
- **Cómo se comprobará**:
  - `env.test.ts`: env sin `CORS_ORIGINS` en `production` → `parseEnv` lanza; env válido → devuelve el objeto tipado.
  - Grep de `.env`/secretos: `rg -i "(password|secret|token|api[_-]?key)" apps/api/src apps/api/.env.example` no debe encontrar valores reales (solo nombres de claves).
  - Review: confirmar que `apps/api/.env` está en `.gitignore` (o se agrega) y que `apps/api/.env.example` está versionado.

### R6 — 404 y respuestas de error en JSON, sin leak (P1 · scaffold · joya P1-API)

- `notFound` devuelve `{ "error": "not_found", "message": "Not found" }` con `404`. Sin volcar la ruta solicitada ni el stack.
- **Cómo se comprobará** (test en `app.test.ts`): `GET /api/v1/nonexistent` → `404`, `Content-Type: application/json`, cuerpo sin datos de ruta interna.

### R7 — Rate limiting en auth (P0 · cuando llegue auth · joya P0-credenciales/sesiones)

- `hono-rate-limiter` (MemoryStore) sobre `/auth/login` y `/auth/register`: límite por **IP** y, cuando haya sesión, por **usuario**. Backoff exponencial y bloqueo tras N intentos fallidos (`auth.md` §11.2).
- En el scaffold se crea el **slot** (`middleware/rate-limit.ts` + claves de env `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW_MS`) sin lógica de negocio.
- **Cómo se comprobará** (cuando exista auth):
  - Test: N+1 intentos fallidos consecutivos de login desde la misma IP → `429` y mensaje genérico (sin revelar si la cuenta existe).
  - Test: ventana expirada permite reintentar.
  - Test: `429` no distingue usuario existente/inexistente (anti-enumeración, joya P0).

### R8 — Validación estricta de entrada en servidor (P0 · cuando lleguen endpoints · joya P0-publicaciones + P1-API)

- Toda ruta valida con `zod`: tipos, longitudes, formatos (email/UUID), revalidando **en servidor** las reglas de `auth.md` §4 (username ≤ 50; contraseña 8–128 sin `trim`; email ≤ 254 normalizado a minúsculas; nombre/apellido 2–60). La validación del cliente es UX, nunca control de acceso (`auth.md` §11.2).
- `PostDraft` valida `title`, `content` (longitud máxima), `category`, `type`, `visibility`.
- **Cómo se comprobará**:
  - Test por cada regla: payload inválido → `400` con `{ "error": "validation_error", "message": ... }` y detalle de campo.
  - Test: payload válido límite (longitud máx.) → aceptado; payload sobre límite → `400`.
  - Review: `security-reviewer` comprueba que los validadores del servidor existen y no confían en el cliente.

### R9 — Logging seguro (P2 · scaffold y futuro · joya P2-hardening)

- `pino` con redacción de campos sensibles: nunca loguear contraseñas, tokens, cookies ni cuerpos de `/auth/*`. `request-id` (`x-request-id`) para correlacionar sin loguear datos.
- **Cómo se comprobará**:
  - Test del middleware de logging: body de login (con password) no aparece en la salida del logger (mock del transport).
  - Review: grep de `logger.info(` sobre requests → no pasa cuerpos ni headers de auth.
  - (futuro) Alertas de ráfagas de 401/403 en logs (`crown-jewels.md` §P2).

### R10 — Sesiones y cookies seguras (P0 · cuando llegue auth · joya P0-sesiones)

- Cookie de sesión: `httpOnly`, `Secure` (producción), `SameSite=Lax` (o `Strict`), `Path=/`, expiración; rotación de identificador en login (anti session fixation) e invalidación en logout (`auth.md` §11.2).
- **Cómo se comprobará** (cuando exista Better Auth):
  - Test/inspección de headers de respuesta de `/auth/login`: cookie con flags `HttpOnly` y `SameSite`; en `production` también `Secure`.
  - Test: `POST /auth/logout` invalida la sesión (siguiente `GET /auth/session` → 401).
  - Test: `set-cookie` nunca contiene la contraseña ni el email.

### R11 — Enforcement server-side por rol/propietario (P0 · cuando lleguen endpoints · joya P0-acceso)

- Cada ruta verifica sesión y, donde aplique, rol/propiedad **por petición** (nunca confiar en el rol del cliente). IDOR horizontal (autor) y vertical (admin) bloqueados. Reglas de visibilidad del feed (publicado/borrador/oculto) aplicadas en la query, como ya define `src/lib/visibility.ts`.
- **Cómo se comprobará** (futuro, contract tests + tests de ruta):
  - `PATCH /posts/:id` de un post ajeno con sesión de otro autor → `403` (o `404` para no revelar existencia).
  - `PATCH /admin/users/:id/role` con rol `estudiante` → `403`.
  - `GET /posts` con sesión X no devuelve `borrador`/`oculto` de otro autor (mismo contrato que `post-repository.contract.test.ts`).

---

## 6. Prioridad y cronograma de controles

| Requisito | Prioridad | Cuándo | Joya |
| --- | --- | --- | --- |
| R1 CORS whitelist | P1 | scaffold | P1 API |
| R2 Errores sin fuga | P1 | scaffold | P1 API |
| R3 Límite de cuerpo | P1 | scaffold | P1 API |
| R4 Cabeceras de seguridad | P2 | scaffold | P2 hardening |
| R5 Secretos en env | P1 | scaffold | P1 secretos |
| R6 404 JSON | P1 | scaffold | P1 API |
| R7 Rate limiting auth | P0 | con auth | P0 credenciales |
| R8 Validación estricta | P0 | con endpoints | P0 publicaciones |
| R9 Logging seguro | P2 | scaffold+futuro | P2 hardening |
| R10 Cookies seguras | P0 | con auth | P0 sesiones |
| R11 Enforcement por rol | P0 | con endpoints | P0 acceso |

---

## 7. Riesgos residuales y límites del modelo

- El **CORS** protege al navegador, no a clientes no-navegador: los endpoints autenticados deben validar sesión igualmente (R11).
- El **rate limiting en memoria** no escala a multi-instancia; aceptado para MVP, se migra a Redis en despliegue multi-replica (nota para `devops`).
- **Suply chain (S10)**: mantener lockfile de `apps/api` versionado, `pnpm` con `allowBuilds` restringido (ya configurado en `pnpm-workspace.yaml`) y `pnpm audit` en CI (coordinación con `devops`).
- La **terminación TLS** es responsabilidad del proxy; la API asume que llega HTTPS en producción (los flags `Secure` de cookies dependen de ello).

## 8. Cómo se verificará en las fases del pipeline

- **Implementación**: el `developer` implementa R1–R6 (scaffold) en TDD con los tests indicados en cada requisito.
- **Review**: `security-reviewer` y `qa-reviewer` validan cada requisito contra su "cómo se comprobará".
- **Testing**: `tester` documenta evidencia en `docs/tests/` (scaffold: health, CORS, 404, 413, headers, error sin stack).
- **Ofensiva/defensiva**: `red-team` auditará `apps/api` contra estas superficies; `blue-team` mitiga hallazgos. Hallazgos que toquen joyas P0 bloquean la integración (`crown-jewels.md` §5).