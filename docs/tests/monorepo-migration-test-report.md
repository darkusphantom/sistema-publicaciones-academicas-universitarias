# Reporte de pruebas - Migración a Monorepo

## Fecha
2026-10-05

## Branch
refactor/monorepo-apps-web

## Estado Gate Ola 1
- [x] Lint API: OK
- [x] Lint Web: OK
- [x] Tests API: 180/180 PASS (16 archivos)
- [x] Tests Web: 265/265 PASS (30 archivos)
- [x] Total: 445/445 PASS
- [x] Build API: OK (tsup)
- [x] Build Web: OK (Next.js 16)

## Taxonomía alineada
- Fuente de verdad: `apps/web/src/lib/types.ts`
- API alineada con web: PostType (8), PostCategory (6), ResearchArea (39+general) añadido
- Archivos actualizados: `apps/api/src/domain/post.ts`, `validation.ts`, `routes/openapi.ts`, repos in-memory, routes tests

## Cobertura (verificación)
- API: 94.21% stmts / 81.93% branches / 95.1% funcs / 97.23% lines (≥80%)
- Web: 61.45% stmts / 55.98% branches / 56.65% funcs / 61.96% lines (<80%) — **preexistente**

## Estructura resultante
- apps/api: intacta (application/domain/infrastructure/middleware/routes)
- apps/web: movido con éxito (src + configs)
- Renames: 109 (staged), archivos workspace creados: 4

## Evidencia comandos
```bash
pnpm -r lint    # OK
pnpm -r test    # 445 PASS
pnpm -r build   # API+web OK
```
