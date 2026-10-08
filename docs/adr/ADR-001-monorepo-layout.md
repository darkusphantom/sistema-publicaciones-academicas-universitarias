# ADR-001: Estructura y Layout del Monorepo

## Fecha
2026-10-08

## Estado
Aceptado

## Contexto
El proyecto Red FaCyT nació como un repositorio monolítico/desacoplado con el frontend en la raíz y la API backend en la subcarpeta `apps/api`. Para permitir una separación clara de responsabilidades, compartir tipos, esquemas Zod, constantes de taxonomía y utilidades de configuración entre aplicaciones sin duplicación de código ni dependencias circulares, se hizo necesaria la reorganización del proyecto en una arquitectura de monorepo pnpm workspace.

## Decisión
Se establece la estructura oficial del monorepo Red FaCyT de la siguiente manera:

1. **`apps/web`**: Aplicación web frontend en Next.js 16 (App Router), TypeScript y TailwindCSS.
2. **`apps/api`**: API REST y servidor backend con Hono 4, OpenAPI y Better Auth. Se mantiene el nombre `apps/api` (no `apps/backend`) para conservar compatibilidad con scripts e infraestructura preexistente.
3. **`packages/shared`** (`@redfacyt/shared`): Paquete de código compartido que actúa como **única fuente de verdad** para:
   - Taxonomía (`PostType`, `PostCategory`, `ResearchArea`, `PostVisibility`).
   - Tipos TypeScript compartidos (`Post`, `User`, `Session`, `PostFilters`, `PageOptions`, etc.).
   - Esquemas Zod para validación de datos (auth, publicaciones, usuarios).
   - Lógica de dominio pura independiente de framework (reglas de visibilidad `canViewPost`, normalización y filtrado de publicaciones `applyFilters`).
4. **`packages/tsconfig`**: Paquete de configuraciones base de TypeScript para garantizar consistencia entre aplicaciones y librerías (`base.json`).

## Alineación Taxonómica
- La fuente de verdad del dominio se ubica en `@redfacyt/shared`.
- `apps/web` y `apps/api` consumen los tipos y enums desde `@redfacyt/shared`.
- En `apps/api`, los módulos `src/domain/*` actúan como shims de compatibilidad re-exportando desde `@redfacyt/shared`, garantizando la integridad de los contratos de API sin romper imports internos.

## Consecuencias

### Positivas
- Se elimina la duplicación de definiciones de enums, tipos e interfaces entre frontend y backend.
- Cambios en esquemas o enums de dominio se reflejan instantáneamente en todo el proyecto mediante verificaciones de tipo estáticas (`pnpm -r typecheck`).
- Reutilización directa de la lógica de dominio pura (`canViewPost`, `applyFilters`) tanto en el cliente como en el backend.
- Mapeo de dependencias interno mediante pnpm workspaces (`"workspace:*"`).

### Negativas / Consideraciones
- Requiere transpilación de paquetes de workspace en Next.js (`transpilePackages: ["@redfacyt/shared"]` en `next.config.ts`).
- La ejecución de pruebas unitarias debe contemplar la ejecución por paquete o con timeouts ajustados debido al costo del entorno `jsdom` en `apps/web`.

## Referencias
- [`docs/architecture/monorepo-structure.md`](file:///home/darkus/Documents/Fund-Desarrollo-Web/acedemic-publish-system/docs/architecture/monorepo-structure.md)
- [`docs/TASK-MIGRACION-MONOREPO.md`](file:///home/darkus/Documents/Fund-Desarrollo-Web/acedemic-publish-system/docs/TASK-MIGRACION-MONOREPO.md)
