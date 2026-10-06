# TASK: Migración a Monorepo - Ola 2 y Detalles Pendientes

## Estado General
- [x] Ola 1 - Migración frontend a `apps/web` (estructura)
- [x] Alineación taxonomía API ↔ Web (fuente de verdad: web)
- [x] API corregida (lint+test+build OK)
- [x] Tests web/api verdes (445/445)
- [ ] Ola 2 - `packages/shared` + `packages/tsconfig`
- [ ] Limpieza y documentación final

## CRÍTICO - I-2 Resuelto
- [x] `apps/api/src/domain/post.ts` - PostType (8), PostCategory (6), ResearchArea añadido, researchArea en Post/PostDraft/UpdatePost/PostFilters, DEFAULT_POST_FILTERS actualizado
- [x] `apps/api/src/domain/validation.ts` - Enums Zod sincronizados + researchArea en create/update/postFilters
- [x] `apps/api/src/routes/openapi.ts` - Enums actualizados + ResearchArea schema + researchArea en Post
- [ ] `apps/api/src/infrastructure/repositories/in-memory/in-memory-post-repository.ts` - Ajustar seeds con nueva taxonomía
- [ ] `apps/api/src/infrastructure/repositories/in-memory/user-store.ts` - Revisar
- [ ] `apps/api/src/routes/posts.routes.test.ts` - Actualizar datos de prueba
- [ ] `apps/api/src/routes/users.routes.test.ts` - Revisar
- [ ] `apps/api/src/routes/admin.routes.test.ts` - Revisar
- [ ] `apps/api/src/routes/openapi.test.ts` - Revisar assertions de enums
- [ ] `apps/api/src/application/*` - Revisar imports/tipos

**Verificación API tras ajustes de tests:**
```bash
pnpm --filter @red-facyt/api typecheck
pnpm --filter @red-facyt/api lint
pnpm --filter @red-facyt/api test
pnpm --filter @red-facyt/api build
```

## OLA 2 - FASE 2: Crear packages/shared

### Estructura
- [ ] Crear `packages/shared/src/taxonomy/post-type.ts`
- [ ] Crear `packages/shared/src/taxonomy/post-category.ts`
- [ ] Crear `packages/shared/src/taxonomy/research-area.ts`
- [ ] Crear `packages/shared/src/taxonomy/post-visibility.ts`
- [ ] Crear `packages/shared/src/types/post.ts`
- [ ] Crear `packages/shared/src/types/user.ts`
- [ ] Crear `packages/shared/src/types/session.ts`
- [ ] Crear `packages/shared/src/types/filters.ts`
- [ ] Crear `packages/shared/src/types/pagination.ts`
- [ ] Crear `packages/shared/src/schemas/post.ts`
- [ ] Crear `packages/shared/src/schemas/auth.ts`
- [ ] Crear `packages/shared/src/schemas/user.ts`
- [ ] Crear `packages/shared/src/domain/can-view-post.ts` (extraer de visibility.ts)
- [ ] Crear `packages/shared/src/domain/filters.ts` (extraer de filters.ts)
- [ ] Crear `packages/shared/src/index.ts` (barrel exports)
- [ ] Crear `packages/shared/package.json` (@redfacyt/shared, workspace deps zod)
- [ ] Crear `packages/shared/tsconfig.json`
- [ ] Crear `packages/shared/vitest.config.mts`
- [ ] Crear `packages/shared/eslint.config.mjs`

### Infraestructura tsconfig
- [ ] Crear `packages/tsconfig/base.json`

### Workspace
- [ ] Editar `pnpm-workspace.yaml` → añadir `"packages/*"`

### Dependencias
- [ ] `apps/web/package.json` → añadir `"@redfacyt/shared": "workspace:*"`
- [ ] `apps/api/package.json` → añadir `"@redfacyt/shared": "workspace:*"`
- [ ] `apps/web/next.config.ts` → añadir `transpilePackages: ["@redfacyt/shared"]`

## FASE 4: Shims/re-exports
- [ ] `apps/web/src/lib/types.ts` → re-exportar desde `@redfacyt/shared`
- [ ] `apps/web/src/lib/visibility.ts` → usar shared/domain
- [ ] `apps/web/src/lib/filters.ts` → usar shared/domain
- [ ] `apps/web/src/lib/validation/auth.ts` → migrar a shared o mantener shim
- [ ] `apps/web/src/lib/validation/post.ts` → migrar a shared o mantener shim
- [ ] `apps/api/src/domain/post.ts` → re-exportar desde `@redfacyt/shared` (o consumir directamente)
- [ ] `apps/api/src/domain/user.ts` → re-exportar/consumir shared
- [ ] `apps/api/src/domain/session.ts` → re-exportar/consumir shared
- [ ] `apps/api/src/domain/visibility.ts` → re-exportar/consumir shared
- [ ] `apps/api/src/domain/validation.ts` → re-exportar/consumir shared

## FASE 5: Validación
- [ ] `pnpm install`
- [ ] `pnpm -r lint` → verde
- [ ] `pnpm -r test` → verde (todos tests)
- [ ] `pnpm -r build` → verde (API + web)
- [ ] `pnpm -r test:coverage` → revisar (web < 80% preexistente)

## DETALLES PENDIENTES Ola 1 (I-4, I-5, I-6, I-7)

### Limpieza raíz
- [ ] Evaluar/eliminar `tsconfig.json` raíz (huérfano, 186 errores si se ejecuta solo)
- [ ] Limpiar deps duplicadas en `package.json` raíz (next/react/etc ya en apps/web)
- [ ] Eliminar `.next/` huérfano en raíz
- [ ] Revisar `eslint.config.mjs` raíz (nunca se ejecuta con pnpm -r lint)
- [ ] Simplificar `.husky/pre-commit` (quitar filtros duplicados, usar `pnpm -r lint`)

### .gitignore
- [ ] Normalizar patrones: `**/coverage`, `**/.next/`, `build/` (desanclado ya aplicado parcialmente)

### Tests
- [ ] Reactivar test comentado en `apps/web/src/__tests__/routes.smoke.test.tsx` (I-4) O documentar justificación en progress.md

### Documentación
- [ ] `docs/architecture/monorepo-structure.md` → creado (revisar/ajustar con shared)
- [ ] `docs/architecture/progress.md` → actualizado con migración (hecho)
- [ ] `docs/architecture/frontend-structure.md` → actualizar paths `src/` → `apps/web/src/` (requiere aprobación por ser inmutable)
- [ ] `README.md` → corregir referencias a estructura (líneas 82-84 mencionan src/ raíz)
- [ ] `docs/husky.md` → actualizar con multi-workspace
- [ ] Crear `docs/tests/monorepo-migration-test-report.md` (evidencia lint/test/build)

## NOTAS
- Cobertura web < 80% es **preexistente** a migración (no introducido por ella). Documentar desvío si no se eleva.
- Fuente de verdad taxonómica: **web → shared → api**. Alineación completada en API.
