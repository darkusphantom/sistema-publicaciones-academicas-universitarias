---
name: seguridad
description: Metodología defensiva para asegurar una aplicación web (SPA + API) mitigando las vulnerabilidades más comunes y la cadena de ataque. Úsala cuando el usuario pida endurecer, proteger, blindar, fortalecer, revisar la seguridad, implementar controles, mitigar OWASP Top 10, configurar CSP/CORS/rate limiting/autenticación/autorización/CSRF/DoS, o escribir un plan de remediación de una auditoría. Es el complemento defensivo de la skill de pentesting: convierte cada vector de ataque en un control concreto verificable.
---

# Seguridad web — metodología defensiva para SPA + API

Metodología derivada de auditorías reales (React/Vite + FastAPI). Es el espejo defensivo de la skill `pentesting`: para cada fase de ataque existe aquí una fase de mitigación, ordenada para cerrar la cadena de ataque de fuera hacia dentro. El principio rector: **defensa en profundidad** — cada capa asume que la anterior puede fallar.

## Regla previa: modelo de amenaza y alcance

**Antes de tocar código, confirma el modelo de amenaza.** Pregunta o establece:

- ¿Aplicación pública o interna? ¿Quiénes son los atacantes (internet, usuarios autenticados, insiders)?
- ¿Qué datos protege? ¿Hay PII, datos financieros, credenciales? (determina la severidad de cada control)
- ¿Cuál es el stack exacto? (framework del frontend y backend, ORM, servidor web, proveedor de auth)
- ¿Qué controles ya existen? (evita proponer lo que ya está implementado)

Crea una lista de tareas al inicio: cabeceras y transporte, autenticación, sesión, autorización, entrada y validación, salida y XSS, CSRF/CORS, inyecciones, DoS, logging y monitoreo, informe. Marca el progreso — la seguridad tiene muchas ramas y es fácil dejar huecos.

**Nunca modifiques producción sin pedir permiso y sin un plan de rollback.** Documenta siempre el estado previo de cada cambio.

---

## Fase 1 — Cabeceras y transporte (mitiga: el reconocimiento del atacante)

El atacante de la skill `pentesting` empieza por aquí. Ciérrale esa puerta.

### 1.1 Cabeceras de seguridad básicas

```bash
curl -s -I -m 20 https://TARGET
```

Audita y exige estas cabeceras:

| Cabecera | Control recomendado | Por qué |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS y evita downgrade |
| `Content-Security-Policy` | Sin `unsafe-inline` ni `unsafe-eval`; `default-src 'self'` | Mitiga XSS en profundidad |
| `X-Content-Type-Options` | `nosniff` | Bloquea MIME sniffing |
| `X-Frame-Options` / `frame-ancestors` | `DENY` o `SAMEORIGIN` | Mitiga clickjacking |
| `Referrer-Policy` | `no-referrer` o `strict-origin-when-cross-origin` | Evita fuga de URLs |
| `Permissions-Policy` | Denegar cámara, micrófono, geolocalización si no se usan | Reduce superficie |

### 1.2 Oculta el fingerprinting

- Elimina o desactiva las cabeceras `server` y `x-powered-by`.
- Desactiva el modo debug y el stack trace en producción (la skill de pentesting lo trata como hallazgo inmediato).
- No expongas rutas de administración (`/admin`, `/metrics`, `/health` con detalle) públicamente.

### 1.3 TLS

- Versión mínima TLS 1.2 (ideal 1.3); desactiva TLS 1.0/1.1.
- Alinea el certificado, la cadena y el SNI correctamente (errores TLS delatan configuraciones débiles).
- Aplica `preload` de HSTS solo cuando estés seguro de servir todo el dominio por HTTPS.

---

## Fase 2 — Autenticación (mitiga: fuerza bruta, credential stuffing, enumeración)

El atacante ataca login, registro y recuperación de contraseña. Estas son las defensas mínimas.

### 2.1 Rate limiting y bloqueo por endpoint

Cubre **cada** endpoint no autenticado por separado (login, registro, forgot-password, reset-password, verify, magic link, OTP):

```python
# FastAPI + slowapi (ejemplo)
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/auth/login")
@limiter.limit("10/minute; 30/hour")
def login(request: Request, body: LoginBody):
    ...
```

- **Distingue por IP y por cuenta** (evita el bloqueo cruzado de usuarios legítimos por IP compartida).
- **Aplica el límite ANTES de la validación del cuerpo.** La skill de pentesting demuestra que las peticiones malformadas que se parsean antes del rate limiter lo anulan por completo (secuencia A/B/C: `429, 500, 429` = bypass).
- Configura un mensaje de límite claro (`429` con `Retry-After`) y cuantifícalo en la configuración.

### 2.2 CAPTCHA validado en servidor

- El token CAPTCHA debe validarse **en el servidor**, nunca solo en el cliente.
- Cualquier token falso debe fallar la verificación. Verifica que el fallo no se pueda omitir enviando el campo vacío.

### 2.3 Contraseñas y credenciales

- Política mínima de contraseñas (longitud ≥ 8, idealmente ≥ 12) y comprobación contra listas de contraseñas comunes/comprometidas (p. ej. `zxcvbn`, Have I Been Pwned range API).
- **Nunca almacenes contraseñas sin hash** — usa `bcrypt`/`argon2` (cost factor alto). Nunca las registres en logs.
- Delay exponencial o jitter en login fallido para frustrar timing attacks de enumeración de usuarios.
- **Mensajes de error no diferenciados** en login (`Credenciales inválidas` para usuario inexistente y contraseña incorrecta).

### 2.4 Flujos secundarios (reset, magic link, OTP, invitación)

- Expiración corta y obligatoria de tokens (15–30 min máx).
- **Una única invalidez de tokens tras su uso** (el token no debe ser reutilizable).
- Alcance restringido del token: un token de verificación/magic link **no debe autenticar como sesión completa** en otros módulos (la skill de pentesting lo explota en la fase 4.4).
- Rotación del token de contraseña al cambiarla.

---

## Fase 3 — Sesión y cookies (mitiga: secuestro de sesión, CSRF, fijación)

### 3.1 Atributos de cookie correctos

Toda cookie de sesión y de autenticación:

```
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax|Strict; Path=/; Max-Age=...
```

| Atributo | Obligatorio | Nota |
|---|---|---|
| `HttpOnly` | ✅ | Bloquea el acceso desde JS (mitiga XSS → robo de sesión) |
| `Secure` | ✅ | Solo por HTTPS |
| `SameSite` | ✅ | `Lax` mínimo, `Strict` para acciones sensibles; es la primera línea anti-CSRF |
| `Path=/` | ✅ | Evita cookies duplicadas por subruta |
| `Max-Age`/`Expires` | ✅ | Expiración de sesión |

### 3.2 Token de sesión

- Usa un token de sesión **aleatorio, opaco y de alta entropía** (≥ 128 bits), nunca predecible ni secuencial.
- **Nunca almacenes la sesión en `localStorage`** (XSS la roba). Prefiere cookie `HttpOnly` o token en memoria.
- Regenera el token en login y logout (mitiga session fixation).
- Define expiración absoluta de sesión (idle + absoluta) según la sensibilidad.

### 3.3 Protección CSRF

- Si usas cookie para autenticar, **incluye un token anti-CSRF** (doble envío o synchronizer token) además de `SameSite`.
- `SameSite` reduce el riesgo en peticiones simples, pero no lo elimina: el token es la defensa completa.
- Recuerda: **CORS no protege contra CSRF.** Un CORS estricto solo atenúa.

---

## Fase 4 — Autorización (mitiga: IDOR, escalada de privilegios)

La skill de pentesting demuestra que aquí vive el hueco más grave: **el servidor debe replicar la matriz de permisos del cliente**. La caché del cliente es decorativa; el enforcement es del servidor.

### 4.1 Enforcement en el servidor, nunca en el cliente

- Que el cliente contenga la matriz de permisos **es inherente a las SPA** y no es un fallo. El fallo es que el servidor **no la replique**.
- Cada endpoint del backend debe re-verificar la autorización por su cuenta, por cada petición, sin confiar en la sesión cacheada en el cliente.

### 4.2 Escalada vertical

- Implementa un mecanismo central de autorización por rol/permiso (dependencia de decoradores o middleware, no comprobaciones ad-hoc esparcidas):

```python
# FastAPI (ejemplo)
from fastapi import Depends, HTTPException

@app.get("/admin/stats")
def admin_stats(user=Depends(require_role("ADMIN"))):
    ...
```

- Cada endpoint que el cliente reserva a un rol elevado debe devolver **403** para roles inferiores.
- Prohibido que el backend confíe en un campo `role` enviado por el cliente o guardado en la caché del navegador.

### 4.3 IDOR (horizontal)

- **Nunca confíes en un identificador recibido del cliente** (`/users/{id}`, `/records/{id}`) para determinar el propietario del recurso.
- Resuelve la propiedad a partir de la sesión autenticada: el recurso se filtra por `owner_id == current_user.id`.

```python
record = db.query(Record).filter_by(id=rec_id, owner_id=user.id).first()
if record is None:
    raise HTTPException(403)
```

- Revisa que el control exista en **todos** los endpoints que reciben IDs (a veces falta solo en uno).
- Ojo con IDs negativos, cero, y UUIDs de otro tenant.

### 4.4 Alcance de tokens secundarios

- Cualquier token emitido en flujos alternativos (invitación, verificación, magic link, admisión) debe tener **alcance mínimo**: no debe servir en `/user/me` general ni en `/admin/*`.

---

## Fase 5 — Entrada y validación (mitiga: inyección SQL, NoSQL, comandos, SSTI)

### 5.1 Validación estricta de tipos en el servidor

- Tipado estricto en el backend (Pydantic v2, DTOs de NestJS, etc.) elimina la mayoría de SQLi por parámetros escalares: el payload malicioso **nunca alcanza la capa de datos**.
- **Los parámetros de texto libre son los puntos débiles** — no los trates como inmunes.

### 5.2 Parametrización obligatoria

- **Toda** consulta a BD debe usar consultas parametrizadas o un ORM. Prohibido interpolar input en SQL crudo, `ORDER BY`, `LIMIT`, filtros de rango de fechas, búsquedas y exportaciones/informes (los puntos donde más suele colarse SQL crudo).
- Para `ORDER BY`/`sort`, usa una **whitelist** de columnas permitidas, nunca el valor directo.

### 5.3 Validación de entrada por capas

- **Límite de tamaño de cuerpo** (rechaza con `413`; define un límite razonable, p. ej. 1–10 MB según el caso de uso).
- **Límite de profundidad de anidamiento JSON** en el parser (previene el DoS por `RecursionError` que explota la skill de pentesting: una petición de 10 KB amplificada a ~800× de CPU).
- Whitelist de tipos, longitudes máximas, y formato (email, UUID) en todos los campos.
- Rechazo de claves desconocidas en el body (evita property injection).

### 5.4 Saneamiento específico según el destino

Valida y, donde corresponda, escapa según el contexto de salida:

- SQL → parametrización (nunca escape manual como única capa).
- HTML → escape en salida (ver fase 6).
- Comandos del sistema → evitar `os.system`/`subprocess` con shell; usar listas de argumentos y whitelist de rutas. **Path traversal:** normaliza y confina dentro de un directorio raíz permitido.
- Plantillas del servidor → desactiva la evaluación de expresiones arbitrarias en SSTI (`{{7*7}}`, `${7*7}`).
- URLs para SSRF → **whitelist** de hosts/protocolos; bloquea rangos privados y metadatos (`169.254.169.254`).

---

## Fase 6 — Salida y XSS (mitiga: robo de sesión, secuestro de cuenta)

### 6.1 Escape en la salida

- **Escapa todo input del usuario al renderizar HTML** (autoescaping de plantillas; `{{ }}` en Jinja/Vue/React por defecto escapan, pero verifica).
- Prohibido (salvo casos justificados con saneamiento) `dangerouslySetInnerHTML`, `innerHTML=` con datos de usuario, `document.write`, `eval`, `new Function`.
- Si usas markdown/HTML rico, sanealo con una librería dedicada (DOMPurify) y una **whitelist** de etiquetas/atributos (prohibidos `javascript:` en href, `on*`).

### 6.2 Contenido no confiable

- Trata como no confiable: nombres, URLs de avatar, bio, comentarios, mensajes, campos de importación.
- **La CSP es la segunda línea** (nunca la única): `default-src 'self'`, sin `unsafe-inline`/`unsafe-eval`, y `object-src 'none'`.

### 6.3 Datos en el DOM

- Si se inyectan datos en atributos o `src`, valida el esquema (URLs solo con protocolo permitido, rutas solo relativas si corresponde).
- Revisa el bundle final en busca de sinks (`grep` de `dangerouslySetInnerHTML`, `innerHTML=`, `eval(`) y confirma que el contenido no procede del usuario.

---

## Fase 7 — CORS (mitiga: robo de datos entre orígenes)

### 7.1 Whitelist estricta, nunca reflexión

- `Access-Control-Allow-Origin` debe ser una **whitelist explícita**, no reflejar el `Origin` de la petición.
- Prohibido permitir `Origin: null`.
- Los dominios permitidos deben coincidir exactamente: `https://TARGET` sí, `https://TARGET.evil.com` **no**, `https://evilTARGET` **no**.
- `Access-Control-Allow-Credentials: true` **solo** junto a un `allow-origin` concreto de la whitelist (sin él, el navegador bloquea igual, pero no lo dejes ambiguo).

```python
# FastAPI CORSMiddleware (ejemplo)
allow_origins=["https://TARGET"],
allow_credentials=True,
allow_methods=["GET","POST"],
allow_headers=["Content-Type","Authorization"],
```

- **Nunca** `allow_origins=["*"]` con `allow_credentials=True`.

---

## Fase 8 — Otras inyecciones y fallos de configuración (mitiga: SQLi residual, NoSQL, comandos, SSRF, secrets)

### 8.1 Búsqueda de secretos en el repo y el bundle

- Revisa el código y el bundle en busca de secretos. **Públicos por diseño y NO son fallos**: DSN de Sentry, sitekey de Turnstile/reCAPTCHA, GA ID, `pk_` de Stripe, anon key de Supabase. **Sí son fallos**: `sk_`, `service_role`, credenciales de BD, secretos de firma, JWT con firma embebida.
- Nunca commits de `.env`, `config.json`, `*.pem`, `docker-compose.yml` con credenciales.
- Rota cualquier secreto que aparezca en un commit o bundle.

### 8.2 Gestión de secretos

- Variables de entorno en el servidor, nunca en el cliente. Prefijos `VITE_`/`NEXT_PUBLIC_` son públicos por diseño — no pongas secretos reales detrás de ellos.
- Usa un gestor de secretos (env, vault, secret manager del cloud) y rota periódicamente.

### 8.3 Ficheros y rutas expuestos

- Bloquea `/docs`, `/openapi.json`, `/redoc`, `/admin`, `/.env`, `/.git/config` en producción, o protégelos por red/autenticación.
- **Sourcemaps**: desactiva la generación de `.map` en el build de producción (la skill de pentesting muestra que exponen el código fuente original).

### 8.4 Dependencias y versiones

- Mantén dependencias actualizadas y escaneadas (SCA: `npm audit`, `pip-audit`, Dependabot).
- Revisa el desplegado por vulnerabilidades conocidas en el framework y el servidor.

---

## Fase 9 — Mitigación de DoS (mitiga: saturación de workers, agotamiento de recursos)

La skill de pentesting demuestra condiciones con peticiones mínimas (profundidad de anidamiento ~1.000, cuerpos de unos KB, 3 conexiones). Ciérralas:

### 9.1 Orden de middleware

- **Rate limit y límites de tamaño/profundidad ANTES del parseo/validación costosa.** Si la validación del cuerpo precede al rate limit, las peticiones malformadas consumen CPU sin gastar cuota (bypass demostrado A/B/C: `429, 500, 429`).
- El chequeo de autenticación debe preceder a la validación del cuerpo en endpoints autenticados (devolver `401` sin parsear).

### 9.2 Límites del parser

- Profundidad máxima de JSON (p. ej. 100–200) y límite de claves.
- Tamaño de cuerpo máximo (`413`).
- **Descompresión**: limita la ratio de compresión (zip bomb) y el tamaño tras descomprimir.

### 9.3 Timeouts y concurrencia

- Timeouts de petición y de lectura en el servidor web y el proxy (mitiga slowloris).
- Límites de workers/pool razonables con cola acotada.

### 9.4 Cargas costosas

- Paginación con **límite máximo** (`page_size` ≤ 100, nunca sin tope ni `-1`).
- Colas/trabajos asíncronos para generación de PDF/Excel, procesamiento de imágenes, importaciones masivas.
- Revisa regex para ReDoS (cuantificadores anidados `(a+)+`) y usa un límite de tiempo si aplica.

---

## Fase 10 — Logging, monitoreo y respuesta

### 10.1 Logging seguro

- Registra eventos de seguridad: login exitoso/fallido, cambio de contraseña, logout, intentos de acceso denegado (`403`), rate limit alcanzado.
- **Nunca registres** contraseñas, tokens, cookies o datos PII en claro.
- Incluye IDs de correlación y timestamp; usa formato estructurado.

### 10.2 Detección y alertas

- Alerta sobre: ráfagas de `401`/`403`, picos de `500` en endpoints no autenticados, rate limit alcanzado, peticiones con payloads malformados recurrentes.
- Monitoriza la **latencia de un endpoint de la API** (no solo del estático) como señal de saturación temprana.

### 10.3 Recuperación y verificación

- Plan de rollback por cambio. Al aplicar mitigaciones, define cómo verificar cada control post-despliegue (ver fase 11).

---

## Fase 11 — Verificación y regresión

Cada mitigación debe verificarse con la técnica que usaría la skill `pentesting`. Confirma que **el control resiste** y que no rompió la funcionalidad:

```bash
# Cabeceras presentes y correctas
curl -s -I https://TARGET | grep -iE 'strict-transport|content-security|x-content-type|x-frame'

# Rate limit activo (debe aparecer 429 tras N peticiones)
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code} " -X POST "$B/auth/login" \
  -H 'Content-Type: application/json' -d '{"email":"t@t.com","password":"x"}'; done; echo

# CORS: solo los orígenes de la whitelist reciben allow-origin
for o in "https://TARGET" "https://evil.com" "null" "https://TARGET.evil.com"; do
  curl -s -o /dev/null -D - -X OPTIONS -H "Origin: $o" \
    -H 'Access-Control-Request-Method: POST' "$B/auth/login" 2>/dev/null \
    | grep -i 'access-control-allow-origin' | tr -d '\r'
done

# Límite de profundidad JSON (debe rechazarse limpiamente, no 500)
python3 -c "print('['*2000 + ']'*2000)" > deep.json
curl -s -o /dev/null -w "%{http_code}\n" -m 30 -X POST "$B/auth/login" \
  -H 'Content-Type: application/json' --data-binary @deep.json
```

Ideas de regresión (deben seguir funcionando):
- Login, registro, recuperación de contraseña con el rate limit activo (no romper el flujo legítimo).
- CORS: la app real sigue pudiendo llamar a la API.
- `ORDER BY` con whitelist: las columnas permitidas siguen ordenando.

---

## Fase 12 — Informe de seguridad

Escribe un `.md` con esta estructura:

```markdown
# Informe de Seguridad — <Sistema>

**Stack / Objetivo / Fecha / Alcance / Modelo de amenaza**

## 1. Resumen ejecutivo
Postura global + tabla de controles (#, vector OWASP, control, estado, verificación).
Indica explícitamente lo NO cubierto y por qué.

## 2. Superficie y modelo de amenaza
Inventario de la app, datos protegidos, actores atacantes.

## 3. Controles implementados
Por vector (OWASP Top 10): qué se implementó, dónde (fichero), y cómo se verificó
(comando + resultado). Incluye tanto lo nuevo como lo que ya existía y se confirmó.

## 4. Riesgos residuales
Tabla: vector · control actual · riesgo restante · qué se necesitaría para cerrarlo.

## 5. Plan de acción pendiente
Priorizado P0–P3 con esfuerzo estimado y comandos de verificación post-despliegue.
```

### Reglas de calidad

**No infles.** Un control razonable que no es perfecto no es un «riesgo crítico» sin contexto del modelo de amenaza.

**Vincula cada control a su vector.** Cada mitigación debe poder trazarse al vector de ataque que cierra (de la skill `pentesting`/OWASP), para que el lector entienda la cadena.

**Verificación demostrable.** Cada control incluye el comando y resultado que lo confirman — no afirmaciones genéricas.

**Sé honesto con los residuales.** Un riesgo residual bien documentado vale más que un informe que lo ignora.

**Documenta los cambios.** Lista cada modificación con su estado previo (rollback posible).

---

## Errores frecuentes que debes evitar

| Error | Corrección |
|---|---|
| Confiar en el enforcement del cliente | El servidor debe replicar la matriz de permisos por cada petición |
| Validar el CAPTCHA solo en el cliente | Debe validarse en servidor; un token falso debe fallar |
| Poner el rate limit después del parseo del body | Las peticiones malformadas lo evaden — ponlo antes |
| Guardar la sesión/token en `localStorage` | XSS lo roba; usa cookie `HttpOnly` o token en memoria |
| Tratar `SameSite` como protección CSRF completa | Añade un token anti-CSRF; `SameSite` solo lo atenúa |
| `allow_origins=["*"]` con `allow_credentials=True` | Incompatible y peligroso; usa whitelist explícita |
| Reportar claves públicas como fallo | Sentry DSN, sitekey, GA ID, `pk_`, anon key son públicos por diseño |
| Dejar sourcemaps en producción | Exponen el código fuente original |
| Escapar por contexto solo en una capa | Usa parametrización (SQL) + escape en salida (HTML) + whitelists |
| Sin límite de profundidad/tamaño de JSON | Permite DoS por amplificación (10 KB → ~800× CPU) |
| Sin expiración/rotación de tokens de flujo secundario | Tokens reutilizables o de alcance amplio son escalada |
| Registrar contraseñas o tokens | Nunca registrar credenciales ni PII en claro |

---

## Referencia rápida

```bash
# Cabeceras de seguridad a exigir
curl -s -I https://TARGET | grep -iE 'strict-transport|content-security|x-content-type|x-frame|referrer'

# Verificar que el rate limit funciona
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code} " \
  -X POST "$B/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"t@t.com","password":"x"}'; done; echo

# Verificar que el límite de profundidad JSON rechaza sin 500
python3 -c "print('['*2000 + ']'*2000)" > deep.json
curl -s -o /dev/null -w "%{http_code}\n" -m 30 -X POST "$B/auth/login" \
  -H 'Content-Type: application/json' --data-binary @deep.json

# Verificar CORS solo con whitelist
for o in "https://TARGET" "https://evil.com" "null"; do
  curl -s -o /dev/null -D - -X OPTIONS -H "Origin: $o" \
    -H 'Access-Control-Request-Method: POST' "$B/auth/login" 2>/dev/null \
    | grep -i 'access-control-allow-origin' | tr -d '\r'
done
```

Sigue los estándares relevantes: OWASP Top 10 y OWASP ASVS para el detalle de cada control, y el framework de tu stack (FastAPI security, Spring Security, etc.) para la implementación concreta. El informe va al directorio del proyecto; los artefactos temporales de verificación, al scratchpad de la sesión.
