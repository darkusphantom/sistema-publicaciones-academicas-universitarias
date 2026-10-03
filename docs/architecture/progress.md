# Progreso — Red FaCyT

Archivo **dinámico** de seguimiento: refleja el estado real de implementación. Se actualiza **siempre** tras cada implementación, corrección o prueba (regla definida en la skill `project-context`).

> La arquitectura vive en `docs/architecture/frontend-structure.md` (inmutable tras implementarse). Aquí se registra el estado y los cambios.

## Implementado

| Ítem | Detalle | Fecha |
| --- | --- | --- |
| Scaffold Next.js + tooling | Next.js 16 (App Router), TS, Tailwind v4, Vitest, ESLint, PNPM | 2026-09-24 |
| Gate de calidad Husky | Pre-commit: `pnpm lint` + `pnpm test:coverage` (umbral ≥ 80%) | 2026-09-24 |
| Route groups base | `(landing)`, `(auth)`, `(main)` con pages placeholder | 2026-09-24 |
| `globals.css` + layout raíz | Tailwind + metadata global | 2026-09-24 |
| `src/lib/format.ts` + tests | Utilidades puras (colocated) | 2026-09-24 |
| Smoke tests de rutas | `src/__tests__/routes.smoke.test.tsx` (12 tests, 100% cobertura) | 2026-09-24 |
| Arquitectura frontend | `docs/architecture/frontend-structure.md` (estructura objetivo, colocated) | 2026-09-25 |
| Esqueleto de carpetas | `src/components/{ui,layout,feed,forms,shared}`, `src/data`, `src/test`, `src/lib/repositories`, rutas `(main)/posts/{new,[id]}` + `admin` | 2026-09-25 |
| Skill de contexto del proyecto | `.opencode/skills/project-context/SKILL.md` (lectura obligatoria + documentación post-implementación) | 2026-09-25 |
| Pantalla de bienvenida `/` (spec `docs/design/welcome.md`) | Parallax vertical CSS-first + guard de onboarding (`localStorage facy:onboarding` → `/login`), copy final aprobado, tokens claro/oscuro, `theme.ts` store externo, `button.tsx`/iconos propios, `theme-toggle`, `footer`, `(landing)` top-bar. Spec preexistente en `wireframes.md` §2.1 | 2026-09-25 |
| Vista de autenticación `/login` y `/register` | Formularios accesibles (`Field`, `FormAlert`), validación pura (`validateLogin`, `validateRegister`), repositorio estático en-memoria (`StaticAuthGateway`), navegación protegida (`AuthGuard`) redirigiendo a `/feed`. Ver reporte en `docs/tests/auth-integration-report.md`. | 2026-09-26 |
| Diseño del feed `/feed` | Especificación completa en `docs/design/wireframes_feed.md` (shell `(main)`, wireframes, contratos `Post`/`PostFilters`, filtros, componentes, a11y, tokens, guía de archivos). `wireframes.md` §3.1 pasa a puntero; `components.md` sin tocar. | 2026-10-02 |
| `src/lib/types.ts` — tipos del feed | `PostCategory`, `PostType`, `PostVisibility`, `Post`, `PostFilters`, `DEFAULT_POST_FILTERS`, `POSTS_PAGE_SIZE`, `AuthorOption` agregados sin tocar tipos existentes. | 2026-10-02 |
| `src/lib/visibility.ts` + tests | `canViewPost` y `filterVisiblePosts` — regla completa del feed (publicado/borrador/oculto). 16 tests. | 2026-10-02 |
| `src/lib/filters.ts` + tests | `normalizeSearchText`, `fromSearchParams`, `toSearchParams`, `applyFilters` (orden DESC), `countActiveFilters`, `isDateRangeValid`, `describeActiveFilters`. 40 tests. | 2026-10-02 |
| `src/data/users.ts` | Ampliado a 5 usuarios: 1 admin, 1 profesor, 3 estudiantes. | 2026-10-02 |
| `src/data/posts.ts` | 12 publicaciones mock (6 publicado, 2 borrador del usuario sesión, 1 publicado propio, 1 oculto, 2 fuera del rango de marzo 2026). | 2026-10-02 |
| `src/lib/repositories/post-repository.ts` | Interfaces hexagonales `PostRepository` (`findVisible`, `findById`) y `UserRepository` (`listAuthors`). Desvío `findAll→findVisible` documentado. | 2026-10-02 |
| `src/lib/repositories/post-repository.static.ts` | `StaticPostRepository` y `StaticUserRepository` sobre mocks. | 2026-10-02 |
| `src/lib/repositories/post-repository.contract.test.ts` | 12 contract tests: visibilidad por rol, orden DESC, paginación, filtros, findById, listAuthors. | 2026-10-02 |
| `src/lib/session/session-provider.tsx` | `SessionProvider` + `useSession()` — estados loading/authenticated/anonymous, redirección `replace("/login")`. | 2026-10-02 |
| `src/components/ui/icons.tsx` | 8 iconos nuevos: `HomeIcon`, `PlusIcon`, `UserIcon`, `ShieldIcon`, `SearchIcon`, `SlidersIcon`, `LockIcon`, `CalendarIcon`. | 2026-10-02 |
| `src/components/ui/badge.tsx` | Badge con 5 tonos semánticos sobre `--surface-muted`. | 2026-10-02 |
| `src/components/ui/select-field.tsx` | SelectField nativo accesible (label visible, aria-describedby, min-h-11). | 2026-10-02 |
| `src/components/layout/navbar.tsx` | Navbar sticky autenticada: marca, enlaces por rol, CTA accent, ThemeToggle, menú de cuenta con Escape/click-fuera. | 2026-10-02 |
| `src/components/layout/bottom-nav.tsx` | BottomNav fija móvil: 4 destinos (3 para no-admin), md:hidden, aria-current. | 2026-10-02 |
| `src/app/(main)/layout.tsx` | Shell layout autenticado: skip link, SessionProvider, Navbar, main, BottomNav, Footer. | 2026-10-02 |
| `src/components/shared/empty-state.tsx` + tests | EmptyState reutilizable (icono, título, descripción, acción Link/button). 5 tests. | 2026-10-02 |
| `src/components/feed/post-card.tsx` + tests | PostCard servidor: stretched-link, badges, extracto line-clamp-3, notas de visibilidad. 8 tests. | 2026-10-02 |
| `src/components/feed/filter-bar.tsx` | FilterBar cliente: búsqueda 300ms debounce, panel colapsable móvil, selectores nativos, filtro Estado condicional, error de rango de fechas. | 2026-10-02 |
| `src/components/feed/load-more.tsx` + tests | LoadMore paginación acumulativa: solo visible cuando shown < total, lote en label. 5 tests. | 2026-10-02 |
| `src/components/feed/feed-view.tsx` | FeedView orquestador cliente: sesión, repositorios, URL params, paginación, estados vacíos, contador role="status". | 2026-10-02 |
| `src/app/(main)/feed/page.tsx` | Página /feed Server Component: parsea searchParams, pre-carga autores, key reset de paginación. | 2026-10-02 |

## En progreso

| Ítem | Nota |
| --- | --- |
| Fase Frontend (datos estáticos) | En curso — ver tarjeta Trello «Fase Frontend» |

## Pendiente

| Ítem | Depende de | Nota |
| --- | --- | --- |
| Reescribir smoke tests con `vi.mock` | pantallas reales | repos/`next-themes`/`next/navigation` |
| Ajustar umbrales/exclusiones `vitest.config.mts` + `typecheck` en Husky | pantallas + tests | p. ej. excluir `ui/**`/`app/**`, `lib/`/`data/` ≥ 90% |
| Backend (PostgreSQL) + auth | fase frontend | Better Auth, Server Actions, contrato de repositorio |

## Estado de tests

| Suite | Resultado | Cobertura |
| --- | --- | --- |
| Smoke de rutas + `format` | 6/6 pasan (actualizado para FeedPage async) | — |
| Dominio del feed (`visibility` + `filters` + contract) | 68/68 pasan | 100% |
| Componentes del feed (`PostCard` + `LoadMore` + `EmptyState`) | 18/18 pasan | — |
| Suite completa (25 archivos, 237 tests) | 237/237 pasan | ≥ 80% global |

## Registro de cambios (últimos)

- **2026-10-02 — Implementación completa del feed `/feed`**: implementadas todas las fases del plan: (1) Dominio puro — `visibility.ts`, `filters.ts` (68 tests, 100%); (2) Datos — `users.ts` ampliado a 5 usuarios, `posts.ts` con 12 publicaciones mock; (3) Repositorios hexagonales — interfaces `PostRepository`/`UserRepository` + implementaciones estáticas + 12 contract tests; (4) Shell `(main)` — `SessionProvider`, `Navbar`, `BottomNav`, `(main)/layout.tsx`; (5) Primitivos UI — `Badge`, `SelectField`, 8 iconos nuevos; (6) Componentes del feed — `EmptyState` (5 tests), `PostCard` (8 tests), `FilterBar`, `LoadMore` (5 tests), `FeedView`; (7) Página `/feed` Server Component con `searchParams` async. Instalado `@testing-library/user-event`. Smoke test de `FeedPage` actualizado a firma async. Build exitoso: `/feed` como ruta dinámica `ƒ`. Suite: **237/237 tests, 25 archivos, 0 fallos**. Desvíos registrados: `findAll→findVisible` en repositorio (documentado en JSDoc), `FeedView` no figuraba en `frontend-structure.md` (agregado), `src/components/landing/` sin registrar en arquitectura (pendiente).
- **2026-09-26 — Vista de Autenticación `/login` y `/register`**: Implementados los formularios de inicio de sesión y registro siguiendo `docs/design/auth.md`. Desarrollo en TDD: funciones de validación puras, componentes UI accesibles (`Field` y `FormAlert` con ARIA-live alert y labels vinculados), `StaticAuthGateway` imitando el backend con promesas, y componente `AuthGuard` para redirigir si ya hay sesión. 151 tests pasando al 100%, lint sin warnings y cobertura superando umbrales configurados.
- **2026-09-25 — Pantalla de Bienvenida `/` basada en Slider Mobile-First (Rediseño)**: se actualizó la especificación `docs/design/welcome.md` y se implementó la nueva pantalla de bienvenida basada en un deslizante interactivo (`LandingSlider`, `SlideCard`, `SlideIndicators`, `LandingHeader`, `LandingFooter`). Incluye soporte de gestos táctiles (swipe), navegación por teclado (`←`/`→`), temas neutros oscuros (charcoal `#0B0F19` base con acentos ámbare e institucionales), accesibilidad WCAG 2.2 AA (ARIA carousel pattern, 44px touch targets) y guard de onboarding (`facy:onboarding`). Se agregaron 132 pruebas unitarias pasando al 100%, lint sin errores y compilación estática de Next.js (`pnpm build`) totalmente exitosa.
- **2026-09-25 — Integración visual y arquitectónica de bienvenida `/`**: se implementó el layout independiente `src/app/(landing)/layout.tsx` sin heredar el shell principal, y se integraron las 4 ilustraciones vectoriales generadas (`facyt_hero_gazette.png`, y pilares). Se configuró el Hero en layout grid de 2 columnas. Lint OK, cobertura mantenida al 100% (tests de parallax actualizados para ignorar assets decorativos con false).
- **2026-09-25 — Pantalla de bienvenida `/` implementada**: spec de diseño persistida en `docs/design/welcome.md` (+ `wireframes.md` §2.1); developer implementó parallax vertical CSS-first (scroll-driven, respeta `prefers-reduced-motion`), guard de onboarding `facy:onboarding` (primer ingreso vs. recurrente → `/login`), copy aprobado, tokens claro/oscuro, `theme.ts` (store externo, sin `next-themes`), primitivos propios (`button`, iconos). Lint OK, 125 tests, cobertura 100%, build `/` estático. Desvío: carpeta nueva `src/components/landing/` por registrar en arquitectura. Se usaron primitivos propios en lugar de shadcn/ui + next-themes (no instalados), decisión documentada en Trello.
- **2026-09-25 — Esqueleto de estructura + skill de contexto**: se crearon carpetas base de la arquitectura objetivo y la skill `project-context`; se definió que `frontend-structure.md` es inmutable y el estado vive aquí.
- **2026-09-24 — Scaffold**: arranque de Next.js y tooling; gate Husky funcional.