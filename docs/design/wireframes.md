# Wireframes — Red FaCyT (Mapa de navegación y esquemas)

Documento **maestro**: contiene el mapa de navegación, los esquemas de las
pantallas autenticadas de `(main)` y las decisiones transversales. Los wireframes
por área viven en archivos propios:

| Área                          | Archivo                                    | Especificación detallada |
| ----------------------------- | ------------------------------------------ | ----------------------- |
| Bienvenida `/`                | [`wireframes_welcome.md`](wireframes_welcome.md) | [`welcome.md`](welcome.md)   |
| Autenticación `/login`, `/register` | [`wireframes_auth.md`](wireframes_auth.md)   | [`auth.md`](auth.md)         |
| Feed `/feed`                  | [`wireframes_feed.md`](wireframes_feed.md) | [`wireframes_feed.md`](wireframes_feed.md) (documento único) |
| Posts, perfil, admin          | §3.2–§3.4 de este documento               | —                       |

> [!NOTE]
> Los wireframes de la bienvenida se movieron a `wireframes_welcome.md` y los de
> autenticación a `wireframes_auth.md` cuando el documento empezó a crecer. El
> esquema del deslizante (móvil y escritorio) reemplaza al del scroll parallax
> vertical anterior.

## 1. Mapa de navegación

```
/                          (landing) Bienvenida   [público]
├── /login                 (auth)  Autenticación [público]
├── /register              (auth)  Registro      [público]
│                               └── tras éxito → /feed
├── /feed                  (main)  Dashboard/Feed   [autenticado]
│   ├── /posts/new                 Crear publicación
│   ├── /posts/[id]                Detalle completo
│   │   └── (acción) → /posts/[id]/edit
│   ├── /profile/[username]        Perfil + publicaciones del usuario
│   └── /admin                     Gestión de roles/permisos (solo admin)
```

Reglas de acceso (a implementar como guardas en la fase de backend; simuladas en
estático):

- `(landing)` y `(auth)`: público.
- `(main)`: requiere sesión; si no hay, redirige a `/login`.
- `/admin`: solo rol `admin`; si no, redirige a `/feed`.

### 1.1 Guardas de las pantallas de autenticación

Definido en [`auth.md`](auth.md):

- `/` envía a `/login` a los visitantes recurrentes (flag `facy:onboarding`).
- Con sesión activa, `/login` y `/register` redirigen a `/feed`, de modo que no
  hay ciclos de redirección: `/login` nunca devuelve a `/`.
- Tras autenticarse o registrarse, el destino es `/feed`.

## 2. Pantallas públicas

Las pantallas de `(landing)` y `(auth)` están especificadas en
`wireframes_welcome.md` y `wireframes_auth.md` respectivamente.

## 3. Pantallas autenticadas de `(main)`

### 3.1 `/feed` Dashboard — vista principal

Especificación completa en [`wireframes_feed.md`](wireframes_feed.md): shell
`(main)` con `Navbar` y `BottomNav`, wireframes móvil y escritorio, contratos de
datos (`Post`, `PostFilters`), inventario de filtros con copy, componentes
(`PostCard`, `FilterBar`, `LoadMore`, `EmptyState`), estados, accesibilidad,
tokens y guía de archivos para el `developer`.

> [!NOTE]
> Este documento §3.1 pasó a ser un puntero cuando el feed encontró su propio
> archivo, siguiendo el mismo criterio que se aplicó con la bienvenida y la
> autenticación. El shell `(main)` se especifica allí porque el feed es su primera
> pantalla.

**Regla de visibilidad aplicada aquí (estático):** se filtran las publicaciones
con `visibility = publicado`; se incluyen `borrador` y `oculto` si `author_id`
coincide con la sesión ficticia, y `oculto` también para el rol `admin`. La regla
completa, con su tabla de las nueve combinaciones, está en
[`wireframes_feed.md`](wireframes_feed.md) §4.4.

### 3.2 `/posts/new` y `/posts/[id]` (detalle)

```
Crear:
│ Título [_____________________]
│ Categoría [▾] · Tipo [¿Puede editarse?]  ────── Desglose → Portapapeles
│ Visibilidad [● Público] [○ Borrador]
│ Contenido [_________________________
│           _________________________]
│ [ Guardar como borrador ] [ Publicar ]
│ Imagen: (bloqueo hasta backend) "Disponible en integración"

Detalle /posts/[id]:
│ [Categoría] [Artículo] [Publicado] [⋮]
│ Título (serif display)
│ Por [Autor] · 12 mar 2026 · Facultad
│ ──────────
│ contenido completo...
│                                        (autor: [Editar] [Eliminar])
│                                        (admin:  [Ocultar] [Eliminar])
```

**Edición** (`/posts/[id]/edit`): mismo layout que el formulario, con el campo
**fecha de publicación** bloqueado (regla de `implementation_base.md`); el resto
editable.

### 3.3 `/profile/[username]`

```
│ Avatar  Nombre Apellido       [rol badge]
│ @username · Bio breve
│ ─────────────────────────────
│ Publicaciones  [＋ Nueva publicación]
│ (cards del usuario, mismas reglas de visibilidad)
```

### 3.4 `/admin` (solo rol admin)

```
│ Gestión de usuarios                 [Buscar…]
│ ┌────────────┬───────────┬───────────┐
│ │ Usuario    │ Rol actual│ [▾] Cambiar│   ← asignar rol/permisos
│ │ @j.rivas   │ Estudiante│ [Profesor] │
│ │ @m.perez   │ Profesor   │ [Admin]    │
│ └────────────┴───────────┴───────────┘
```

Asignar roles es la única función de `/admin` durante el MVP. Como el registro
público no ofrece selector de rol, esta pantalla es el único punto por el que
un usuario puede pasar de `estudiante` a `profesor` o `admin`
([`auth.md`](auth.md) §10.2).

## 4. Decisión del mecanismo de filtrado (justificación)

El enunciado pide justificar el mecanismo más adecuado para una red
**institucional** de facultad.

- **Elegido:** filtros de lista **combinables** sobre una **búsqueda por palabra
  clave**, más **orden por fecha DESC** por defecto.
- **Por qué:** en una facultad el volumen de publicaciones es moderado pero
  heterogéneo (eventos, avisos, defensas, talleres). Un usuario autenticado
  busca típicamente *"defensas esta semana"* o *"talleres de mi facultad"*, que
  exige combinar categoría, tipo y rango de fechas con palabras clave. Las
  pestañas únicas (solo por categoría) obligan a perder contexto.
- **Descartado:** filtro por estado visible en el feed público (solo útil para
  admin); búsqueda avanzada full-text (bonificación, fuera del MVP).
- **Relación con el backend futuro:** estos filtros se traducen a cláusulas
  `WHERE` con índices en `category`, `type` y `published_at`. En fase estática
  son funciones de filtrado sobre `src/data`, con análisis asintótico O(n) y
  `short-circuit` evaluable en los tests.

## 5. Navegación responsive

| Breakpoint     | Comportamiento                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| < 768px        | Navbar colapsada a logo + hamburguesa; `BottomNav` con 4 destinos (Feed, Crear, Perfil, Admin si aplica)                                              |
| 768–1024px     | Navbar completa, sin sidebar                                                                                                                           |
| ≥ 1024px       | Navbar y layout de 2–3 columnas en el feed, sidebar opcional                                                                                           |
| Login y registro | Tarjeta de 400px centrada en los tres breakpoints; sin cambios por ancho de pantalla (ver `wireframes_auth.md` §4)                                      |
