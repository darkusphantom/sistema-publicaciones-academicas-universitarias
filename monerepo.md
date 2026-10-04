mi-proyecto/
├── apps/
│   ├── backend/              # API (Hono + @hono/node-server, TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts      # arranque del servidor
│   │   │   ├── app.ts        # ensamblado de rutas y middleware
│   │   │   ├── openapi.ts    # @hono/zod-openapi
│   │   │   ├── config/       # env validado con Zod al arrancar
│   │   │   ├── db/           # cliente Drizzle + schema (tablas, enums, índices)
│   │   │   ├── auth/         # instancia Better Auth y guards por rol
│   │   │   ├── domain/       # reglas de negocio puras (visibility, filters, permissions)
│   │   │   ├── modules/      # posts, users, admin (router + service + repository)
│   │   │   └── lib/          # logger, errores HTTP, paginación
│   │   ├── drizzle/          # migraciones SQL generadas
│   │   ├── seed.ts           # datos de ejemplo
│   │   ├── tests/            # unitarios e integración contra PostgreSQL
│   │   ├── Dockerfile
│   │   └── package.json      # @redfacyt/api
│   └── web/                  # Cliente Web (Next.js 16, App Router)
│       ├── src/              # app/, components/, lib/, data/
│       ├── Dockerfile
│       ├── next.config.ts
│       ├── vitest.config.mts
│       └── package.json      # @redfacyt/web
├── packages/
│   ├── shared/               # Tipos comunes, schemas (Zod), utilidades
│   │   ├── src/
│   │   │   ├── types/        # Interfaces y tipos compartidos
│   │   │   ├── schemas/      # Validaciones comunes
│   │   │   ├── taxonomy/     # type, category, researchArea
│   │   │   └── index.ts      # único entry point
│   │   └── package.json      # @redfacyt/shared
│   └── tsconfig/             # Configuraciones base de TypeScript
│       └── base.json
├── docs/                     # Documentación del proyecto
│   ├── architecture/
│   ├── api/                  # openapi.yaml generado
│   ├── database/             # modelo de datos y decisiones
│   ├── design/
│   ├── implementation/
│   └── tests/
├── scripts/                  # Scripts del repositorio
├── pnpm-workspace.yaml       # o configuración de npm/yarn/turborepo
├── package.json              # Scripts raíz para orquestar la compilación
├── docker-compose.yml        # PostgreSQL local
└── README.md
