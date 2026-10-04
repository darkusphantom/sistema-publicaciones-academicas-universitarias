# Reporte de pruebas — Scaffold de la API (`apps/api`)

**Agente**: `tester` de Red FaCyT.
**Fase**: TESTING (evidencia en `docs/tests/`).
**Fecha de ejecución**: 2026-10-03 (hora local).
**Objeto de prueba**: scaffold de la API en `apps/api` (Hono 4 + `@hono/node-server`, TypeScript strict, config de entorno con zod, middleware de seguridad, endpoint `GET /api/v1/health`, puertos hexagonales en `src/domain/`).

> Este reporte documenta evidencia de la **ronda de verificación funcional** del scaffold, mapeada a la DoD §9 de `docs/architecture/api-structure.md` y a los requisitos P0–P9 del modelo de amenaza `docs/security/threat-model-api.md` aplicables al scaffold (R1–R6 y R9). El agente `tester` **no** modificó código de producción ni config; solo documenta resultados y hallazgos.

---

## 1. Objeto de prueba y criterios de aceptación

| # | Criterio de aceptación | Origen | Verificación usada |
| --- | --- | --- | --- |
| CA-1 | `pnpm --filter @red-facyt/api test:coverage` pasa con **≥ 80%** en líneas, funciones, ramas y sentencias | DoD §9.1 | `npx vitest run --coverage` |
| CA-2 | `typecheck` y `lint` pasan sin errores ni warnings | DoD §9.2 | `npx tsc --noEmit` y `npx eslint --max-warnings 0 .` |
| CA-3 | `GET /api/v1/health` responde `{ status: "ok", ... }` con la API arrancada | DoD §9.3 | Smoke real con `curl.exe` (API en puerto 3001) |
| CA-4 | `app.test.ts` verifica 404 JSON, cabeceras de seguridad, CORS whitelist, `413` en cuerpo excesivo y ausencia de stack en errores | DoD §9.4 | Suite Vitest + smoke real |
| CA-5 | `.env.example` existe sin secretos reales; `parseEnv` falla rápido con env inválido | DoD §9.5 / R5 | Suite Vitest (`env.test.ts`) + grep de secretos |
| CA-6 | Los puertos de `src/domain/*` existen con firmas espejo del contrato frontend | DoD §9.6 | Revisión de código (`domain/post.ts`, `domain/user.ts`, `domain/session.ts`) |
| CA-7 | CORS con whitelist estricta, sin reflejo de `Origin` ni `Origin: null`, sin `*` | threat-model R1 | Smoke real (3 orígenes) + suite |
| CA-8 | Errores `500` sin fuga de detalle interno (stack, rutas, mensajes internos) en producción | threat-model R2 | Suite Vitest |
| CA-9 | Límite global de cuerpo con `413` al superar `MAX_BODY_BYTES` | threat-model R3 | Smoke real (POST con cuerpo 110011 B > 102400 B) + suite |
| CA-10 | Cabeceras de seguridad presentes (CSP, HSTS, nosniff, Referrer-Policy) y sin `X-Powered-By` | threat-model R4 | Smoke real (headers completos) + suite |
| CA-11 | Secretos en env, nunca en repo ni logs; `.env.example` sin valores reales; `.env` ignorado | threat-model R5 | grep de secretos + `git check-ignore` |
| CA-12 | 404 y errores en JSON sin volcar ruta interna ni stack | threat-model R6 | Smoke real + suite |
| CA-13 | Logging seguro: `cookie`/`authorization` redactados en el access log, correlación con `x-request-id` | threat-model R9 | Smoke real (request con credenciales) + suite |

Requisitos R7 (rate limiting en auth), R8 (validación estricta), R10 (cookies) y R11 (enforcement por rol) **no aplican al scaffold**: dependen de auth/endpoints futuros. El slot `src/middleware/rate-limit.ts` existe (R7, esqueleto) pero no limita aún (ver §7).

---

## 2. Ejecución de suites de calidad (resultados reales)

Ejecutadas en `apps/api` con binarios locales (`npx`). Fecha/hora: 2026-10-03 ~21:13 (UTC-4).

### 2.1 `npx vitest run --coverage`

```
RUN  v5.0.1
Test Files  3 passed (3)
Tests       28 passed (28)
Start at    21:13:07
Duration    891ms

File               | % Stmts | % Branch | % Funcs | % Lines
All files          |     100 |    88.88 |     100 |     100
 src/config        |     100 |     87.5  |     100 |     100
  env.ts           |     100 |     87.5  |     100 |     100
 src/middleware    |     100 |    88.88 |     100 |     100
  error-handler.ts |     100 |     75    |     100 |     100
```

| Métrica | Resultado | Umbral | Estado |
| --- | --- | --- | --- |
| Statements | **100%** (54/54) | ≥ 80% | PASS |
| Branches | **88.88%** (24/27) | ≥ 80% | PASS |
| Functions | **100%** (19/19) | ≥ 80% | PASS |
| Lines | **100%** (54/54) | ≥ 80% | PASS |

**Archivos de test (3):** `src/app.test.ts` (16 tests), `src/config/env.test.ts` (9 tests), `src/server.test.ts` (3 tests). Total **28/28 PASS**, 0 fallos.

> Cobertura de `src/index.ts` y `src/server.ts` excluida por diseño (bootstrap que abre sockets; verificado por smoke, decisión documentada en `vitest.config.mts`). `error-handler.ts` deja 2 ramas sin cubrir (líneas 32 y 47) — por encima del umbral.

### 2.2 `npx tsc --noEmit`

```
(exit code 0 — sin errores ni warnings)
```

Typecheck estricto (strict, noEmit) **PASS**, 0 errores.

### 2.3 `npx eslint --max-warnings 0 .`

```
(exit code 0 — sin errores ni warnings)
```

Lint con `typescript-eslint` recomendado y `--max-warnings 0` **PASS**, 0 hallazgos.

---

## 3. Matriz de casos de la ronda de verificación

Leyenda: **PASS** = resultado coincide con lo esperado · **FAIL** = no coincide (hallazgo). Datos y pasos son reproducibles.

### 3.1 Smoke de arranque real (API levantada con `npx tsx src/index.ts`, puerto 3001, `NODE_ENV=development` con defaults de `.env.example`)

| ID | Descripción | Pasos | Datos | Resultado esperado | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| SM-1 | Health responde 200 JSON con `status: ok` y `timestamp` | `curl.exe -s -i http://localhost:3001/api/v1/health` | — | `200`, `Content-Type: application/json`, `{"status":"ok","timestamp":"<ISO8601>"}` | `200`, `{"status":"ok","timestamp":"2026-10-04T01:13:25.723Z"}`; timestamp ISO 8601 válido | PASS |
| SM-2 | Ruta inexistente devuelve 404 JSON sin volcar la ruta | `curl.exe -s -i http://localhost:3001/ruta-inexistente` | — | `404`, JSON `{"error":"not_found","message":"Not found"}`, sin ruta interna ni stack | `404`, `{"error":"not_found","message":"Not found"}`, cuerpo de 43 B sin datos internos | PASS |
| SM-3 | POST con cuerpo grande devuelve 413 JSON | `curl.exe -s -i -X POST http://localhost:3001/api/v1/health -H "Content-Type: application/json" --data-binary @big.json` | body `{"data":"xxxx…"}` de **110011 B** (límite 102400 B = 100 KB) | `413`, JSON `{"error":"payload_too_large",…}`, con headers de seguridad y `x-request-id` | `413 Payload Too Large`, `{"error":"payload_too_large","message":"Request body exceeds the allowed limit"}`; CSP, nosniff, `x-request-id` presentes | PASS |
| SM-4 | Cabeceras de seguridad presentes en todas las respuestas | `curl.exe -s -i http://localhost:3001/api/v1/health` (inspección de headers) | — | CSP (`default-src 'none'`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` | `content-security-policy: default-src 'none'; frame-ancestors 'none'`, `strict-transport-security: max-age=63072000; includeSubDomains`, `x-content-type-options: nosniff`, `referrer-policy: no-referrer` | PASS |
| SM-5 | `X-Powered-By` y `Server` no aparecen en ninguna respuesta | grep de headers de la respuesta del health | — | 0 líneas `x-powered-by`; 0 líneas `server` | `X-Powered-By lines: 0`; `Server lines: 0` | PASS |
| SM-6 | CORS: origen permitido recibe `Access-Control-Allow-Origin` | `curl.exe -s -i http://localhost:3001/api/v1/health -H "Origin: http://localhost:3000"` | `Origin: http://localhost:3000` (en whitelist) | `access-control-allow-origin: http://localhost:3000`, `access-control-allow-credentials: true` | `HTTP/1.1 200 OK` con `access-control-allow-origin: http://localhost:3000` y `access-control-allow-credentials: true` | PASS |
| SM-7 | CORS: origen fuera de whitelist NO recibe `Access-Control-Allow-Origin` | `curl.exe -s -i http://localhost:3001/api/v1/health -H "Origin: http://evil.example"` | `Origin: http://evil.example` | Respuesta **sin** `access-control-allow-origin` | `HTTP/1.1 200 OK`, **sin** `access-control-allow-origin` (solo `allow-credentials: true`) | PASS |
| SM-8 | CORS: `Origin: null` rechazado | `curl.exe -s -i http://localhost:3001/api/v1/health -H "Origin: null"` | `Origin: null` | Respuesta **sin** `access-control-allow-origin` | `HTTP/1.1 200 OK`, **sin** `access-control-allow-origin` | PASS |
| SM-9 | `x-request-id` presente en cada respuesta | inspección de headers del health | — | Header `x-request-id` no vacío | `x-request-id: 7b2e5fbf-516a-4a19-a8ec-2619c66230a0` (UUID v4) | PASS |
| SM-10 | Access log redacta `cookie` y `authorization` (R9) | `curl.exe -s http://localhost:3001/api/v1/health -H "Cookie: session=super-secret-value" -H "Authorization: Bearer super-secret-token"`; luego inspección del log | headers con secretos | `200`; en el log, `cookie` y `authorization` como `[Redacted]`, sin valores | `200`; log contiene `"cookie":"[Redacted]","authorization":"[Redacted]"`; grep de `super-secret` en log → 0 coincidencias | PASS |
| SM-11 | Proceso limpio: API se detiene y puerto queda libre | `Stop-Process` sobre el PID del puerto 3001 y el wrapper | — | Puerto 3001 sin listener tras el cierre | `Killed node PID 5416 on port 3001`; `OK: port 3001 is free` | PASS |

### 3.2 Suites unitarias (cobertura de requisitos, ejecutadas en §2)

| ID | Descripción | Archivo de test (trazabilidad) | Resultado esperado | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| UT-1 | Health 200 con `{ status: "ok" }` y `Content-Type: application/json` | `src/app.test.ts:18` | 200 + JSON | 200 + JSON | PASS |
| UT-2 | 404 JSON `not_found` sin leak | `src/app.test.ts:26` | 404 + JSON exacto | 404 + JSON exacto | PASS |
| UT-3 | Cabeceras de seguridad y ausencia de `X-Powered-By` | `src/app.test.ts:37` | HSTS, nosniff, RP, CSP, sin X-Powered-By | Coincide | PASS |
| UT-4 | CORS permite origen de whitelist | `src/app.test.ts:49` | `access-control-allow-origin` = origen | Coincide | PASS |
| UT-5 | CORS deniega origen externo | `src/app.test.ts:61` | Header ausente | Coincide | PASS |
| UT-6 | CORS rechaza `Origin: null` | `src/app.test.ts:71` | Header ausente | Coincide | PASS |
| UT-7 | Nunca `Access-Control-Allow-Origin: *` | `src/app.test.ts:81` | No `*` | Coincide | PASS |
| UT-8 | `413` al superar `MAX_BODY_BYTES` (config `64` B, payload 128 B) | `src/app.test.ts:91` | 413 + JSON `payload_too_large` + `x-request-id` + CSP | Coincide | PASS |
| UT-9 | 500 en producción no filtra stack ni detalle (R2) | `src/app.test.ts:108` | `{error,message}` genérico, sin `at `, `Error`, `src/`, `stack` | Coincide | PASS |
| UT-10 | En desarrollo incluye `detail` pero nunca stack | `src/app.test.ts:132` | `{error, detail}` sin `at ` | Coincide | PASS |
| UT-11 | `HTTPException` devuelve su status/mensaje (no 500) | `src/app.test.ts:144` | 400 + JSON `http_error` | Coincide | PASS |
| UT-12 | Errores no controlados se loguean con el `x-request-id` del contexto | `src/app.test.ts:157` | Log contiene `requestId` | Coincide | PASS |
| UT-13 | Toda respuesta lleva `x-request-id` | `src/app.test.ts:177` | Header presente | Coincide | PASS |
| UT-14 | `x-request-id` entrante bien formado se reutiliza | `src/app.test.ts:183` | Header = entrante | Coincide | PASS |
| UT-15 | `x-request-id` malformado se reemplaza | `src/app.test.ts:191` | Regex `^[a-zA-Z0-9-]{1,64}$` | Coincide | PASS |
| UT-16 | `parseCorsOrigins` normaliza CSV | `src/app.test.ts:200` | Arreglo limpio | Coincide | PASS |
| UT-17 | `parseEnv` aplica defaults documentados | `src/config/env.test.ts:5` | Defaults (PORT 3001, CORS 3000, MAX 102400…) | Coincide | PASS |
| UT-18 | `parseEnv` parsea source completa tipada | `src/config/env.test.ts:15` | Objeto tipado | Coincide | PASS |
| UT-19 | Fail-fast sin `CORS_ORIGINS` en production (R5) | `src/config/env.test.ts:34` | Throw `/CORS_ORIGINS/` | Coincide | PASS |
| UT-20 | `CORS_ORIGINS` opcional fuera de production | `src/config/env.test.ts:38` | No throw | Coincide | PASS |
| UT-21 | Fail-fast con `PORT` no numérico | `src/config/env.test.ts:42` | Throw | Coincide | PASS |
| UT-22 | Fail-fast con `NODE_ENV` desconocido | `src/config/env.test.ts:46` | Throw | Coincide | PASS |
| UT-23 | Fail-fast con `LOG_LEVEL` inválido | `src/config/env.test.ts:50` | Throw | Coincide | PASS |
| UT-24 | Fail-fast con `CORS_ORIGINS` solo espacios | `src/config/env.test.ts:54` | Throw | Coincide | PASS |
| UT-25 | Claves futuras reservadas opcionales | `src/config/env.test.ts:58` | Definidas si se pasan, `undefined` si no | Coincide | PASS |
| UT-26 | Access log redacta `cookie` y `authorization` (R9) | `src/server.test.ts:70` | `[Redacted]`, sin valores | Coincide | PASS |
| UT-27 | Access log reutiliza `x-request-id` entrante | `src/server.test.ts:90` | `req.id` = entrante | Coincide | PASS |
| UT-28 | Access log genera UUID sin `x-request-id` | `src/server.test.ts:104` | UUID v4 | Coincide | PASS |

**Resultado de la matriz: 39/39 PASS** (11 smoke + 28 unitarios). **0 FAIL**.

---

## 4. Revisión de código (CA-6) y secretos (CA-11/R5)

| Ítem | Verificación | Resultado | Estado |
| --- | --- | --- | --- |
| Puertos hexagonales en `src/domain/` | `post.ts` define `Post`, `PostFilters`, `PostPage`, `PageOptions`, `PostRepository` (`findVisible`/`findById`); `user.ts` define `User`, `UserRole`, `AuthorOption`, `UserRepository` (`listAuthors`); `session.ts` define `Session`. JSDoc en inglés, espejo de `src/lib/repositories/post-repository.ts` y `src/lib/types.ts` | Firmas coinciden con el contrato frontend | PASS |
| `.env.example` sin secretos reales | lectura de `apps/api/.env.example` | Solo nombres de claves y comentarios; claves futuras comentadas | PASS |
| `apps/api/.env` no existe ni está versionado | `Test-Path` → `False`; `git check-ignore apps/api/.env` → ignorado | `.env` ausente e ignorado | PASS |
| Grep de secretos en `src/` y `.env.example` | patrón `password|secret|token|api[_-]?key` | 0 coincidencias en código de producción; coincidencias solo en tests (valores ficticios `super-secret-*`, `0123456789abcdef`) y nombres de claves (`BETTER_AUTH_SECRET`) | PASS |
| Logging sin credenciales | Smoke SM-10 + tests UT-26 | `[Redacted]` en access log; 0 leak | PASS |

> Nota de trazabilidad R5: los valores `super-secret-value`/`super-secret-token` viven **únicamente** en `src/server.test.ts:75-76` como fixtures de pruebas de redacción, no en producción.

---

## 5. Evidencia del smoke (transcripción)

### SM-1 — `GET /api/v1/health`

```
HTTP/1.1 200 OK
content-type: application/json
content-security-policy: default-src 'none'; frame-ancestors 'none'
referrer-policy: no-referrer
strict-transport-security: max-age=63072000; includeSubDomains
x-content-type-options: nosniff
x-request-id: 7b2e5fbf-516a-4a19-a8ec-2619c66230a0

{"status":"ok","timestamp":"2026-10-04T01:13:25.723Z"}
```

### SM-2 — `GET /ruta-inexistente`

```
HTTP/1.1 404 Not Found
content-type: application/json

{"error":"not_found","message":"Not found"}
```

### SM-3 — `POST /api/v1/health` (body 110011 B > 102400 B)

```
HTTP/1.1 413 Payload Too Large
content-type: application/json
content-security-policy: default-src 'none'; frame-ancestors 'none'
x-content-type-options: nosniff
strict-transport-security: max-age=63072000; includeSubDomains

{"error":"payload_too_large","message":"Request body exceeds the allowed limit"}
```

### SM-6 / SM-7 / SM-8 — CORS (resumen de headers)

| `Origin` | `access-control-allow-origin` |
| --- | --- |
| `http://localhost:3000` | `http://localhost:3000` (más `access-control-allow-credentials: true`) |
| `http://evil.example` | **ausente** |
| `null` | **ausente** |

### SM-10 — Acceso con credenciales → log redactado

```
... "cookie":"[Redacted]","authorization":"[Redacted]" ...
```

Grep de `super-secret` en el log → **0 coincidencias**.

### Arranque y apagado

```
Red FaCyT API listening {"port":3001,"hostname":"0.0.0.0"}
Killed node PID 5416 on port 3001
OK: port 3001 is free
```

---

## 6. Mapeo a criterios de aceptación (resumen)

| Criterio | Estado |
| --- | --- |
| CA-1 (cobertura ≥ 80% las 4 métricas) | **PASS** (100 / 88.88 / 100 / 100) |
| CA-2 (typecheck + lint sin errores/warnings) | **PASS** |
| CA-3 (health 200 con la API arrancada) | **PASS** |
| CA-4 (404, headers, CORS, 413, sin stack en `app.test.ts`) | **PASS** |
| CA-5 (`.env.example` sin secretos; fail-fast de env) | **PASS** |
| CA-6 (puertos `domain/` espejo del contrato) | **PASS** |
| R1 (CORS whitelist estricta) | **PASS** |
| R2 (errores sin fuga) | **PASS** |
| R3 (límite de cuerpo 413) | **PASS** |
| R4 (cabeceras de seguridad, sin X-Powered-By) | **PASS** |
| R5 (secretos en env, nunca en repo/logs) | **PASS** |
| R6 (404 JSON sin leak) | **PASS** |
| R9 (logging seguro con redacción y request-id) | **PASS** |
| R7, R8, R10, R11 | No aplican al scaffold (dependen de auth/endpoints futuros) |

---

## 7. Hallazgos y notas

- **Sin fallos (0 FAIL)**: los 28 tests unitarios y los 11 casos de smoke de la ronda pasan. No hay hallazgos que exijan corrección del developer para dar por terminado el scaffold según DoD §9.
- **Nota de cobertura (informativa, no bloqueante)**: `src/middleware/error-handler.ts` deja 2 ramas sin cubrir (líneas 32 y 47), lo que baja `Branch` global a 88.88%. Sigue sobre el umbral del 80%. Las ramas corresponden a: `c.get("requestId") ?? c.req.header(...)` (32) y la rama `HTTPException` vs. genérico dentro del `if` (47) — la rama de HTTPException ya se ejercita en UT-11; la cobertura exacta de la línea 47 depende de la instrumentación de ramas anidadas. Opcional: añadir un test para `HTTPException` sin `requestId` en contexto (cubre la rama 32).
- **Entorno Windows/pnpm**: `rg` (ripgrep) no está disponible en este equipo; la verificación R5 se hizo con `Select-String` (PowerShell). El chequeo de instalación de pnpm (`allowBuilds` con `esbuild: "set this to true or false"` en `pnpm-workspace.yaml`) puede crashear el arranque; por eso se usaron **binarios locales** (`npx vitest`, `npx tsc`, `npx eslint`, `npx tsx`) dentro de `apps/api` en lugar de `pnpm --filter`. Los números obtenidos son equivalentes a los scripts declarados en `package.json`. Nota para `devops`/`product-manager`: resolver el valor literal de `allowBuilds.esbuild` en `pnpm-workspace.yaml` para que `pnpm install` no falle.
- **Decisión de cobertura**: `src/index.ts` y `src/server.ts` están excluidos de la cobertura unitaria (abren sockets de red) y se verifican por el smoke real (CA-3, SM-1 a SM-11), según lo documentado en `vitest.config.mts` y DoD §9.3.
- **Pendiente no bloqueante**: el smoke se ejecutó en `NODE_ENV=development` (default). La rama de producción del error handler (R2, cuerpo exactamente genérico) está cubierta por UT-9 en la suite; un smoke en `NODE_ENV=production` podría añadirse en futuras rondas cuando exista `.env` de producción.
- **No modificado por el tester**: código de producción, `progress.md` y Kanban quedan fuera de esta fase. El estado documental (`progress.md`) lo actualiza la fase de documentación.

---

## 8. Conclusión

El scaffold de la API (`apps/api`) **cumple la DoD §9 de `api-structure.md`** y los **requisitos R1–R6 y R9** de `threat-model-api.md` aplicables a la fase scaffold. Resultados reales:

- **28/28 tests unitarios PASS** (3 archivos), **cobertura ≥ 80%** en las 4 métricas (100/88.88/100/100).
- **Typecheck y lint PASS** (0 errores, 0 warnings).
- **Smoke de arranque real PASS**: health 200, 404 JSON, 413 con cuerpo excesivo, cabeceras de seguridad presentes, sin `X-Powered-By`/`Server`, CORS whitelist correcto (permitido/denegado/`null`), `x-request-id` en cada respuesta, logging con `cookie`/`authorization` redactados.
- **0 fallos** y **0 hallazgos bloqueantes** para el developer.

Evidencia completa en este documento y en la cobertura generada en `apps/api/coverage/`.