# Reporte de pruebas - Migración a Monorepo (Ola 1 + Ola 2)

## Fecha
2026-10-08

## Branch
`refactor/monorepo-apps-web`

## Estado Gate Ola 1 + Ola 2
- [x] Lint Shared (`packages/shared`): OK (ESLint `--max-warnings 0`)
- [x] Lint API (`apps/api`): OK (ESLint `--max-warnings 0`)
- [x] Lint Web (`apps/web`): OK (ESLint `--max-warnings 0`)
- [x] Tests Shared: OK (Vitest `--passWithNoTests`)
- [x] Tests API: 179/179 PASS (16 archivos)
- [x] Tests Web: 264/264 PASS (30 archivos)
- [x] Total Tests Monorepo: 443/443 PASS
- [x] Build Shared (`packages/shared`): OK (`tsup` dist/dts)
- [x] Build API (`apps/api`): OK (`tsup` dist)
- [x] Build Web (`apps/web`): OK (Next.js 16 App Router Turbopack)

## Taxonomía y Contratos Alineados
- **Fuente de verdad única**: `packages/shared` (`@redfacyt/shared`)
- **Taxonomía**: `PostType` (8), `PostCategory` (6), `ResearchArea` (39 + general), `PostVisibility` (3)
- **Adaptadores / Shims**: `apps/api/src/domain/*` y `apps/web/src/lib/types.ts` re-exportan desde `@redfacyt/shared` manteniendo 100% retrocompatibilidad.

## Cobertura (verificación)
- **API (`apps/api`)**: 94.21% stmts / 81.93% branches / 95.1% funcs / 97.23% lines (cumple ≥80%)
- **Web (`apps/web`)**: 61.45% stmts / 55.98% branches / 56.65% funcs / 61.96% lines (<80% desvío preexistente documentado en progress.md)

## Estructura Resultante Workspace
- `apps/api`: Hono 4 + Better Auth (re-exporta `@redfacyt/shared`)
- `apps/web`: Next.js 16 App Router (`transpilePackages: ["@redfacyt/shared"]`)
- `packages/shared`: Tipos, taxonomías, esquemas Zod y lógica pura (`canViewPost`, `applyFilters`)
- `packages/tsconfig`: Configuración TypeScript compartida (`base.json`)

## Evidencia de Comandos
```bash
pnpm -r lint     # OK (shared, api, web)
pnpm -r test     # 443 PASS (shared, api, web)
pnpm -r build    # OK (shared, api, web)
```
