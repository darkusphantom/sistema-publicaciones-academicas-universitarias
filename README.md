# Red FaCyT

Aplicación web para publicaciones académicas y vida universitaria de la **Facultad Experimental de Ciencias y Tecnología (FaCyT)**. Red institucional donde la comunidad universitaria publica, consulta y organiza información académica, estudiantil e institucional.

> Documento de referencia del proyecto: [`docs/Proyecto1_Junio2026.md`](docs/Proyecto1_Junio2026.md)

## Tecnologías

| Tecnología | Propósito |
| --- | --- |
| [Next.js 16](https://nextjs.org/) (App Router) | Framework React con renderizado server-side |
| [React 19](https://react.dev/) | Librería de interfaz de usuario |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipado estático |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos utilitarios |
| [Vitest 5](https://vitest.dev/) | Tests unitarios y de componentes con cobertura (v8) |
| [ESLint 9](https://eslint.org/) | Análisis estático de código |
| [Husky 9](https://typicode.github.io/husky/) | Hooks de Git (gate de calidad pre-commit) |
| [PNPM](https://pnpm.io/) | Gestor de paquetes |
| [PostgreSQL](https://www.postgresql.org/) | Base de datos local (fase de backend) |
| [Vercel](https://vercel.com/) | Despliegue |

## Requisitos

- **Node.js ≥ 20** (desarrollado con Node 24)
- **PNPM ≥ 9**
- **PostgreSQL local** — solo necesario en la fase de backend; el frontend actual usa datos estáticos.

## Instalación y uso

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear variables de entorno a partir de la plantilla
cp .env.example .env.local

# 3. Levantar el servidor de desarrollo
pnpm dev
# Abre http://localhost:3000

# 4. Ejecutar los tests
pnpm test

# 5. Ejecutar los tests con cobertura (umbral >= 80%)
pnpm test:coverage

# 6. Ejecutar el linter
pnpm lint

# 7. Compilar el build de producción
pnpm build
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint (configuración flat) |
| `pnpm test` | Vitest (una ejecución) |
| `pnpm test:coverage` | Vitest con cobertura v8 y umbral ≥ 80% |

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta los valores. Nunca se suben secretos reales al repositorio.

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación | `http://localhost:3000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL local (fase de backend) | `postgresql://postgres:postgres@localhost:5432/red_facyt` |

## Estructura del proyecto

```
src/
├── app/
│   ├── (landing)/              # Ruta pública: /
│   ├── (auth)/                 # Rutas públicas: /login, /register
│   ├── (main)/                 # Rutas autenticadas: /feed, /profile/[username]
│   ├── layout.tsx              # Layout raíz (metadata global)
│   └── globals.css             # Estilos globales (Tailwind)
├── lib/                        # Utilidades puras (format.ts)
└── __tests__/                  # Tests de humo de las rutas
```

## Despliegue en Vercel

1. **Sube el repositorio a GitHub** (rama `develop` como rama de trabajo; `main` para producción).
2. **Importa el proyecto en Vercel**: [vercel.com/new](https://vercel.com/new) → *Import Git Repository* → selecciona el repositorio.
3. **Configura el framework**: Vercel detecta Next.js automáticamente (build: `pnpm build`, output: `standalone` no requerido).
4. **Variables de entorno**: añade en el panel *Settings → Environment Variables* las variables de `.env.example` con los valores de producción.
5. **Despliega**: Vercel ejecuta `pnpm install` y `pnpm build` automáticamente en cada push a la rama de producción.
6. **Verifica**: abre la URL asignada (`https://<proyecto>.vercel.app`) y revisa los logs de build si algo falla.

> Nota: el proyecto usa `pnpm`; Vercel lo detecta por el `packageManager` declarado en `package.json` y el `pnpm-lock.yaml`.

## Calidad

- **Gate pre-commit (Husky)**: cada commit ejecuta `pnpm lint` y `pnpm test:coverage` (umbral ≥ 80%). Detalles en [`docs/husky.md`](docs/husky.md).
- **TDD**: los tests se escriben antes que la implementación.
- **JSDoc**: toda función pública está documentada con JSDoc.

## Documentación

- [`docs/Proyecto1_Junio2026.md`](docs/Proyecto1_Junio2026.md) — enunciado del proyecto
- [`docs/design/wireframes.md`](docs/design/wireframes.md) — mapa de navegación y esquemas
- [`docs/implementation/implementation_base.md`](docs/implementation/implementation_base.md) — requisitos base de la estructura principal
- [`docs/husky.md`](docs/husky.md) — gate de calidad pre-commit