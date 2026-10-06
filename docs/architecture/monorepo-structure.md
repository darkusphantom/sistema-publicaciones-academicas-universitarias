# Estructura del Monorepo — Red FaCyT

## Estado actual
Tras la migración Ola 1, el frontend Next.js 16 (App Router) se encuentra en `apps/web` y el backend API (Hono 4) en `apps/api`. La fase Ola 2 contempla la creación de `packages/shared` y `packages/tsconfig` para unificar taxonomía, tipos, esquemas y lógica pura.

## Estructura objetivo

```text
red-facyt/
├── apps/
│   ├── api/        # @red-facyt/api — Hono 4 + Better Auth (en memoria)
│   │   ├── src/
│   │   │   ├── application/   # Casos de uso
│   │   │   ├── config/        # Configuración/env
│   │   │   ├── domain/        # Tipos, validación, visibilidad (re-exportará desde shared tras Ola 2)
│   │   │   ├── infrastructure/# Adaptadores (in-memory/postgres)
│   │   │   ├── middleware/    # CORS, CSRF, rate-limit, auth, etc.
│   │   │   ├── routes/        # Rutas REST/OpenAPI
│   │   │   └── types/         # Tipos Hono
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.mts
│   └── web/        # @red-facyt/web — Next.js 16 App Router
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── data/
│       │   ├── lib/           # Re-exportará desde shared tras Ola 2
│       │   ├── test/
│       │   └── __tests__/
│       ├── next.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.mts
├── packages/
│   ├── shared/     # @redfacyt/shared — FUENTE DE VERDAD (Ola 2)
│   │   ├── src/
│   │   │   ├── taxonomy/      # PostType, PostCategory, ResearchArea, PostVisibility
│   │   │   ├── types/         # Post, User, Session, PostFilters, etc.
│   │   │   ├── schemas/       # Zod schemas
│   │   │   ├── domain/        # Lógica pura (canViewPost, applyFilters...)
│   │   │   └── index.ts
│   │   └── package.json
│   └── tsconfig/   # base.json (Ola 2)
├── docs/
│   ├── architecture/
│   └── ...
└── pnpm-workspace.yaml  # incluye apps/* (+ packages/* tras Ola 2)
