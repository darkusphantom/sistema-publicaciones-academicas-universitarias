# Wireframes — Red FaCyT (Mapa de navegación y esquemas)

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

Reglas de acceso (a implementar como guardas en la fase de backend; simuladas en estático):
- `(landing)` y `(auth)`: público.
- `(main)`: requiere sesión; si no hay, redirige a `/login`.
- `/admin`: solo rol `admin`; si no, redirige a `/feed`.

## 2. Esquemas por pantalla (ASCII, mobile-first; escritorio = 2–3 columnas)

### 2.1 `/` Bienvenida (Landing Page — Público)

Introducción **parallax vertical** (5 capas) para primeros ingresos (con guard de onboarding `localStorage['facy:onboarding']`). 

> [!IMPORTANT]
> **Layout Independiente:** Utiliza el layout de `(landing)` (`LandingHeader` + `LandingFooter`). **NO renderiza la `Navbar`, `Sidebar` ni `BottomNav` del shell autenticado `(main)`.**

Ver especificación detallada en [`welcome.md`](welcome.md) — estructura de capas, copy final, a11y (WCAG 2.2 AA) y tokens.

```
┌─────────────────────────────────────────────────────────────┐
│ [FaCyT Logo]                         [🌙 Tema] [Omitir ↦]  │  ← LandingHeader (z-50)
├─────────────────────────────────────────────────────────────┤
│   FaCyT                                                     │  ← Capa 1: H1 Serif Display
│   Facultad Experimental de Ciencias y Tecnología            │
│  ─────────────────────────────────────────────────────────  │  ← Línea divisoria que se separa
│   La gaceta digital de la facultad: noticias,              │
│   avisos y vida universitaria.                              │
│   [ Empezar ]  [ Ya tengo cuenta ]                          │  ← CTA primario con --accent
│                                                             │
│   01 Noticias y avisos · 02 Académico · 03 Vida Univ.       │  ← Capa 2: Números 01/02/03 de fondo
│   Para profesores, estudiantes y administración.           │  ← Capa 3: Roles + Regla extensible
│   [ Empezar ]  [ Ya tengo cuenta ]                          │  ← Capa 4: CTA cierre
│  Marca de agua: Red FaCyT                                   │
├─────────────────────────────────────────────────────────────┤
│ © 2026 Facultad Experimental de Ciencias y Tecnología       │  ← LandingFooter
└─────────────────────────────────────────────────────────────┘
```

### 2.2 `/login` y `/register` (public)
```
┌─────────────────────────────┐
│  Iniciar sesión             │
│  [Correo o usuario        ] │
│  [Contraseña              ] │
│  [ ] Recordarme            │
│  (error inline: "Credenciales…")│
│  [ Iniciar sesión ]        │
│  ¿No tienes cuenta? Regístrate │
└─────────────────────────────┘
```
Registro añade: nombre, apellido, rol inicial (Estudiante / Profesor), confirmar contraseña. (Recuperación de contraseña: **fuera del MVP** — enlace "¿Olvidaste tu contraseña?" oculto o descartado hasta backend con email.)

### 2.3 `/feed` Dashboard (main) — vista principal
```
┌──────────────────────────────────────────────┐
│ [FaCyT]  Feed  Perfil  · ⚙  [🔍] [🌙] [👤]   │  ← Navbar
├──────────────────────────────────────────────┤
│  Publicaciones                               │
│  [Buscar publicaciones........] [＋ Nueva]   │  ← FilterBar
│  Filtros: [Categoría ▾] [Tipo ▾] [Autor ▾]   │
│           [Estado ▾] [Desde ▾] [Hasta ▾]     │
├──────────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐     │
│ │ [Categoría] [Post] [Publicado]      │     │  ← PostCard
│ │ Título de la publicación             │     │     (fecha DESC:
│ │ Autor • 12 mar 2026                 │     │      más reciente arriba)
│ │ Extracto del contenido…     [⋮]     │     │
│ └─────────────────────────────────────┘     │
│ ┌─────────────────────────────────────┐     │
│ │ [Categoría] [Artículo] [Borrador 🔒]│     │  ← solo visible para
│ │ Quédate con el otro…                │     │     el propio autor
│ │ …                                   │     │
│ └─────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
```

**Regla de visibilidad aplicada aquí (estático):** se filtran las publicaciones con `visibility = publicado`; se incluyen `borrador`/`oculto` solo si `author_id === sesión ficticia`.

### 2.4 `/posts/new` y `/posts/[id]` (detalle)
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
**Edición** (`/posts/[id]/edit`): mismo layout del formulario; bloqueado el campo **fecha de publicación** (regla de `implementation_base.md`); el resto editable.

### 2.5 `/profile/[username]`
```
│ Avatar  Nombre Apellido       [rol badge]
│ @username · Bio breve
│ ─────────────────────────────
│ Publicaciones  [＋ Nueva publicación]
│ (cards del usuario, mismas reglas de visibilidad)
```

### 2.6 `/admin` (solo rol admin)
```
│ Gestión de usuarios                 [Buscar…]
│ ┌────────────┬────────────┬───────────┐
│ │ Usuario    │ Rol actual │ [▾] Cambiar│   ← asignar rol/permisos
│ │ @j.rivas   │ Estudiante │ [Profesor] │
│ │ @m.perez   │ Profesor   │ [Admin]    │
│ └────────────┴────────────┴───────────┘
```

## 3. Decisión del mecanismo de filtrado (justificación)

El enunciado pide justificar el mecanismo más adecuado para una red **institucional** de facultad.

- **Elegido:** filtros de lista **combinables** sobre una **búsqueda por palabra clave**, más **orden por fecha DESC** por defecto.
- **Por qué:** en una facultad el volumen de publicaciones es moderado pero heterogéneo (eventos, avisos, defensas, talleres). Un usuario autenticado busca típicamente **"defensas esta semana"** o **"talleres de mi facultad"** → necesita combinar categoría + tipo + rango de fechas con palabra clave. Las pestañas únicas (solo por categoría) obligan a perder contexto.
- **Descartado:** filtro por estado visible en el feed público (solo útil para admin); búsqueda avanzada full-text (bonificación, fuera del MVP).
- **Relación con el backend futuro:** estos filtros se traducen a cláusulas `WHERE` con índices en `category`, `type` y `published_at` (ver modelo de datos). En fase estática son funciones de filtrado sobre `src/data` (análisis asintótico: O(n) con short-circuit evaluable en los tests).

## 4. Navegación responsive

| Breakpoint | Comportamiento |
| --- | --- |
| < 768px | Navbar colapsada a logo + hamburguesa; BottomNav con 4 destinos (Feed, Crear, Perfil, Admin si aplica) |
| 768–1024px | Navbar completa, sin sidebar |
| ≥ 1024px | Navbar + layout de 2–3 columnas en feed, sidebar opcional