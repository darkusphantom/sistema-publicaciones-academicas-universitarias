# Despliegue unificado y seguridad — Red FaCyT

Documento de seguridad del **despliegue**. Registra la decisión de topología y sus
**incisos de seguridad**, con los controles aplicados y los pendientes. Complementa
[`crown-jewels.md`](crown-jewels.md) (activos críticos) y
[`threat-model-api.md`](threat-model-api.md) (modelo de amenaza de la API).

Fecha: **2026-10-15**.

## 1. Decisión de topología

Un **único despliegue en Vercel (plan Hobby, gratuito y always-on)**:

- La **web** (Next.js) y la **API** (Hono montada como Route Handler en
  `src/app/api/v1/[[...route]]/route.ts`) comparten **un solo dominio**.
- **PostgreSQL gestionado en Supabase**, accedido **solo desde la API**.
- Se descarta la API en un segundo hosting (Railway free: $1/mes de crédito → no
  sostiene un servicio 24/7; Render free: duerme a los 15 min → cold starts de
  30–60 s e inaceptable para la demo).

Beneficio de seguridad directo: **un solo origen** ⇒ cookies *first-party*, sin CORS
cross-origin ni CSRF cross-site.

## 2. Incisos de seguridad

### 2.1 Cookies y sesión
- La cookie de sesión es **`httpOnly` + `SameSite=Lax` + `Secure` (producción) +
  `Path=/`** (`auth.config.ts`). JavaScript no la lee (mitiga robo por XSS).
- La cookie transporta **solo un token opaco**: **no** lleva rol ni datos del
  usuario. El rol se **relee del store/base de datos por petición** (requisito R14).
- `session.cookieCache.enabled = false` **explícito**: se evita cachear la sesión
  (ni datos del usuario) en la cookie. Si algún día se activa, debe usarse
  `strategy: "jwe"` (cifrada).
- **Prohibido `localStorage`** para la sesión: es legible por JS. El mock estático
  del frontend (`localStorage['facy:session']`) debe sustituirse por cookie
  (`fetch(..., { credentials: "include" })`) al integrar.
- Al ser **same-origin**, `SameSite=Lax` basta: no se requiere
  `crossSubDomainCookies`.

### 2.2 Supabase (base de datos) — acceso vía API, solo backend
- El frontend **nunca** habla con Supabase: toda la BD pasa por la API.
- **Ninguna clave de Supabase en el cliente** (ni `NEXT_PUBLIC_*`, ni bundles).
- El backend usa la **secret key** (`sb_secret_…`, bloquea/bypassa RLS) con
  `@supabase/supabase-js`. **Solo servidor.**
- 🔎 Verificado en el proyecto real: la **publishable key devuelve `401` en
  `/rest/v1/`** ("Secret API key required") → solo la secret key accede a la Data
  API. El frontend, por tanto, no puede consultar Supabase aunque quisiera.
- ⚠️ **La Data API (`/rest/v1/`) queda publicada** por diseño (es el endpoint que
  consume el backend); no se puede ocultar. Se mitiga con **RLS + policies** en
  todas las tablas y **revocando grants de `anon`/`authenticated`** como defensa en
  profundidad (`crown-jewels.md` P0 BD).
- Decisión del equipo: **no** se usa conexión directa a PostgreSQL (sin
  `DATABASE_URL` ni driver `pg`).

### 2.3 Superficie pública y exposición de la API
- **OpenAPI/`/docs` bloqueados en producción** (`OPENAPI_ENABLED` y `NODE_ENV`); en
  `next start` se verificó `404`.
- Errores **sin stack** en producción; **anti-enumeración** (`/users/:username` →
  `404` genérico; login con mensaje idéntico); `/users/authors` **sin `email` ni
  `role`**.
- **CORS con whitelist** (`CORS_ORIGINS`), sin reflejo de `Origin`.
- **CSRF de doble envío** en todas las mutaciones.
- Rutas privilegiadas (`/admin/*`) exigen **sesión + rol en servidor**.

### 2.4 Secretos
- `.env*` está **ignorado** por `.gitignore` (solo se versiona `.env.example` con
  placeholders). Se añadieron también `.envrc`, `*.key`, `*.p12`, `*.pfx`,
  `*.keystore`, `.mcp.json`, `.cursor/mcp.json`.
- Las credenciales reales viven en `.env` (raíz) y `apps/api/.env` (local), y en las
  **Environment Variables** de Vercel en producción.
- **Credenciales comprometidas**: el API Secret y los tokens de Trello compartidos
  en chat deben **rotarse** antes de usarse en producción.

### 2.5 Rate limiting en serverless
- El limiter en memoria es **por instancia**: en serverless varios lambdas no
  comparten límites → el control es **más débil** que en un servidor único.
- Correcto a coste $0: **store compartido (Upstash Redis free)** para el limiter.
- Requisito de proxy para `X-Forwarded-For`: Vercel lo provee; **validar** que la IP
  de la clave de rate limit no sea forjable.

### 2.6 Runtime
- `runtime = "nodejs"` en el Route Handler: **obligatorio** por el Scrypt de Better
  Auth (`node:crypto`); no apto para Edge sin cambiar el hashing.

### 2.7 Repositorio público (información)
- El repositorio es **público**: el código y los docs revelan la estructura de la
  API (incluidas rutas `/admin`) y los controles de seguridad. Ocultar la estructura
  **no es posible** con el repo público; la seguridad se apoya en control de acceso
  real. Decisión pendiente del equipo: **hacer el repo privado**, o asumir la
  exposición y redactar los docs sensibles.

## 3. Verificación del despliegue unificado

En modo producción local (`next build` + `next start`):

| Ruta | Resultado |
| --- | --- |
| `GET /api/v1/health` | 200 |
| `GET /api/v1/openapi.json` | 404 (bloqueado en prod) |
| `POST /api/v1/auth/login` sin CSRF | 403 |
| `GET /` (web) | 200 |

## 4. Pendientes de seguridad
1. Rotar las credenciales expuestas (Trello y la **secret key de Supabase**).
2. Supabase: **RLS + policies** en todas las tablas y **revocar grants** de `anon`/`authenticated` (la Data API queda publicada; la secret key la bypassa, así que RLS es defensa en profundidad).
3. Store compartido del rate limiter (Upstash) en serverless.
4. Persistencia real (adaptadores PostgreSQL) — hoy el store en memoria es **solo
   demo**: en serverless las sesiones son por instancia.
5. Decidir visibilidad del repositorio (público vs privado).
6. Prueba ofensiva (`red-team`) del auth y los endpoints (tarjeta pendiente).
