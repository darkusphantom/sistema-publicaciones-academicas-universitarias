# Arquitectura de Frontend — Red FaCyT

Guía de implementación de la fase frontend (datos estáticos). Define la **estructura objetivo** del frontend, de modo que sirva de hoja de ruta para migrar a backend sin rework.

> **Este documento es INMUTABLE una vez implementado:** describe la arquitectura objetivo y las convenciones. El estado real de implementación vive en [`progress.md`](progress.md) (dinámico) y se actualiza tras cada cambio. No edites este archivo como parte de una tarea de desarrollo; solo con aprobación explícita de un refactor de arquitectura.

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

Estructura **colocated**: cada test vive junto al código que verifica; `src/test/` centraliza solo helpers de test (factories, fixtures, render, adaptadores in-memory) y `__tests__/` queda reservado para los smoke tests de rutas. Los tests del espejo de carpetas no están duplicados: es una visual del código fuente, y cada `*.test.*` se crea junto a su módulo.

```
src/
├── app/                          → RUTA GROUPS — páginas, layouts y metadata
│   ├── layout.tsx                ✓ Layout raíz (metadata, ThemeProvider, .dark)
│   ├── globals.css               ✓ Tokens claro/oscuro + Tailwind
│   ├── (landing)/                → Público: /
│   │   └── page.tsx              ✓ placeholder → Bienvenida (hero editorial)
│   ├── (auth)/                   → Público
│   │   ├── login/page.tsx        ✓ placeholder → LoginForm
│   │   └── register/page.tsx     ✓ placeholder → RegisterForm
│   └── (main)/                   → Autenticado
│       ├── layout.tsx            → shell autenticado (Navbar + BottomNav + Footer)
│       ├── feed/page.tsx         ✓ placeholder → Feed
│       ├── posts/
│       │   ├── new/page.tsx      → crear publicación (PostForm)
│       │   └── [id]/page.tsx     → detalle / edición (/posts/[id]/edit)
│       ├── profile/
│       │   └── [username]/page.tsx  ✓ placeholder → perfil
│       └── admin/page.tsx        → roles/permisos (simulada, solo admin)
│
├── components/                   → UI DE DOMINIO — cobertura global
│   ├── ui/                       → shadcn/ui primitivos (Button, Card, Dialog, …)
│   ├── layout/                   → estructura de navegación
│   │   ├── navbar.tsx            + navbar.test.tsx          (colocated)
│   │   ├── bottom-nav.tsx
│   │   ├── sidebar.tsx
│   │   ├── theme-toggle.tsx      + theme-toggle.test.tsx    (aria-pressed)
│   │   └── footer.tsx
│   ├── feed/                     → tarjetas y filtros del feed
│   │   ├── post-card.tsx         + post-card.test.tsx       (badges/visibilidad/acciones)
│   │   ├── post-detail.tsx       + post-detail.test.tsx
│   │   └── filter-bar.tsx        + filter-bar.test.tsx      (filtros combinados + contador)
│   ├── forms/
│   │   ├── login-form.tsx        + login-form.test.tsx      (validación inline + resumen)
│   │   ├── register-form.tsx     + register-form.test.tsx
│   │   └── post-form.tsx         + post-form.test.tsx
│   └── shared/                   → reutilizables sin dominio
│       ├── empty-state.tsx       + empty-state.test.tsx
│       └── pagination.tsx
│
├── lib/                          → LÓGICA PURA — cobertura alta
│   ├── format.ts                 ✓ + format.test.ts   ✓ (colocated, existe)
│   ├── types.ts                  → Post, User, Session, PostFilters (compartidos)
│   ├── visibility.ts             + visibility.test.ts    → regla del feed
│   ├── filters.ts                + filters.test.ts       → filtros combinados + orden DESC
│   └── repositories/             → CONTRATO hexagonal (interfaz ≠ implementación)
│       ├── post-repository.ts            → interfaz PostRepository
│       ├── post-repository.static.ts     → impl. estática sobre src/data
│       ├── post-repository.contract.test.ts → vs in-memory (hoy) y Supabase (CI)
│       ├── user-repository.ts            → interfaz
│       └── user-repository.static.ts
│
├── data/                         → DATOS ESTÁTICOS mock (misma forma que el modelo futuro)
│   ├── posts.ts                  + posts.test.ts    (integridad de fixtures)
│   ├── users.ts                  + users.test.ts
│   └── session.ts                → usuario de la sesión ficticia
│
├── test/                         → HELPERS de test (NO son tests — no cuentan cobertura)
│   ├── factories.ts              → makePost(), makeUser(), makeSession()
│   ├── fixtures.ts               → datasets tipados (feed, escenario de filtros)
│   ├── render.tsx                → renderWithProviders(ui, { theme, repos })
│   └── in-memory-repositories.ts → adaptadores in-memory de las interfaces del contrato
│
└── __tests__/                    → SOLO SMOKE de rutas (montan sin error)
    └── routes.smoke.test.tsx     ✓ existe → se reescribe con vi.mock al tener pantallas
```

**Leyenda:** `✓` = ya existe hoy · `+ archivo.test.*` = test colocated que se crea junto al código · sin marca = objetivo por implementar.

### Convenciones

- **Código en inglés**: nombres de archivos, identificadores, strings de interfaz en `src/`.
- **UI en español**: todo texto visible al usuario va en español.
- **JSDoc obligatorio** en toda función/componente público.
- **Server Components por defecto**; `'use client'` solo donde haya interacción (forms, ThemeToggle, filtros).
- **Colocation de tests**: `module.ts` → `module.test.ts` en la misma carpeta. Solo `__tests__/` y `src/test/` escapan a esta regla (smoke de rutas y helpers, respectivamente).
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

## 4. Estado del repositorio

El estado real de implementación **no vive en este archivo**. Consulta [`progress.md`](progress.md): contiene las secciones Implementado / En progreso / Pendiente, el estado de tests y el registro de cambios, y se actualiza tras cada implementación (regla de la skill `project-context`).

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
3. Crear el esqueleto base: carpetas `src/components/{layout,feed,forms,shared,ui}`, `src/data`, `src/test` y `src/lib/repositories`.
4. Crear el núcleo de lógica (TDD): `src/lib/types.ts`, `src/lib/visibility.ts`, `src/lib/filters.ts`, `src/data/*` y `src/lib/repositories/` (contract tests primero) + `src/test/` (factories, fixtures, render, in-memory).
5. Layout shell: layouts de `(landing)`, `(auth)` y `(main)` + `Navbar`/`BottomNav`/`Footer` y sus tests colocated.
6. Pantallas en orden: bienvenida → login/registro → feed (`PostCard`/`FilterBar`) → crear/detalle/edición → perfil → admin, cada una con su `*.test.tsx` colocated.
7. Reescribir `src/__tests__/routes.smoke.test.tsx` con `vi.mock` (repositorios, `next-themes`, `next/navigation`).
8. Ajustar umbrales y exclusions de cobertura en `vitest.config.mts` (p. ej. excluir `ui/**` y `app/**`, ramas 75% heavy-UI, `lib/`/`data/` al 90%) y añadir `typecheck` al hook Husky.
9. Actualizar `docs/architecture/progress.md` al finalizar cada paso (estado real). Este archivo solo cambia por refactor de arquitectura aprobado.