# Estructura del Monorepo — Red FaCyT

## Estado actual
Tras la migración Ola 1 y Ola 2, el frontend Next.js 16 (App Router) se encuentra en `apps/web` y el backend API (Hono 4) en `apps/api`. La carpeta `packages/shared` consolida la taxonomía, los tipos, los esquemas y la lógica pura compartida por toda la aplicación, mientras que `packages/tsconfig` proporciona la configuración base.

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
│       │   ├── lib/           # Utilidades exclusivas del frontend
│       │   ├── test/
│       │   └── __tests__/
│       ├── next.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.mts
├── packages/
│   ├── shared/     # @redfacyt/shared — FUENTE DE VERDAD
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
└── pnpm-workspace.yaml  # incluye apps/* y packages/*

## Decisiones de Arquitectura (ADR)
- [`ADR-001: Estructura y Layout del Monorepo`](../adr/ADR-001-monorepo-layout.md)

