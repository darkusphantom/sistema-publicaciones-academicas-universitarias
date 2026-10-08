# TASK: Migración a Monorepo - Ola 2 y Detalles Pendientes

## Estado General
- [x] Ola 1 - Migración frontend a `apps/web` (estructura)
- [x] Alineación taxonomía API ↔ Web (fuente de verdad: web → shared)
- [x] API corregida (lint+test+build OK)
- [x] Tests web/api/shared verdes (443/443 PASS)
- [x] Ola 2 - `packages/shared` + `packages/tsconfig`
- [x] Limpieza y documentación final

## CRÍTICO - I-2 Resuelto
- [x] `apps/api/src/domain/post.ts` - PostType (8), PostCategory (6), ResearchArea añadido, researchArea en Post/PostDraft/UpdatePost/PostFilters, DEFAULT_POST_FILTERS actualizado
- [x] `apps/api/src/domain/validation.ts` - Enums Zod sincronizados + researchArea en create/update/postFilters
- [x] `apps/api/src/routes/openapi.ts` - Enums actualizados + ResearchArea schema + researchArea en Post
- [x] `apps/api/src/infrastructure/repositories/in-memory/in-memory-post-repository.ts` - Seeds y orden ajustados con nueva taxonomía
- [x] `apps/api/src/infrastructure/repositories/in-memory/user-store.ts` - Sincronizado con tipos compartidos
- [x] `apps/api/src/routes/posts.routes.test.ts` - Fixtures y tests actualizados
- [x] `apps/api/src/routes/users.routes.test.ts` - Fixtures y assertions actualizadas
- [x] `apps/api/src/routes/admin.routes.test.ts` - Tests de administración actualizados
- [x] `apps/api/src/routes/openapi.test.ts` - Assertions de OpenAPI actualizadas
- [x] `apps/api/src/application/*` - Casos de uso e imports sincronizados con shared

## FASE 0 - Cerrar coherencia API tras alineación taxonómica (URGENTE)

**Objetivo:** Dejar la API 100% coherente con la nueva taxonomía (fuente de verdad: `@redfacyt/shared`) antes de crear `packages/shared`.

### Archivos a ajustar

- [x] **`apps/api/src/infrastructure/repositories/in-memory/in-memory-post-repository.ts`**
  - Ajustar seeds/posts de ejemplo con la taxonomía alineada (PostType 8 valores, PostCategory 6 valores, incluir `researchArea` válido por post).
  - Verificar coherencia con los tipos definidos en `apps/api/src/domain/post.ts`.

- [x] **`apps/api/src/infrastructure/repositories/in-memory/user-store.ts`**
  - Revisar seeds/usuarios para asegurar compatibilidad con tipos compartidos.

- [x] **`apps/api/src/routes/posts.routes.test.ts`**
  - Actualizar fixtures/datos de prueba para usar la nueva taxonomía.

- [x] **`apps/api/src/routes/users.routes.test.ts`**
  - Revisar datos de prueba y assertions.

- [x] **`apps/api/src/routes/admin.routes.test.ts`**
  - Revisar tests que crean/filtran posts.

- [x] **`apps/api/src/routes/openapi.test.ts`**
  - Verificar assertions sobre enums OpenAPI.

- [x] **`apps/api/src/application/*`**
  - Revisar casos de uso, mapeos y tipos.

### Verificación obligatoria (bloquea paso a Ola 2)

```bash
pnpm --filter @red-facyt/api typecheck
pnpm --filter @red-facyt/api lint
pnpm --filter @red-facyt/api test
pnpm --filter @red-facyt/api build
```

**Criterio de aceptación:** API completamente verde tras ajustes (179/179 tests PASS, typecheck/lint/build OK).

## OLA 2 - FASE 2: Crear packages/shared

### Estructura
- [x] Crear `packages/shared/src/taxonomy/post-type.ts`
- [x] Crear `packages/shared/src/taxonomy/post-category.ts`
- [x] Crear `packages/shared/src/taxonomy/research-area.ts`
- [x] Crear `packages/shared/src/taxonomy/post-visibility.ts`
- [x] Crear `packages/shared/src/types/post.ts`
- [x] Crear `packages/shared/src/types/user.ts`
- [x] Crear `packages/shared/src/types/session.ts`
- [x] Crear `packages/shared/src/types/filters.ts`
- [x] Crear `packages/shared/src/types/pagination.ts`
- [x] Crear `packages/shared/src/schemas/post.ts`
- [x] Crear `packages/shared/src/schemas/auth.ts`
- [x] Crear `packages/shared/src/schemas/user.ts`
- [x] Crear `packages/shared/src/domain/can-view-post.ts` (extraer de visibility.ts)
- [x] Crear `packages/shared/src/domain/filters.ts` (extraer de filters.ts)
- [x] Crear `packages/shared/src/index.ts` (barrel exports)
- [x] Crear `packages/shared/package.json` (@redfacyt/shared, workspace deps zod)
- [x] Crear `packages/shared/tsconfig.json`
- [x] Crear `packages/shared/vitest.config.mts`
- [x] Crear `packages/shared/eslint.config.mjs`

### Infraestructura tsconfig
- [x] Crear `packages/tsconfig/base.json`

### Workspace
- [x] Editar `pnpm-workspace.yaml` → añadir `"packages/*"`

### Dependencias
- [x] `apps/web/package.json` → añadir `"@redfacyt/shared": "workspace:*"`
- [x] `apps/api/package.json` → añadir `"@redfacyt/shared": "workspace:*"`
- [x] `apps/web/next.config.ts` → añadir `transpilePackages: ["@redfacyt/shared"]`

## FASE 4: Shims/re-exports
- [x] `apps/web/src/lib/types.ts` → re-exportar desde `@redfacyt/shared`
- [x] `apps/web/src/lib/visibility.ts` → usar shared/domain
- [x] `apps/web/src/lib/filters.ts` → usar shared/domain
- [x] `apps/web/src/lib/validation/auth.ts` → migrar a shared o mantener shim
- [x] `apps/web/src/lib/validation/post.ts` → migrar a shared o mantener shim
- [x] `apps/api/src/domain/post.ts` → re-exportar desde `@redfacyt/shared`
- [x] `apps/api/src/domain/user.ts` → re-exportar/consumir shared
- [x] `apps/api/src/domain/session.ts` → re-exportar/consumir shared
- [x] `apps/api/src/domain/visibility.ts` → re-exportar/consumir shared
- [x] `apps/api/src/domain/validation.ts` → re-exportar/consumir shared

## FASE 5: Validación
- [x] `pnpm install`
- [x] `pnpm -r lint` → verde (0 warnings)
- [x] `pnpm -r test` → verde (443/443 tests PASS en shared, api, web)
- [x] `pnpm -r build` → verde (API + web + shared)
- [x] `pnpm -r test:coverage` → verificado (API ≥80%, web desvío preexistente documentado)

## DETALLES PENDIENTES Ola 1 (I-4, I-5, I-6, I-7)

### Documentación creada (completada)
- [x] `docs/architecture/monorepo-structure.md` - Estructura objetivo creada
- [x] `docs/architecture/progress.md` - Actualizado con migración a monorepo
- [x] `docs/tests/monorepo-migration-test-report.md` - Evidencia lint/test/build creada
- [x] `docs/TASK-MIGRACION-MONOREPO.md` - Checklist + paso a paso completado
- [x] **Formalizar ADR-001: Layout real del monorepo**
  - Creado `docs/adr/ADR-001-monorepo-layout.md` y referenciado en `docs/architecture/monorepo-structure.md`.

### Limpieza raíz
- [x] Evaluar/eliminar `tsconfig.json` raíz
- [x] Limpiar deps duplicadas en `package.json` raíz
- [x] Eliminar `.next/` huérfano en raíz
- [x] Revisar `eslint.config.mjs` raíz
- [x] Simplificar `.husky/pre-commit`

### .gitignore
- [x] Normalizar patrones (`**/coverage`, `**/.next/`, `build/`)

### Tests
- [x] Reactivar test comentado en `apps/web/src/__tests__/routes.smoke.test.tsx` (I-4) O documentar justificación en progress.md

### Documentación
- [x] `docs/architecture/monorepo-structure.md` → creado y actualizado
- [x] `docs/architecture/progress.md` → actualizado
- [x] `docs/architecture/frontend-structure.md` → verificado
- [x] `README.md` → corregido
- [x] `docs/husky.md` → actualizado
- [x] `docs/tests/monorepo-migration-test-report.md` → actualizado con evidencia completa

## NOTAS
- Cobertura web < 80% es **preexistente** a migración (no introducido por ella). Documentado en `progress.md`.
- Fuente de verdad taxonómica: **shared → web / api**. Alineación completada.
