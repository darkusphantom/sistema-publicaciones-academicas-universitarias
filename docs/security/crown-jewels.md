# Joyas de la Corona — Red FaCyT

Documento rector de seguridad. Identifica los **activos críticos** de la plataforma (las "joyas de la corona") y define qué protecciones son **obligatorias** y **prioritarias** sobre cada uno. Cualquier decisión de seguridad (diseño, implementación, revisión o auditoría) se prioriza según este documento.

> **Regla**: si un cambio afecta a un activo de prioridad **P0/P1**, la revisión de seguridad es obligatoria antes de integrar. Los agentes `security-architect`, `blue-team`, `red-team` y `security-reviewer` operan sobre esta jerarquía.

---

## 1. Modelo de amenaza (resumen)

| Actor | Motivación | Superficie principal |
| --- | --- | --- |
| Internet / atacante externo | Robo de credenciales, defacement, DoS, scraping de datos | Login, registro, endpoints públicos, feed |
| Usuario autenticado malicioso | Escalada de privilegios, IDOR sobre publicaciones ajenas | CRUD de publicaciones, administración, perfiles |
| Insider (docente/admin comprometido) | Manipulación de contenidos, exfiltración | Panel admin, moderación |
| Bots automatizados | Fuerza bruta, creación masiva de cuentas, spam | Registro, login, creación de publicaciones |

---

## 2. Joyas de la corona (activos críticos)

Prioridad: **P0** = crítica (compromiso = daño grave/irreversible), **P1** = alta, **P2** = media.

### P0 — Credenciales y sesiones de usuarios
- Hash de contraseñas (bcrypt/argon2) — **nunca** texto plano ni hash sin salt.
- Cookies de sesión con `HttpOnly`, `Secure`, `SameSite`, expiración.
- Regeneración de sesión en login/logout (anti session fixation).
- Rate limiting en login/registro/recuperación.
- Protección contra enumeración de usuarios (mensajes de error no diferenciados).

### P0 — Cuentas y control de acceso por rol
- Roles: **Estudiante**, **Profesor**, **Admin**.
- **Enforcement en el servidor**: cada endpoint verifica rol/propiedad por petición (nunca confiar en el rol del cliente).
- Protección de rutas privadas (`(main)` requiere sesión; `/admin` requiere rol admin).
- Prevención de escalada vertical (IDOR en admin) y horizontal (un usuario no edita/borra publicaciones ajenas).

### P0 — Publicaciones (integridad y disponibilidad)
- CRUD protegido por permisos: autor puede editar/eliminar las propias; admin/moderador puede ocultar/eliminar cualquiera.
- Estado `visible/oculto` respetado en el feed (un usuario no ve publicaciones ocultas ajenas).
- Validación de entrada (título, contenido, categoría) en frontend **y** backend; sanitización anti-XSS.

### P0 — Base de datos PostgreSQL
- Parametrización de consultas (anti SQL injection), incl. `ORDER BY`, filtros y búsquedas.
- Principio de menor privilegio en roles BD; credenciales en variables de entorno, nunca en el repo.
- RLS/policies si se usa Supabase; revisión por `security-reviewer`.
- Migraciones versionadas; consultas directas solo lectura.

### P1 — Secretos y configuración
- `.env*`, claves de API, tokens, `DATABASE_URL` **nunca** en el repositorio (solo `.env.example`).
- No exponer claves de servicio en bundles (nada `NEXT_PUBLIC_*` con secretos).
- Bloquear `/docs`, `/openapi.json`, `/admin`, `/.env`, `/.git` en producción; desactivar sourcemaps.

### P1 — API (endpoints y datos expuestos)
- Validación estricta de entrada en cada ruta (tipos, longitudes, formato email/UUID).
- Respuestas de error sin fuga de detalle interno.
- CORS con whitelist estricta (sin reflejo de `Origin` ni `null`).
- Límites de tamaño de cuerpo y profundidad JSON (anti DoS).

### P2 — Disponibilidad y hardening general
- Cabeceras de seguridad: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`.
- Protección CSRF (token + `SameSite`); `SameSite` solo no basta.
- Manejo básico de errores sin volcar stack traces.
- Logging seguro: sin contraseñas/tokens/PII; alertas de ráfagas de 401/403.

---

## 3. Prioridades de seguridad por funcionalidad

| Funcionalidad | Joyas implicadas | Controles obligatorios |
| --- | --- | --- |
| Registro | P0 credenciales, P0 acceso | Hash, validación, rate limit, no enumerar |
| Login | P0 credenciales, P0 sesión | Rate limit, cookies seguras, mensajes no diferenciados |
| Feed | P0 publicaciones, P2 disponibilidad | Filtros por estado/visibilidad, parametrización, validación |
| Crear/editar/eliminar publicación | P0 publicaciones, P0 acceso | Autorización por rol/propietario, validación front+back, anti-XSS |
| Panel admin / moderación | P0 acceso, P0 publicaciones | Enforcement servidor por rol admin, IDOR prevention |
| Perfil de usuario | P0 credenciales, P0 acceso | Propietario puede ver/editar el propio, no datos sensibles ajenos |

---

## 4. Proceso para los agentes

1. **security-architect**: en fase de diseño, valida que el diseño de la feature proteja las joyas P0/P1 correspondientes y documenta el modelo de amenaza en `docs/security/`.
2. **blue-team**: implementa/verifica los controles de la tabla §3 (skill `seguridad`) y mitiga hallazgos del red-team.
3. **red-team**: audita la app/API contra estas joyas (skill `pentesting`); cualquier hallazgo se clasifica con la severidad que indica el impacto sobre P0/P1/P2.
4. **security-reviewer**: audita código y PostgreSQL antes de integrar features que tocan P0/P1.

## 5. Regla de severidad

- 🔴 **Crítico**: compromete una joya P0 (credenciales, sesión, acceso por rol, integridad de publicaciones, BD).
- 🟡 **Advertencia**: compromete una joya P1 (secretos, API, hardening) o condición de P0 con mitigación.
- 🔵 **Sugerencia**: P2 (disponibilidad, hardening menor, buenas prácticas).

> Los hallazgos **críticos** bloquean la integración hasta su corrección.