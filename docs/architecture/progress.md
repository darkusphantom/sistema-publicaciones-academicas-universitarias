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

## En progreso

| Ítem | Nota |
| --- | --- |
| Fase Frontend (datos estáticos) | En curso — ver tarjeta Trello «Fase Frontend» |

## Pendiente

| Ítem | Depende de | Nota |
| --- | --- | --- |
| Instalar `shadcn/ui` + `next-themes` | — | Implementación de la bienvenida usó primitivos propios (Button, iconos, tema con store externo); evaluar migración como refactor cuando se instalen |
| `src/data/*` (posts, users, session) + tests | — | Mock con la forma del modelo futuro (carpeta creada, contenido pendiente) |
| `src/lib/{types,visibility,filters}.ts` + tests | — | Regla del feed, filtros, orden DESC |
| `src/lib/repositories/*` + contract tests | `src/data/*` | Interfaces + impl. estática + adaptadores in-memory |
| `src/test/` (factories, fixtures, render, in-memory) | — | Helpers de test (no cuentan cobertura; carpeta creada, contenido pendiente) |
| Cambiar §4 de `frontend-structure.md` por apuntador | — | El estado ya vive aquí |
| Registrar carpeta `src/components/landing/` en arquitectura | — | Nueva carpeta creada por la bienvenida, no contemplada en `frontend-structure.md` |
| Layout shell `(main)` + `Navbar`/`BottomNav`/`Footer` + tests | shadcn/ui, next-themes | Footer y ThemeToggle existen (bienvenida); faltan Navbar/BottomNav autenticados |
| Pantallas: login/registro, feed, posts, perfil, admin + tests | layout shell | Bienvenida `/` implementada; resto pendiente |
| Reescribir smoke tests con `vi.mock` | pantallas reales | repos/`next-themes`/`next/navigation` |
| Ajustar umbrales/exclusiones `vitest.config.mts` + `typecheck` en Husky | pantallas + tests | p. ej. excluir `ui/**`/`app/**`, `lib/`/`data/` ≥ 90% |
| Backend (PostgreSQL) + auth | fase frontend | Better Auth, Server Actions, contrato de repositorio |

## Estado de tests

| Suite | Resultado | Cobertura |
| --- | --- | --- |
| Smoke de rutas + `format` | 12/12 pasan | 100% (stmts/branches/funcs/lines) |
| Suite completa (15 archivos, 125 tests) | 125/125 pasan | 100% stmts/branches/funcs/lines (incluye bienvenida, onboarding, theme, button, parallax, footer, landing) |

## Registro de cambios (últimos)

- **2026-09-25 — Pantalla de Bienvenida `/` basada en Slider Mobile-First (Rediseño)**: se actualizó la especificación `docs/design/welcome.md` y se implementó la nueva pantalla de bienvenida basada en un deslizante interactivo (`LandingSlider`, `SlideCard`, `SlideIndicators`, `LandingHeader`, `LandingFooter`). Incluye soporte de gestos táctiles (swipe), navegación por teclado (`←`/`→`), temas neutros oscuros (charcoal `#0B0F19` base con acentos ámbare e institucionales), accesibilidad WCAG 2.2 AA (ARIA carousel pattern, 44px touch targets) y guard de onboarding (`facy:onboarding`). Se agregaron 132 pruebas unitarias pasando al 100%, lint sin errores y compilación estática de Next.js (`pnpm build`) totalmente exitosa.
- **2026-09-25 — Integración visual y arquitectónica de bienvenida `/`**: se implementó el layout independiente `src/app/(landing)/layout.tsx` sin heredar el shell principal, y se integraron las 4 ilustraciones vectoriales generadas (`facyt_hero_gazette.png`, y pilares). Se configuró el Hero en layout grid de 2 columnas. Lint OK, cobertura mantenida al 100% (tests de parallax actualizados para ignorar assets decorativos con false).
- **2026-09-25 — Pantalla de bienvenida `/` implementada**: spec de diseño persistida en `docs/design/welcome.md` (+ `wireframes.md` §2.1); developer implementó parallax vertical CSS-first (scroll-driven, respeta `prefers-reduced-motion`), guard de onboarding `facy:onboarding` (primer ingreso vs. recurrente → `/login`), copy aprobado, tokens claro/oscuro, `theme.ts` (store externo, sin `next-themes`), primitivos propios (`button`, iconos). Lint OK, 125 tests, cobertura 100%, build `/` estático. Desvío: carpeta nueva `src/components/landing/` por registrar en arquitectura. Se usaron primitivos propios en lugar de shadcn/ui + next-themes (no instalados), decisión documentada en Trello.
- **2026-09-25 — Esqueleto de estructura + skill de contexto**: se crearon carpetas base de la arquitectura objetivo y la skill `project-context`; se definió que `frontend-structure.md` es inmutable y el estado vive aquí.
- **2026-09-24 — Scaffold**: arranque de Next.js y tooling; gate Husky funcional.