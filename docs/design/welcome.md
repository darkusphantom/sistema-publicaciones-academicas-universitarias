# Pantalla de Bienvenida — Red FaCyT (spec de diseño)

Especificación de diseño de la pantalla `/` (grupo `(landing)`), propuesta aprobada por el equipo. Reemplaza el placeholder actual de `src/app/(landing)/page.tsx`.

## 1. Propósito

Introducción para usuarios de **primer ingreso**: da un contexto preciso y claro de qué hace Red FaCyT (gaceta editorial de la Facultad Experimental de Ciencias y Tecnología) y qué se puede hacer: publicar/consultar noticias, avisos, eventos académicos y vida universitaria; roles estudiante/profesor/admin; feed con buscador y filtros. Requiere iniciar sesión/registrarse para participar.

## 2. Comportamiento primera vez vs. recurrente

| Caso | Mecanismo | Destino |
| --- | --- | --- |
| Primer ingreso | Sin flag `facy:onboarding` en `localStorage` | Se muestra la intro |
| Recurrente | `localStorage['facy:onboarding'] === 'visto'` | Redirige a `/login` |
| Click "Empezar" | Fija flag → `/register` | Registro (primer ingreso) |
| Click "Ya tengo cuenta" | — → `/login` | Login |
| Click "Omitir introducción" (skip) | Fija flag → `/login` | Login |

> Sin backend: el flag se escribe solo en el cliente. Un usuario sin flag (limpio) ve la intro; uno con flag salta a `/login`.

## 3. Narrativa del scroll parallax (vertical, 5 planos)

Concepto editorial: "hojas de una gaceta que se desplazan". Parallax sutil entre el **bloque de título** (lento) y la **capa de viñetas/marcas tipográficas** (más rápido). Sin gradientes, sin burbujas.

| # | Sección | Layer parallax | Comportamiento |
| --- | --- | --- | --- |
| 0 | Skip sticky (top) | — | Fijo: "Omitir introducción" arriba (escritorio); sobre el hero en móvil |
| 1 | **Masthead** — logo + nombre + qué es | Título serif (velocidad base) · viñeta "FaCyT · Est." (+18%) · línea divisoria fina que "se separa" | Profundidad al hacer scroll |
| 2 | **Qué ofrece** — 3 bloques (Noticias/Avisos, Académico, Vida) | Cards (velocidad base) · número 01/02/03 serif de fondo (+8%) | El número de fondo asciende más lento que las cards |
| 3 | **Roles** — Estudiante · Profesor · Admin | Texto (base) · regla horizontal `───` (+12%) | La regla "se estira" al cruzar |
| 4 | **Cierre** — CTA + "Empezar" | CTA (base) · marca de agua "Red FaCyT" (+15%) | Fin de la narrativa |

- Máximo 5 secciones; ningún plano se mueve más de un 15–18% relativo al anterior (legibilidad + sobriedad académica).
- **`prefers-reduced-motion: reduce`**: parallax desactivado (planos estáticos, scroll normal, sin transiciones). La pantalla queda plenamente navegable.

## 4. Wireframe ASCII (mobile-first; escritorio = contenedor ~1120px, 2–3 columnas)

```
┌─────────────────────────────────────────────┐
│ [FaCyT logo]            [🌙][Omitir ↦]      │  ← solo primer ingreso; foco: Skip
├─────────────────────────────────────────────┤
│   FaCyT                                     │  ← h1 serif (display) — ancla
│   Facultad Experimental                     │
│   de Ciencias y Tecnología                  │
│  ───────────────────────────  ← fina, se separa
│   La gaceta digital de la                  │
│   facultad: noticias, avisos y               │
│   vida universitaria.                       │
│                                             │
│   [ Iniciar sesión ]  [ Registrar ]         │
│                                            │
│   01  Noticias y avisos                     │  ← capa 2 — h2
│       Comunicados oficiales y agenda.       │
│   02  Académico                             │
│       Cursos, talleres y defensas.          │
│   03  Vida universitaria                    │
│       Eventos y actividades de la facultad. │
│                                             │
│  ────────────────────────────  ← regla        │
│   Para profesores, estudiantes              │
│   y administración.                        │  ← capa 3
│   Estudiante · Profesor · Admin             │
│                                             │
│   Pública, publíca, comenta.                │
│   [ Empezar ]  [ Ya tengo cuenta ]          │  ← CTA único (acento) + link
│  Marca de agua: Red FaCyT                   │
└─────────────────────────────────────────────┘
```

> Error tipográfico intencional en el wireframe ("publíca, publíca"): el copy correcto y final es el de §5. El developer implementa el copy de §5, no este borrador.

## 5. Copy final (español, voz activa, oraciones cortas)

```
h1:    FaCyT
sub:   Facultad Experimental de Ciencias y Tecnología
intro: La gaceta digital de la facultad: noticias, avisos y vida universitaria.

01     Noticias y avisos
       Comunicados oficiales y agenda en un solo lugar.
02     Académico
       Cursos, talleres y defensas, organizados.
03     Vida universitaria
       Eventos y actividades para toda la comunidad.

Clave: Para profesores, estudiantes y administración.
       Estudiante · Profesor · Admin

CTA:   Empezar             (primario, único acento)
       Ya tengo cuenta     (ghost)
Skip:  Omitir introducción
```

## 6. Interacción / UX

- **Un solo CTA primario** por pantalla: "Empezar" (único acento azul).
- "Iniciar sesión" / "Ya tengo cuenta" → ghost/link.
- Foco tras Skip/CTA: navega a `/login` o `/register`; sin trampas de foco.
- Target táctil ≥ 44×44px en todos los controles.

## 7. Accesibilidad (WCAG 2.2 AA)

- Semántica: `<header>` (masthead) + `<main>` (una sola) + `<footer>` (institucional). h1→h2→h3 sin saltos.
- Contraste por tokens semánticos; `--accent` solo en el CTA "Empezar"; captions con `--text-muted`.
- El parallax NO se aplica a elementos enfocables ni a textos de lectura: solo el plano de fondo (números/marca de agua) se mueve, con `aria-hidden="true"`.
- `prefers-reduced-motion: reduce` → scroll estático (WCAG 2.3.3/2.2.2).
- Los CTAs y skip son `<a>` reales (rutas existentes), no botones sin navegación.

## 8. Componentes y tokens

- **Reutiliza inventario** (`components/ui`): `Button` (variants primary/secondary/ghost), `ThemeToggle`.
- **Nuevos:** `ParallaxSection` (wrapper de plano con transform CSS, respeta `prefers-reduced-motion`) y `LandingHero` (masthead).
- En el layout de `(landing)` puede usarse una mini-navbar pública (logo + ThemeToggle + link login). Sin BottomNav/Navbar autenticada.
- **Tokens**: `--bg`, `--surface`, `--text`, `--text-muted`, `--primary` (marca/masthead), `--accent` (solo CTA), `--border` (reglas). Prohibido `hex` suelto y emoji como iconografía (iconos lucide/shadcn).