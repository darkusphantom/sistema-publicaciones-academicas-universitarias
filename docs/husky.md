# Husky — gate de calidad pre-commit

Husky gestiona los hooks de Git del proyecto. El hook **pre-commit** actúa como puerta de calidad: **ningún commit entra si el código no pasa el lint y los tests con cobertura**.

> Nota: `OBJECTIVE.md` menciona "prepush"; la decisión documentada del equipo es instalar el gate en **pre-commit** para detectar problemas antes de que el código se integre, no al final del flujo.

## Qué hace el hook pre-commit

El archivo `.husky/pre-commit` ejecuta, en orden:

```sh
pnpm lint
pnpm test:coverage
```

1. **`pnpm lint`** — ESLint sobre todo el proyecto (configuración flat en `eslint.config.mjs`). Falla el commit si hay errores.
2. **`pnpm test:coverage`** — Vitest con cobertura v8. Falla el commit si algún test falla **o** si la cobertura queda por debajo del umbral.

Si cualquiera de los dos comandos falla, el commit se **bloquea** y el código no se integra.

## Gate de cobertura ≥ 80%

El umbral se define en `vitest.config.mts`:

```ts
coverage: {
  provider: "v8",
  include: ["src/**/*.{ts,tsx}"],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

Los cuatro indicadores (líneas, funciones, ramas y sentencias) deben estar en **≥ 80%**. El reporte se genera en `coverage/` (HTML, texto y lcov) y esa carpeta está ignorada por Git y por ESLint.

Para ver el reporte completo en el navegador:

```bash
pnpm test:coverage
# abre coverage/index.html
```

## Cómo se extiende con nuevos scripts

El hook es un script de shell plano: se pueden añadir más comprobaciones en orden. Por ejemplo, para añadir type-check y un formateador:

```sh
pnpm lint
pnpm typecheck   # script adicional en package.json
pnpm format:check
pnpm test:coverage
```

Reglas para extenderlo:

- Mantener el orden: comprobaciones rápidas primero (lint/typecheck), tests con cobertura al final.
- Cada comando debe fallar con código de salida distinto de 0 si la comprobación no pasa; Husky bloquea el commit automáticamente.
- Documentar cualquier script nuevo en `README.md` (tabla de scripts).

## Omitir el hook temporalmente (`--no-verify`)

En situaciones excepcionales (p. ej. un commit de documentación urgente o un entorno sin dependencias instaladas) se puede saltar el hook:

```bash
git commit --no-verify -m "docs: ..."
```

> **Advertencia:** `--no-verify` **desactiva todas las comprobaciones de calidad**. El código que entre por esta vía puede romper el build o bajar la cobertura sin que nadie lo detecte. Úsalo solo cuando sea estrictamente necesario y revierte la omisión en cuanto el entorno esté operativo. La regla del equipo es: **si se usa `--no-verify`, se reporta en la descripción del PR**.