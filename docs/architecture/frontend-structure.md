# Arquitectura de Frontend — Red FaCyT

Guía de implementación de la fase frontend (datos estáticos). Define la **estructura objetivo** del frontend y el estado actual del repositorio, de modo que sirva de hoja de ruta para migrar a backend sin rework.

Fuentes de referencia:

- [`docs/design/brief.md`](../design/brief.md) — identidad editorial, paleta y contenido.
- [`docs/design/components.md`](../design/components.md) — design tokens y inventario de componentes.
- [`docs/design/wireframes.md`](../design/wireframes.md) — mapa de navegación y esquemas por pantalla.
- [`docs/design/accessibility.md`](../design/accessibility.md) — WCAG 2.2 AA por pantalla.
- [`docs/implementation/implementation_base.md`](../implementation/implementation_base.md) — requisitos del MVP.

## 1. Stack y decisiones

| Decisión | Elección | Nota |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server Components por defecto |
| Lenguaje | TypeScript 5 | Código en inglés, UI en español |
| Estilos | Tailwind CSS 4 + CSS variables | Tokens semánticos, sin `hex` suelto |
| Componentes UI | shadcn/ui *(pendiente de instalar)* | Prima radix accesible |
| Temas | `next-themes` *(pendiente de instalar)* | Clase `.dark`, persistencia en `localStorage` |
| Tests | Vitest 5 + Testing Library | Umbral de cobertura v8 ≥ 80% |
| Calidad | Husky pre-commit | `pnpm lint` + `pnpm test:coverage` |
| API (futuro) | Server Actions | No implementar hasta la fase backend |
| Datos | Estáticos en `src/data/` | Con patrón repositorio para migrar sin rework |

## 2. Estructura de directorios objetivo

```
src/
├── app/
│   ├── (landing)/                 # Público: /
│   │   └── page.tsx               #   bienvenida (hero editorial)
│   ├── (auth)/                    # Público: /login, /register
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                    # Autenticado
│   │   ├── feed/page.tsx          #   /feed (dashboard)
│   │   ├── posts/
│   │   │   ├── new/page.tsx       #   /posts/new (crear)
│   │   │   └── [id]/page.tsx      #   /posts/[id] (detalle/edición)
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   ├── admin/page.tsx         #   /admin (roles/permisos)
│   │   └── layout.tsx             #   shell autenticado (Navbar, Footer)
│   ├── layout.tsx                 # Layout raíz (metadata, ThemeProvider, .dark)
│   └── globals.css                # Tokens claro/oscuro + Tailwind
├── components/
│   ├── ui/                        # shadcn/ui primitivos (Button, Input, Card, …)
│   ├── layout/                    # Navbar, Sidebar, BottomNav, ThemeToggle, Footer
│   ├── feed/                      # PostCard, PostDetail, FilterBar
│   ├── forms/                     # LoginForm, RegisterForm, PostForm
│   └── shared/                    # EmptyState, Skeleton, Toast, Pagination
├── data/                          # Datos estáticos (mock + sesión simulada)
│   ├── users.ts
│   ├── posts.ts
│   └── session.ts                 # Usuario de la sesión ficticia
├── lib/
│   ├── format.ts                  # Utilidades puras (fechas, texto)
│   └── repositories/              # Interfaces + implementaciones estáticas
│       ├── post-repository.ts
│       ├── user-repository.ts
│       └── ...
└── __tests__/                     # Tests de rutas, pantallas y componentes
```

### Convenciones

- **Código en inglés**: nombres de archivos, identificadores, strings de interfaz en `src/`.
- **UI en español**: todo texto visible al usuario va en español.
- **JSDoc obligatorio** en toda función/componente público.
- **Server Components por defecto**; `'use client'` solo donde haya interacción (forms, ThemeToggle, filtros).
- **Patrón repositorio**: las vistas consumen *interfaces* (`PostRepository`); la implementación estática lee `src/data/`. Al llegar el backend solo cambia la implementación, no las pantallas.

## 3. Mapa de rutas

| Ruta | Grupo | Acceso | Pantalla |
| --- | --- | --- | --- |
| `/` | `(landing)` | público | Bienvenida — hero editorial institucional |
| `/login` | `(auth)` | público | Iniciar sesión |
| `/register` | `(auth)` | público | Registro (nombre, apellido, rol Estudiante/Profesor) |
| `/feed` | `(main)` | autenticado | Dashboard — feed de publicaciones con filtros |
| `/posts/new` | `(main)` | autenticado | Crear publicación |
| `/posts/[id]` | `(main)` | autenticado | Detalle completo + edición (`/posts/[id]/edit`) |
| `/profile/[username]` | `(main)` | autenticado | Perfil + publicaciones del usuario |
| `/admin` | `(main)` | solo `admin` | Gestión de roles/permisos (simulada) |

Guardas de acceso (simuladas en la fase estática, reales en backend):
- `(landing)` y `(auth)`: público.
- `(main)`: sin sesión → `/login`.
- `/admin`: sin rol `admin` → `/feed`.

Recuperación de contraseña: **fuera del MVP**.

## 4. Estado actual del repositorio

| Elemento | Estado |
| --- | --- |
| Route groups `(landing)`, `(auth)`, `(main)` | Existen con pages placeholder |
| Layout raíz + metadata | Implementado |
| `globals.css` con Tailwind | Implementado (sin tokens de tema todavía) |
| `vitest.config.mts` (gate ≥ 80%, jsdom, alias `@`) | Implementado |
| Husky pre-commit (lint + coverage) | Implementado |
| `src/lib/format.ts` + tests | Implementado |
| Smoke tests de rutas (`routes.smoke.test.tsx`) | Implementado |
| shadcn/ui | Pendiente de instalar |
| `next-themes` | Pendiente de instalar |
| `src/components/` | Pendiente de crear |
| `src/data/` + `src/lib/repositories/` | Pendiente de crear |
| Pantallas de bienvenida, login/registro, feed, posts, perfil, admin | Pendientes |
| Tests de pantallas/componentes (≥ 80%) | Pendientes |

## 5. Theming (claro/oscuro)

- Tokens como CSS variables en `globals.css`, con valores light en `:root` y dark bajo `.dark` (ver tabla en `docs/design/brief.md`).
- `--primary` (`#1E3A5F` light / `#7FA8E8` dark) para masthead/marca; `--accent` (`#2563EB` / `#60A5FA`) como único color accionable (CTAs, links, foco).
- `next-themes` con `ThemeProvider` en el layout raíz y `ThemeToggle` en la navbar.
- Aplicar `.dark` en `<html>` antes del primer pinto para evitar flash de fondo (ver `docs/design/accessibility.md` §5).
- Componentes usan **solo tokens semánticos**; prohibido `hex` suelto.

## 6. Capa de datos estáticos y visibilidad

- `src/data/` expone mock de usuarios y publicaciones con la misma forma que el modelo futuro.
- `src/lib/repositories/` define interfaces (`PostRepository.findAll`, `findById`, `save`, …) e implementaciones estáticas sobre `src/data/`.
- Visibilidad simulada (regla del feed, `docs/design/components.md` §4):

  ```
  visible = visibility === 'publicado'
         OR (author_id === sessionUser.id)
  ```

  `borrador`: badge gris, solo el autor. `oculto` (admin): nadie excepto autor y admin. La sesión ficticia vive en `src/data/session.ts`.
- Orden por defecto del feed: **fecha DESC** (más reciente primero).
- Filtros combinables sobre búsqueda por palabra clave (categoría, tipo, autor, estado, rango de fechas) — ver justificación en `docs/design/wireframes.md` §3.

## 7. Testeo

- Enfoque: tests por pantalla y por componente con Vitest + Testing Library (jsdom).
- Umbral de cobertura **≥ 80%** (líneas, funciones, ramas, sentencias) configurado en `vitest.config.mts` y exigido por Husky en cada commit.
- Generar primero los tests (TDD) para la lógica de filtrado/visibilidad (repositorios estáticos) y para el render de cada pantalla.
- Smoke tests existentes: garantizan que el App Router monta sin errores.

## 8. Hoja de ruta de implementación

Orden sugerido (alineado con la tarjeta «Fase Frontend» de Trello):

1. Instalar `shadcn/ui` (init + `components.json` + alias `@/components`) y `next-themes`.
2. Tokens claro/oscuro en `globals.css`; `ThemeProvider` + `ThemeToggle`.
3. Estructura `src/data/` y `src/lib/repositories/` con interfaces y mocks.
4. Layout shell: layouts de `(landing)`, `(auth)` y `(main)` + `Navbar`/`BottomNav`/`Footer`.
5. Pantallas en orden: bienvenida → login/registro → feed (`PostCard`/`FilterBar`) → crear/detalle/edición → perfil → admin.
6. Tests de pantallas y componentes hasta superar el umbral global ≥ 80%.
7. Documentar cambios en este archivo si la estructura evoluciona.