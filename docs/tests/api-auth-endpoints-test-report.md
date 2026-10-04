# Reporte de pruebas — Auth + Endpoints de la API (`apps/api`)

**Agente**: `tester` de Red FaCyT.
**Fase**: TESTING (evidencia en `docs/tests/`).
**Fecha de ejecución**: 2026-10-03 (hora local, UTC-4).
**Objeto de prueba**: entrega de **auth (Better Auth en memoria) + endpoints `/api/v1/*`** de `apps/api` (auth, posts/feed, usuarios, admin) + documentación **OpenAPI**, implementada y corregida post-review (16 archivos, 180 tests).

> Este reporte documenta la **ronda de verificación funcional y de seguridad** de la entrega, mapeada a la DoD §12 de `docs/architecture/api-structure.md` y a los requisitos **R7–R18** de `docs/security/threat-model-api.md`. El agente `tester` **no** modificó código de producción ni config; solo creó esta evidencia en `docs/tests/`. No se tocó `progress.md` (lo actualiza la fase de documentación).

---

## 1. Objeto de prueba y criterios de aceptación

| # | Criterio de aceptación | Origen | Verificación usada |
| --- | --- | --- | --- |
| CA-1 | Suite de tests de la entrega pasa con **≥ 80%** en líneas, funciones, ramas y sentencias | DoD §12.3(1) | `npx vitest run --coverage` |
| CA-2 | `typecheck` y `lint` pasan sin errores ni warnings | DoD §12.3(1) | `npx tsc --noEmit` y `npx eslint --max-warnings 0 .` |
| CA-3 | Todas las rutas de §9 responden según código y forma wire, con la matriz de enforcement de §12.2 | DoD §12.3(2) / R11 | Suite de rutas (`routes/*.test.ts`) + smoke real |
| CA-4 | El feed replica las **9 combinaciones** de `src/lib/visibility.ts` (contract test) | DoD §12.3(3) / R15 | `in-memory-post-repository.test.ts` |
| CA-5 | OpenAPI visible en dev y bloqueado en producción; **sin secretos** | DoD §12.3(4) / R17 | `openapi.test.ts` + grep del documento servido |
| CA-6 | Cookies `httpOnly`/`SameSite=Lax`/`Secure`(prod) verificadas; **CSRF** en todas las mutaciones | DoD §12.3(5) / R10, R13 | `auth.routes.test.ts`, `csrf.test.ts` + smoke real (headers) |
| CA-7 | Rate limiting en auth (login/register) por IP (y usuario) con `429` genérico | R7 / R12 / R13 | `auth.routes.test.ts` + smoke real con umbral reducido |
| CA-8 | Validación estricta en servidor (zod) por campo; revalida reglas de `auth.md` §4 | R8 | `validation.test.ts`, `auth.routes.test.ts` |
| CA-9 | Login con `401` **idéntico** para usuario inexistente y contraseña incorrecta | R13 | `auth.routes.test.ts` + smoke real (comparación de bodies) |
| CA-10 | Autorización con **rol fresco por petición** (R14): democión efectiva de inmediato | R14 | `admin.routes.test.ts` |
| CA-11 | Posts: enforcement propietario/admin + visibilidad (IDOR bloqueado, `publishedAt` inmutable) | R15 | `posts.routes.test.ts` |
| CA-12 | Admin: enforcement server-side por rol (`403` para no-admin) | R16 | `admin.routes.test.ts` |
| CA-13 | Perfiles y anti-enumeración: `404` genérico, email redactado ajeno, `/users/authors` sin `email`/`role` | R18 | `users.routes.test.ts` |
| CA-14 | **H1 (regresión)**: rutas nativas de Better Auth (`/sign-in/email`, `/sign-up/email`, …) NO montadas → `404` | DoD §12.2 / R12–R13 | `auth.routes.test.ts` + smoke real |
| CA-15 | **CSRF**: mutación con `Origin` permitido pero sin cookie `facy.csrf_token` → `403` | DoD §12.2 / R13 | `csrf.test.ts` + smoke real |
| CA-16 | Cabeceras de seguridad presentes y **sin `X-Powered-By`** en todas las respuestas | R4 (scaffold, regresión) | smoke real (grep de headers) |

---

## 2. Ejecución de suites de calidad (resultados reales)

Ejecutadas en `apps/api` con **binarios locales** (`npx`; `pnpm run` crashea en este Windows por el gate de `allowBuilds`). Fecha/hora: 2026-10-03 ~22:47 (UTC-4).

### 2.1 `npx vitest run --coverage`

```
 RUN  v5.0.1
      Coverage enabled with v8

 Test Files  16 passed (16)
      Tests  180 passed (180)
   Start at  22:47:56
   Duration  5.05s

File                     | % Stmts | % Branch | % Funcs | % Lines
-------------------------|---------|----------|---------|---------
All files                |   94.21 |    81.93 |    95.1  |   97.23
 application/auth        |   96.34 |       75 |     100 |   98.68
 application/posts       |   94.44 |    93.33 |     100 |     100
 src/config              |     100 |     87.5  |     100 |     100
 src/domain              |   95.12 |      100 |      60 |   97.29
 infrastructure/auth     |    87.7 |    72.47 |   80.76 |   91.66
 infrastructure/repos/in-memory | 97 |    96.49 |     100 |   97.77
 src/middleware          |    95.2 |    85.89 |   94.28 |   96.55
 src/routes              |   92.93 |    68.85 |     100 |   98.76

=============================== Coverage summary ===============================
Statements   : 94.21% ( 717/761 )
Branches     : 81.93% ( 331/404 )
Functions    : 95.1%  ( 175/184 )
Lines        : 97.23% ( 667/686 )
================================================================================
```

| Métrica | Resultado | Umbral | Estado |
| --- | --- | --- | --- |
| Statements | **94.21%** (717/761) | ≥ 80% | PASS |
| Branches | **81.93%** (331/404) | ≥ 80% | PASS |
| Functions | **95.1%** (175/184) | ≥ 80% | PASS |
| Lines | **97.23%** (667/686) | ≥ 80% | PASS |

**Archivos de test (16):** `app.test.ts` (17), `server.test.ts` (3), `config/env.test.ts` (13), `domain/validation.test.ts` (29), `middleware/csrf.test.ts` (7), `middleware/rate-limit.test.ts` (10), `routes/auth.routes.test.ts` (21), `routes/posts.routes.test.ts` (15), `routes/users.routes.test.ts` (5), `routes/admin.routes.test.ts` (7), `routes/openapi.test.ts` (6), `application/auth/register-user.test.ts` (5), `application/auth/sign-in.test.ts` (2), `infrastructure/repositories/in-memory/in-memory-post-repository.test.ts` (24), `infrastructure/repositories/in-memory/in-memory-user-repository.test.ts` (7), `infrastructure/auth/memory-auth-adapter.test.ts` (9). Total **180/180 PASS, 0 fallos**.

### 2.2 `npx tsc --noEmit`

```
(exit code 0 — sin errores ni warnings)
```

Typecheck estricto (strict, noEmit) **PASS**, 0 errores.

### 2.3 `npx eslint --max-warnings 0 .`

```
(exit code 0 — sin errores ni warnings)
```

Lint con `typescript-eslint` y `--max-warnings 0` **PASS**, 0 hallazgos.

---

## 3. Matriz de casos

Leyenda: **PASS** = resultado coincide con lo esperado · **FAIL** = hallazgo. Datos y pasos reproducibles.

### 3.1 Smoke real (API levantada con `npx tsx src/index.ts`, puerto 3001, `NODE_ENV=development`, defaults de `.env.example`)

| ID | Descripción | Pasos / Datos | Resultado esperado | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| SM-1 | Health 200 | `curl -i GET /api/v1/health` | 200, JSON `{"status":"ok","timestamp":ISO}` | `200`, body exacto; timestamp ISO 8601 | PASS |
| SM-2 | Register 201 con Session wire + cookie | GET previo para obtener cookie CSRF; `POST /api/v1/auth/register` con `{givenName:"Marina",familyName:"Torres",email:"marina.torres@example.com",password:"ContrasenaSegura1"}` + `Origin: http://localhost:3000` + `x-csrf-token` | 201, `Session` wire (`{user:{id,username,role},expiresAt}`) y `Set-Cookie` con `HttpOnly` y `SameSite=Lax` | `201`; body `{"user":{"id":"bNG7…","username":"marina.torres","role":"estudiante"},"expiresAt":"2026-10-05T02:50:59.730Z"}`; `set-cookie: better-auth.session_token=…; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax` | PASS |
| SM-3 | Session con cookie 200 | `GET /api/v1/auth/session` con cookie del register | 200 `Session` | `200`, `Session` wire con `role: estudiante` | PASS |
| SM-4 | Login 200 con cookie nueva | `POST /api/v1/auth/login` `{username:"marina.torres",password:"ContrasenaSegura1"}` + CSRF | 200 `Session` + `Set-Cookie` nueva | `200`; `Set-Cookie: better-auth.session_token=<otro valor>; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax` | PASS |
| SM-5 | Feed autenticado 200 PostPage | `GET /api/v1/posts` con cookie de login | 200 `PostPage` | `200`, `{"items":[],"total":0}` (store vacío, forma wire correcta) | PASS |
| SM-6 | OpenAPI dev 200 sin secretos | `GET /api/v1/openapi.json` | 200, solo formas wire, sin secretos ni env | `200`; documento OpenAPI 3.1 completo; grep del cuerpo servido: 0 menciones de `BETTER_AUTH_SECRET`, `RATE_LIMIT`, `DATABASE_URL`, `src/`, `dev-only` | PASS |
| SM-7 | Crear post 201 | `POST /api/v1/posts` autenticado con `{title,content,category:"noticias",type:"post",visibility:"publicado",imageUrl:null}` + CSRF | 201 `Post` con `authorId` de la sesión | `201`; `{"id":"e43804cc-26eb-4183-99e4-21e4449fed6f","title":"Publicacion de prueba smoke",…,"authorId":"bNG7VqOjUsME7inYQFKFnMsBQRI3zHGo",…}` (`authorId` = sesión, no del body) | PASS |
| SM-8 | H1 regresión: rutas nativas 404 | `POST /api/v1/auth/sign-in/email` y `POST /api/v1/auth/sign-up/email` con body arbitrario | **404** (no 200/401/422) | Ambos `404` con `{"error":"not_found","message":"Not found"}` | PASS |
| SM-9 | CSRF: mutación sin cookie `facy.csrf_token` | `POST /api/v1/auth/register` con `Origin: http://localhost:3000` (permitido) y `x-csrf-token: whatever` **sin** cookie CSRF | 403 | `403`, `{"error":"forbidden","message":"Token CSRF requerido"}` | PASS |
| SM-10 | Cabeceras de seguridad y sin `X-Powered-By` | grep de headers de `/health` | CSP, HSTS, nosniff, Referrer-Policy, etc.; 0 `x-powered-by`; 0 `server` | Todas presentes; `X-POWERED-BY_LINES=0`; `SERVER_HEADER_LINES=0` | PASS |
| SM-11 | `/users/authors` 200 sin email/rol | `GET /api/v1/users/authors` autenticado | 200 `AuthorOption[]` (`id,username,fullName`) | `200`, `[{"id":"bNG7…","username":"marina.torres","fullName":"Marina Torres"}]` (sin `email` ni `role`) | PASS |
| SM-12 | Perfil propio 200 con email | `GET /api/v1/users/marina.torres` autenticado | 200 `{user,posts}` con email completo (propio) | `200`; `user.email` completo + `posts[]` visibles del autor | PASS |
| SM-13 | Logout 204 y sesión posterior 401 | `POST /api/v1/auth/logout` (CSRF) y luego `GET /api/v1/auth/session` | 204; session posterior 401 | `204`; `GET /auth/session` posterior → `401` | PASS |
| SM-14 | 401 idéntico (R13) | login con contraseña incorrecta vs. usuario inexistente; comparación de bodies | Mismo `401` idéntico | Ambos `401`; `BODY_EQUAL=True`; body `{"error":"invalid_credentials","message":"El usuario o la contraseña no coinciden."}` | PASS |
| SM-15 | Rate limit real (R7/R13) | API arrancada con `RATE_LIMIT_MAX=3`; 4 logins fallidos consecutivos | `401,401,401,429` | `ATTEMPT 1→401`, `2→401`, `3→401`, `4→429` con `{"error":"rate_limited","message":"Demasiadas solicitudes. Intenta de nuevo más tarde."}` | PASS |

### 3.2 Suites unitarias (cobertura de requisitos y matriz de enforcement, ejecutadas en §2)

#### Auth (`src/routes/auth.routes.test.ts` — 21 tests)

| ID | Caso | Trazabilidad | Esperado | Real | Estado |
| --- | --- | --- | --- | --- | --- |
| UT-A1 | register 201 Session wire + cookies seguras | `auth.routes.test.ts:41` | 201 + cookie httpOnly/SameSite | Coincide | PASS |
| UT-A2 | 400 por cada regla inválida de `auth.md` §4 | `auth.routes.test.ts:60` | 400 + `details` por campo | Coincide | PASS |
| UT-A3 | 409 genérico idéntico para email duplicado | `auth.routes.test.ts:80` | 409 `account_conflict` | Coincide | PASS |
| UT-A4 | username derivado con sufijo numérico en colisión | `auth.routes.test.ts:91` | Username único | Coincide | PASS |
| UT-A5 | `role` en el body ignorado (nace `estudiante`) | `auth.routes.test.ts:106` | Usuario creado `estudiante` | Coincide | PASS |
| UT-A6 | 429 tras N+1 registros desde la misma IP | `auth.routes.test.ts:125` | 429 genérico | Coincide | PASS |
| UT-A7 | login OK 200 + cookie nueva | `auth.routes.test.ts:152` | 200 Session + cookie nueva | Coincide | PASS |
| UT-A8 | 401 idéntico para usuario inexistente y password incorrecta | `auth.routes.test.ts:174` | Mismo 401 | Coincide | PASS |
| UT-A9 | 429 tras N+1 fallos de login por IP | `auth.routes.test.ts:202` | 429 genérico | Coincide | PASS |
| UT-A10 | session: cookie válida 200, sin cookie 401 | `auth.routes.test.ts:234` | 200 / 401 | Coincide | PASS |
| UT-A11 | logout 204, expira cookie e invalida sesión | `auth.routes.test.ts:249` | 204; session posterior 401 | Coincide | PASS |
| UT-A12 | cookie firmada con otro secreto → 401 | `auth.routes.test.ts:269` | 401 | Coincide | PASS |
| UT-A13 | rutas nativas `sign-in/email`, `sign-up/email`, `sign-out`, `get-session` → 404 (H1) | `auth.routes.test.ts:288` | 404 | Coincide | PASS |
| UT-A14 | cliente con sesión válida no alcanza rutas nativas mutables | `auth.routes.test.ts:317` | 404 | Coincide | PASS |
| UT-A15 | username derivado >50 se recorta al contrato wire | `auth.routes.test.ts:342` | ≤50 chars | Coincide | PASS |
| UT-A16 | cookies `Secure` cuando `NODE_ENV=production` | `auth.routes.test.ts:359` | Secure presente | Coincide | PASS |
| UT-A17 | 401 para token de sesión expirado | `auth.routes.test.ts:371` | 401 | Coincide | PASS |
| UT-A18 | los logins exitosos NO consumen el límite | `auth.routes.test.ts:388` | Sin autobloqueo | Coincide | PASS |
| UT-A19 | mutación con Origin permitido sin `x-csrf-token` → 403 | `auth.routes.test.ts:409` | 403 | Coincide | PASS |
| UT-A20 | mutación con Origin fuera de whitelist → 403 | `auth.routes.test.ts:424` | 403 | Coincide | PASS |
| UT-A21 | token CSRF desajustado → 403 | `auth.routes.test.ts:440` | 403 | Coincide | PASS |

#### Feed y posts (`src/routes/posts.routes.test.ts` — 15 tests)

| ID | Caso | Trazabilidad | Esperado | Real | Estado |
| --- | --- | --- | --- | --- | --- |
| UT-P1 | requiere sesión (401 sin cookie) | `posts.routes.test.ts:56` | 401 | Coincide | PASS |
| UT-P2 | feed solo posts visibles, forma wire `PostPage` | `posts.routes.test.ts:62` | 200 PostPage | Coincide | PASS |
| UT-P3 | admin ve `oculto` pero NO borradores ajenos | `posts.routes.test.ts:82` | Visibilidad correcta | Coincide | PASS |
| UT-P4 | filtros y paginación por contrato | `posts.routes.test.ts:103` | Filtros wire correctos | Coincide | PASS |
| UT-P5 | query inválida → 400 | `posts.routes.test.ts:122` | 400 | Coincide | PASS |
| UT-P6 | borrador propio 200; borrador/oculto ajeno 404 | `posts.routes.test.ts:133` | 200 / 404 | Coincide | PASS |
| UT-P7 | creación 201 con `authorId` de la sesión y forma wire | `posts.routes.test.ts:169` | 201 Post | Coincide | PASS |
| UT-P8 | `authorId`/`role` inyectados en el body ignorados | `posts.routes.test.ts:194` | authorId = sesión | Coincide | PASS |
| UT-P9 | payload inválido → 400 | `posts.routes.test.ts:218` | 400 + detalle | Coincide | PASS |
| UT-P10 | mutación sin `x-csrf-token` → 403 | `posts.routes.test.ts:233` | 403 | Coincide | PASS |
| UT-P11 | mutación sin cookie CSRF aunque haya sesión → 403 (H3) | `posts.routes.test.ts:253` | 403 | Coincide | PASS |
| UT-P12 | post ajeno → 403; propio → 200/204; admin → 200/204 | `posts.routes.test.ts:297` | 403/200/204 | Coincide | PASS |
| UT-P13 | `publishedAt` inmutable en PATCH; se fija solo en `borrador→publicado` | `posts.routes.test.ts:360` | Inmutable | Coincide | PASS |
| UT-P14 | autor no-admin no puede fijar `oculto` vía PATCH | `posts.routes.test.ts:396` | 403 | Coincide | PASS |
| UT-P15 | id de post inexistente → 404 | `posts.routes.test.ts:411` | 404 | Coincide | PASS |

#### Usuarios (`src/routes/users.routes.test.ts` — 5 tests) y Admin (`src/routes/admin.routes.test.ts` — 7 tests)

| ID | Caso | Trazabilidad | Esperado | Real | Estado |
| --- | --- | --- | --- | --- | --- |
| UT-U1 | requiere sesión | `users.routes.test.ts:28` | 401 | Coincide | PASS |
| UT-U2 | solo autores con publicaciones; sin `email`/`role` | `users.routes.test.ts:33` | AuthorOption[] | Coincide | PASS |
| UT-U3 | username inexistente → 404 (anti-enumeración) | `users.routes.test.ts:59` | 404 genérico | Coincide | PASS |
| UT-U4 | email ajeno redactado a `""` | `users.routes.test.ts:68` | `email === ""` | Coincide | PASS |
| UT-U5 | email completo para propio y admin | `users.routes.test.ts:89` | email completo | Coincide | PASS |
| UT-AD1 | `estudiante`/`profesor` a `/admin/*` → 403 | `admin.routes.test.ts:26` | 403 | Coincide | PASS |
| UT-AD2 | admin cambia rol → 204 e inmediatez (R14) | `admin.routes.test.ts:48` | 204; rol efectivo | Coincide | PASS |
| UT-AD3 | democión de admin efectiva de inmediato (rol fresco) | `admin.routes.test.ts:80` | Pierde acceso al instante | Coincide | PASS |
| UT-AD4 | id de usuario inexistente → 404 | `admin.routes.test.ts:109` | 404 | Coincide | PASS |
| UT-AD5 | no-admin a moderación → 403; post desconocido → 404 | `admin.routes.test.ts:127` | 403/404 | Coincide | PASS |
| UT-AD6 | admin oculta/restaura y el feed lo refleja | `admin.routes.test.ts:142` | 200 + reflejo en feed | Coincide | PASS |
| UT-AD7 | id de post inexistente en moderación → 404 | `admin.routes.test.ts:192` | 404 | Coincide | PASS |

#### OpenAPI (`src/routes/openapi.test.ts` — 6 tests) y middleware

| ID | Caso | Trazabilidad | Esperado | Real | Estado |
| --- | --- | --- | --- | --- | --- |
| UT-O1 | dev: `openapi.json` con formas wire y sin secretos | `openapi.test.ts:5` | 200, sin secretos | Coincide | PASS |
| UT-O2 | dev: página `/docs` | `openapi.test.ts:29` | 200 HTML | Coincide | PASS |
| UT-O3 | production: `openapi.json` y `/docs` → 404 (R17) | `openapi.test.ts:37` | 404 | Coincide | PASS |
| UT-O4 | `OPENAPI_ENABLED=false` → 404 | `openapi.test.ts:46` | 404 | Coincide | PASS |
| UT-O5 | security de mutaciones = AND (sesión + csrf) | `openapi.test.ts:52` | Un solo requisito AND | Coincide | PASS |
| UT-O6 | la página `/docs` no expone el nombre del entorno | `openapi.test.ts:65` | Sin env | Coincide | PASS |
| UT-C1 | GET exento de CSRF | `csrf.test.ts:32` | OK | Coincide | PASS |
| UT-C2 | mutación con Origin+token válidos → OK | `csrf.test.ts:37` | OK | Coincide | PASS |
| UT-C3 | mutación sin Origin con cookie+header → OK | `csrf.test.ts:51` | OK | Coincide | PASS |
| UT-C4 | cookie pero sin header → 403 | `csrf.test.ts:64` | 403 | Coincide | PASS |
| UT-C5 | header desajustado → 403 | `csrf.test.ts:76` | 403 | Coincide | PASS |
| UT-C6 | sin cookie CSRF aunque haya header → 403 | `csrf.test.ts:89` | 403 | Coincide | PASS |
| UT-C7 | Origin fuera de whitelist → 403 | `csrf.test.ts:101` | 403 | Coincide | PASS |
| UT-RL1 | `check` permite hasta max y bloquea el siguiente | `rate-limit.test.ts:27` | Bloqueo correcto | Coincide | PASS |
| UT-RL2 | `record`+`isBlocked` bloquean solo al alcanzar max | `rate-limit.test.ts:35` | Bloqueo correcto | Coincide | PASS |
| UT-RL3 | clave solo `check` nunca se bloquea | `rate-limit.test.ts:45` | No bloquea | Coincide | PASS |
| UT-RL4 | poda de expirados (sin crecimiento sin límite) | `rate-limit.test.ts:52` | Poda | Coincide | PASS |
| UT-RL5 | identidad híbrida socket + hop XFF saneado | `rate-limit.test.ts:75` | Clave compuesta | Coincide | PASS |
| UT-RL6 | sin XFF usa socket solo | `rate-limit.test.ts:81` | Socket | Coincide | PASS |
| UT-RL7 | fallback al hop XFF saneado sin socket | `rate-limit.test.ts:85` | Hop saneado | Coincide | PASS |
| UT-RL8 | devuelve socket si no hay fuentes | `rate-limit.test.ts:91` | Socket | Coincide | PASS |
| UT-RL9 | `clientIp` lee y sanea `x-forwarded-for` | `rate-limit.test.ts:95` | Saneado | Coincide | PASS |

#### Aplicación y repositorios (contract tests + casos de uso)

| ID | Caso | Trazabilidad | Esperado | Real | Estado |
| --- | --- | --- | --- | --- | --- |
| UT-REG1 | normalización de username (minúsculas sin diacríticos, punto) | `register-user.test.ts:68` | Formato correcto | Coincide | PASS |
| UT-REG2 | candidatos de username ≤ 50 chars | `register-user.test.ts:77` | ≤50 | Coincide | PASS |
| UT-REG3 | señuelo de contraseña cuando el email existe (H5) | `register-user.test.ts:90` | Tiempo constante | Coincide | PASS |
| UT-REG4 | errores no-conflicto NO se envuelven como 409 | `register-user.test.ts:108` | Propagación | Coincide | PASS |
| UT-REG5 | 422 de Better Auth (duplicado) → `ConflictError` | `register-user.test.ts:119` | 409 | Coincide | PASS |
| UT-SI1 | señuelo asíncrono para usuario inexistente + 401 idéntico (H5) | `sign-in.test.ts:57` | 401 idéntico | Coincide | PASS |
| UT-SI2 | error subyacente logueado, wire 401 | `sign-in.test.ts:73` | Sin fuga | Coincide | PASS |
| UT-REPO-P | **9 combinaciones de visibilidad** (publicado/borrador/oculto × autor/otro/admin) | `in-memory-post-repository.test.ts:63–180` | Contract `visibility.ts` | Coincide | PASS |
| UT-REPO-P2 | orden `publishedAt` DESC, filtros, paginación, totales | `in-memory-post-repository.test.ts:194–268` | Contract | Coincide | PASS |
| UT-REPO-P3 | create/update/delete + reflejo inmediato en feed | `in-memory-post-repository.test.ts:289–343` | Contract | Coincide | PASS |
| UT-REPO-U1 | `findById`/`findByUsername`/`findByEmail` (case-insensitive) | `in-memory-user-repository.test.ts:48–75` | Contract | Coincide | PASS |
| UT-REPO-U2 | `updateRole` inmediato | `in-memory-user-repository.test.ts:84` | Inmediatez | Coincide | PASS |
| UT-REPO-U3 | `listAuthors`: solo con posts, orden locale `es`, sin email/role | `in-memory-user-repository.test.ts:95–121` | Contract | Coincide | PASS |
| UT-ADAPTER | operadores del adaptador de auth (eq/ne/in/contains, gt/lte, AND/OR, orden/paginación, CRUD, modelos genéricos) | `memory-auth-adapter.test.ts:52–218` | Compatible Better Auth | Coincide | PASS |
| UT-VALID | esquemas zod del dominio (29 casos de `validation.test.ts`) | `domain/validation.test.ts` | Reglas de contrato | Coincide | PASS |

**Resultado de la matriz: 180/180 unitarios PASS + 15/15 casos de smoke PASS. 0 FAIL.**

---

## 4. Evidencia del smoke (transcripción de headers y cuerpos reales)

### SM-2 — `POST /api/v1/auth/register` (201 + cookie)

```
HTTP/1.1 201 Created
content-type: application/json
content-security-policy: default-src 'none'; frame-ancestors 'none'
x-content-type-options: nosniff
strict-transport-security: max-age=63072000; includeSubDomains
referrer-policy: no-referrer
set-cookie: better-auth.session_token=zLm5JwyC4MWtufKRnTUAFxH3HtQyMVfh.mMPHdpP2l8HbIfHOBS1xrqknR5DGc%2F0xJaD87xeRaxw%3D; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax
x-request-id: e3b072da-eaa2-415a-b2a8-6f3bb4d17c13

{"user":{"id":"bNG7VqOjUsME7inYQFKFnMsBQRI3zHGo","username":"marina.torres","role":"estudiante"},"expiresAt":"2026-10-05T02:50:59.730Z"}
```

Flags de cookie verificados: **`HttpOnly`** presente, **`SameSite=Lax`** presente, `Path=/`, `Max-Age=86400` (24 h). `Secure` no aparece en dev (correcto: solo en producción, ver UT-A16).

### SM-9 — CSRF: `POST /api/v1/auth/register` sin cookie `facy.csrf_token` (Origin permitido)

```
HTTP/1.1 403 Forbidden
...
set-cookie: facy.csrf_token=6de803d34c43cc327e88696dfdf7a6655790f6c7b11f14aaf802b3d5bc6281b2; Path=/; SameSite=Lax

{"error":"forbidden","message":"Token CSRF requerido"}
```

### SM-8 — H1: rutas nativas de Better Auth

```
POST /api/v1/auth/sign-in/email → HTTP/1.1 404  {"error":"not_found","message":"Not found"}
POST /api/v1/auth/sign-up/email → HTTP/1.1 404  {"error":"not_found","message":"Not found"}
```

### SM-14 — 401 idéntico (R13)

```
login password incorrecta  → 401  {"error":"invalid_credentials","message":"El usuario o la contraseña no coinciden."}
login usuario inexistente → 401  {"error":"invalid_credentials","message":"El usuario o la contraseña no coinciden."}
BODY_EQUAL=True
```

### SM-15 — Rate limit real (umbral 3)

```
ATTEMPT 1 → HTTP 401
ATTEMPT 2 → HTTP 401
ATTEMPT 3 → HTTP 401
ATTEMPT 4 → HTTP 429  {"error":"rate_limited","message":"Demasiadas solicitudes. Intenta de nuevo más tarde."}
SEQUENCE=401,401,401,429
```

### SM-1 — Cabeceras de seguridad (todas las respuestas)

```
content-security-policy: default-src 'none'; frame-ancestors 'none'
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
referrer-policy: no-referrer
strict-transport-security: max-age=63072000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 0
X-POWERED-BY_LINES=0   ·   SERVER_HEADER_LINES=0
```

### Arranque y apagado

```
Red FaCyT API listening {"port":3001,"hostname":"0.0.0.0"}
KILLED node PID 24412 on port 3001   (y PID 18204 / 23868 en rondas 2 y 3)
OK: port 3001 is free
```

---

## 5. Mapeo a criterios de aceptación (resumen)

| Criterio | Estado |
| --- | --- |
| CA-1 (cobertura ≥ 80% las 4 métricas) | **PASS** (94.21 / 81.93 / 95.1 / 97.23) |
| CA-2 (typecheck + lint sin errores/warnings) | **PASS** (tsc exit 0, eslint exit 0) |
| CA-3 (rutas §9 con enforcement §12.2) | **PASS** (matriz §3.2) |
| CA-4 (feed replica 9 combinaciones de visibilidad) | **PASS** (`in-memory-post-repository.test.ts:63–180`) |
| CA-5 (OpenAPI dev/prod, sin secretos) | **PASS** (UT-O1..O4 + grep del documento servido) |
| CA-6 (cookies httpOnly/SameSite/Secure + CSRF) | **PASS** (SM-2, UT-A16, UT-P10/P11, UT-C1..C7, SM-9) |
| CA-7 (rate limiting auth) | **PASS** (UT-A6/A9, UT-RL1..9, SM-15) |
| CA-8 (validación estricta zod) | **PASS** (UT-A2, UT-P9, `validation.test.ts`) |
| CA-9 (login 401 idéntico) | **PASS** (UT-A8, SM-14) |
| CA-10 (rol fresco por petición, R14) | **PASS** (UT-AD2, UT-AD3) |
| CA-11 (posts: propietario/admin + visibilidad) | **PASS** (UT-P1..P15) |
| CA-12 (admin enforcement server-side) | **PASS** (UT-AD1..AD7) |
| CA-13 (perfiles y anti-enumeración) | **PASS** (UT-U1..U5, SM-11, SM-12) |
| CA-14 (H1 regresión: rutas nativas 404) | **PASS** (UT-A13/A14, SM-8) |
| CA-15 (CSRF sin cookie → 403) | **PASS** (UT-C6, UT-P11, SM-9) |
| CA-16 (cabeceras de seguridad sin X-Powered-By) | **PASS** (SM-10) |

Requisitos del modelo de amenaza cubiertos en esta ronda: **R7, R8, R10, R11, R12, R13, R14, R15, R16, R17, R18** (P0/P1). R9 (logging seguro) ya verificado en la ronda del scaffold y mantenido (`server.test.ts`, 3 tests). R1–R6 y R9 del scaffold siguen pasando (regresión en `app.test.ts`).

---

## 6. Limitaciones y notas

- **Entorno Windows/pnpm**: `pnpm run` crashea en este equipo por el gate de `allowBuilds` de `pnpm-workspace.yaml`; todas las suites se ejecutaron con **binarios locales** (`npx vitest`, `npx tsc`, `npx eslint`, `npx tsx`) dentro de `apps/api`. Los números son equivalentes a los scripts de `package.json` (`test:coverage`, `typecheck`, `lint`, `dev`).
- **Sesiones de BD en memoria — desvío H4 documentado** (`infrastructure/auth/auth.config.ts:22-30`): Better Auth **v1.7.7** no soporta sesiones totalmente stateless JWT (`session.cookieCache.strategy: "jwt"` solo cachea; la validación siempre consulta el registro de sesión). Se mantiene la **sesión de BD en memoria (revocable)**: logout y democión de rol son efectivos de inmediato, lo que refuerza R13/R14. La afirmación «stateless JWT» de la spec no aplica en esta versión; requiere actualización del modelo de amenaza (`threat-model-api.md` R13) por el `security-architect`.
- **Cookie CSRF propia `facy.csrf_token`** (`middleware/csrf.ts:40-43`): Better Auth v1.7.7 no emite la cookie `better-auth.csrf_token` de la spec; se implementó doble envío con cookie propia (`httpOnly: false`, `SameSite=Lax`, `Secure` en prod) + header `x-csrf-token`, verificada por la matriz §12.2 (SM-9, UT-C1..C7).
- **Hashing**: se mantiene **Scrypt** del proveedor (memory-hard, familia de argon2id) en lugar de argon2id/bcrypt de la spec (desvío documentado en `auth.config.ts:31-36`).
- **Requisito operativo del proxy para XFF** (`middleware/rate-limit.ts:164-169`): la clave de rate limit combina el peer TCP del socket + el primer hop saneado de `X-Forwarded-For`. En despliegue tras reverse proxy, el proxy **debe** sobrescribir `X-Forwarded-For` con la IP real del cliente; sin eso, el XFF sigue siendo forjable (riesgo residual documentado para el MVP).
- **Almacenamiento en memoria**: usuarios/sesiones/publicaciones se pierden al reiniciar el proceso (coherente con el MVP y la migración a PostgreSQL sin rework).
- **Rate limiting en memoria**: no escala a multi-instancia; migrar a Redis en despliegue multi-replica (nota para `devops`).
- **Smoke en `NODE_ENV=development`**: las ramas de producción (cookies `Secure`, OpenAPI bloqueado, error handler genérico exacto) están cubiertas por la suite (`auth.routes.test.ts:359`, `openapi.test.ts:37`, `app.test.ts`); un smoke en producción requeriría `.env` de producción real.
- **No modificado por el tester**: código de producción, config, `progress.md` y Kanban quedan fuera de esta fase. El `developer` debe registrar en `progress.md` el estado y los desvíos (H4, cookie CSRF, Scrypt, XFF) en la fase de documentación.

---

## 7. Conclusión

La entrega de **auth + endpoints `/api/v1/*` + OpenAPI** de `apps/api` **cumple la DoD §12 de `api-structure.md`** y los **requisitos R7–R18** de `threat-model-api.md`. Resultados reales:

- **180/180 tests PASS** (16 archivos), **cobertura ≥ 80%** en las 4 métricas (94.21 / 81.93 / 95.1 / 97.23).
- **Typecheck y lint PASS** (exit 0, 0 errores, 0 warnings).
- **Smoke real PASS** (15/15): health 200, register 201 + cookie `HttpOnly`/`SameSite=Lax`, session 200, login 200 + cookie nueva, feed 200 `PostPage`, OpenAPI dev 200 sin secretos, creación de post 201 con `authorId` de la sesión, cabeceras de seguridad sin `X-Powered-By`, **H1 → 404** (`sign-in/email` y `sign-up/email`), **CSRF → 403** sin cookie `facy.csrf_token`, **401 idéntico** (R13), **429 real** tras el límite, logout 204 + sesión posterior 401.
- **0 fallos** y **0 hallazgos bloqueantes** para el developer en esta ronda.

Evidencia completa en este documento y en la cobertura generada en `apps/api/coverage/`.