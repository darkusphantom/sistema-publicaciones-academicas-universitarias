# Pantalla de Bienvenida — Red FaCyT (Especificación de Diseño)

Especificación detallada de diseño para la pantalla `/` (grupo de rutas público `(landing)`). Define la experiencia visual, la narrativa parallax vertical, el aislamiento de layout respecto a la aplicación principal `(main)` y las garantías de accesibilidad.

---

## 1. Propósito e Identidad Visual

Introducción institucional para usuarios de **primer ingreso** a **Red FaCyT** (gaceta digital de la Facultad Experimental de Ciencias y Tecnología).

- **Concepto:** Presentar la plataforma con estética editorial-académica (titulares serif, composición limpia, azul institucional `--primary`).
- **Objetivo:** Comunicar claramente qué es la red (comunicados, noticias, defensas, eventos) y cuáles son los roles (Estudiante, Profesor, Admin), guiando al usuario hacia el registro o inicio de sesión mediante un único CTA primario con acento azul `--accent`.

---

## 2. Aislamiento Estructural de Layout (Independencia del `(main)`)

> [!IMPORTANT]
> **Requisito Crítico de Arquitectura de UI:** La pantalla de bienvenida pertenece al grupo de rutas `src/app/(landing)/` y posee su propio layout dedicado (`(landing)/layout.tsx`), **completamente independiente** del shell autenticado `(main)/layout.tsx`.

### Comparativa de Layouts:

```
┌─────────────────────────────────────────────────────────┐
│ LAYOUT (landing) — PÚBLICO E INDEPENDIENTE              │
│ ├─ LandingHeader (Logo FaCyT + ThemeToggle + CTA Login)  │
│ ├─ Contenido Landing Page (Hero + Parallax 5 capas)     │
│ └─ LandingFooter (Institucional simplificado)           │
└─────────────────────────────────────────────────────────┘
  VS
┌─────────────────────────────────────────────────────────┐
│ LAYOUT (main) — AUTENTICADO                             │
│ ├─ AppNavbar (Buscador, Notificaciones, Avatar Usuario) │
│ ├─ AppSidebar / BottomNav (Feed, Crear, Perfil, Admin)  │
│ └─ Shell con margen para barra lateral/inferior         │
└─────────────────────────────────────────────────────────┘
```

- **Cero interferencia:** La landing `/` NO muestra la barra de navegación de la app (`AppNavbar`), ni la barra inferior (`BottomNav`), ni la barra lateral (`AppSidebar`).
- **Header propio (`LandingHeader`):** Transparente / flotante, ultraligero con Isotipo FaCyT, `ThemeToggle` (modo claro/oscuro) y enlace "Iniciar sesión".
- **Footer propio (`LandingFooter`):** Pie de página sobrio, centrado y ligero.

---

## 3. Comportamiento y Flujo de Onboarding

Mecanismo cliente para controlar la experiencia según la frecuencia de visita:

| Estado del usuario | Condición (`localStorage`) | Comportamiento en `/` |
| --- | --- | --- |
| **Primer ingreso** | Sin la clave `facy:onboarding` | Muestra la Landing Page completa con narrativa parallax. |
| **Recurrente** | `localStorage['facy:onboarding'] === 'visto'` | Redirige automáticamente a `/login`. |
| **Click "Empezar"** | Fija `facy:onboarding = 'visto'` | Navega a `/register` (registro). |
| **Click "Ya tengo cuenta"** | Sin modificar flag o fija flag | Navega a `/login` (login). |
| **Click "Omitir introducción"** | Fija `facy:onboarding = 'visto'` | Navega directamente a `/login`. |

---

## 4. Narrativa del Scroll Parallax (Vertical, 5 Capas)

Concepto editorial: *"Hojas de gaceta universitaria desplazándose en distintos planos de profundidad"*.

Parallax sutil y fluido entre el **contenido legible** (velocidad normal `1.0x`) y las **marcas/elementos gráficos de fondo** (velocidades relativas `0.82x` a `1.18x`). **Sin gradientes psicodélicos, sin burbujas flotantes ni distracciones ruidosas.**

### Mapa de Capas Parallax:

| Capa | Sección | Elemento Frontal (Velocidad `1.0x`) | Elemento de Fondo / Parallax (Desplazamiento Relativo) |
| --- | --- | --- | --- |
| **0** | **Header Sticky** | `LandingHeader` (Fijo arriba, `z-index: 50`) | — |
| **1** | **Hero Masthead** | Titular H1 Serif + Subtítulo + Párrafo Intro + CTAs | Viñeta "FaCyT · Est." (+18% rápido) y Línea divisoria fina que "se separa" gradualmente |
| **2** | **Pilares (3 Bloques)** | Cards de Noticias/Avisos, Académico, Vida Univ. | Números tipográficos Serif `01`, `02`, `03` de fondo (-12% más lento, `aria-hidden="true"`) |
| **3** | **Comunidad y Roles** | Texto descriptivo de perfiles Estudiante · Profesor · Admin | Regla horizontal decorativa `───` (+12% rápida, se expande horizontalmente) |
| **4** | **Cierre y CTA Final** | Bloque final + Botón primario "Empezar" + "Ya tengo cuenta" | Marca de agua institucional "Red FaCyT" en tipografía Serif (+15% rápida, `opacity: 0.08`) |

### Reglas de Movimiento:
- **Desplazamiento acotado:** Máximo un 18% de desfase relativo entre capas para preservar la sobriedad académica.
- **Fall-back `prefers-reduced-motion: reduce`:** Parallax desactivado al 100%. Todos los elementos se renderizan estáticos en posición natural.

---

## 5. Wireframe Estructural (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│ [FaCyT Logo]                         [🌙 Tema] [Omitir ↦]  │  ← LandingHeader (z-50)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   FaCyT                                                     │  ← Layer 1 (Masthead)
│   Facultad Experimental de Ciencias                         │     H1 Serif Display
│   y Tecnología                                              │
│  ────────────────────────────────────────────               │  ← Línea que se separa
│   La gaceta digital de la facultad: noticias,              │
│   avisos y vida universitaria.                              │
│                                                             │
│   [ Empezar ]  [ Ya tengo cuenta ]                          │  ← CTAs principales
│                                                             │
│   ────────────────────────────────────────────────────────  │
│                                                             │
│   01  Noticias y avisos                                     │  ← Layer 2 (Pilares)
│       Comunicados oficiales y agenda académica.             │     Número 01 de fondo
│                                                             │     sube más lento
│   02  Académico                                             │     Número 02 de fondo
│       Cursos, talleres y defensas de tesis.                 │
│                                                             │
│   03  Vida universitaria                                    │     Número 03 de fondo
│       Eventos y actividades de la comunidad.                │
│                                                             │
│   ────────────────────────────────────────────────────────  │
│                                                             │
│   Para profesores, estudiantes y administración.           │  ← Layer 3 (Roles)
│   Estudiante · Profesor · Admin                             │     Regla extensible
│                                                             │
│   ────────────────────────────────────────────────────────  │
│                                                             │
│   Participa en la comunidad universitaria.                  │  ← Layer 4 (CTA Cierre)
│   [ Empezar ]  [ Ya tengo cuenta ]                          │     Marca de agua
│                                                             │     "Red FaCyT"
├─────────────────────────────────────────────────────────────┤
│ © 2026 Facultad Experimental de Ciencias y Tecnología       │  ← LandingFooter
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Copy Final Aprobado (Español)

```
[Header]
  Logo:   FaCyT Red Institucional
  Skip:   Omitir introducción
  Login:  Iniciar sesión

[Hero]
  H1:     FaCyT
  Sub:    Facultad Experimental de Ciencias y Tecnología
  Intro:  La gaceta digital de la facultad: noticias, avisos y vida universitaria.
  CTA 1:  Empezar (Primario, con acento azul --accent)
  CTA 2:  Ya tengo cuenta (Ghost / Secondary)

[Pilares]
  01:     Noticias y avisos
          Comunicados oficiales y agenda en un solo lugar.
  02:     Académico
          Cursos, talleres y defensas, organizados.
  03:     Vida universitaria
          Eventos y actividades para toda la comunidad.

[Comunidad]
  Clave:  Diseñado para profesores, estudiantes y personal administrativo.
  Badges: Estudiante · Profesor · Admin

[Cierre]
  H2:     Únete a la gaceta universitaria
  Body:   Publica comunicados, explora el feed y mantente al día con tu facultad.
  CTA 1:  Empezar
  CTA 2:  Ya tengo cuenta
```

---

## 7. Accesibilidad (WCAG 2.2 AA)

1. **Semántica HTML5:**
   - `<header>` para el `LandingHeader`.
   - `<main id="main-content">` contenedor único para la landing.
   - `<footer>` para el `LandingFooter`.
   - Jerarquía clara de títulos `<h1>` (solo uno) → `<h2>` → `<h3>`.
2. **Capa Parallax Segura:**
   - Todo elemento decorativo animado (números `01`, `02`, `03` de fondo, reglas, marca de agua) DEBE incluir `aria-hidden="true"`.
   - El texto legible y los botones interactivos NO sufren deformación de scroll ni alteración de contraste.
3. **Soporte `prefers-reduced-motion`:**
   - CSS Query `@media (prefers-reduced-motion: reduce)` anula las transformaciones de scroll (`transform: none!important`).
4. **Teclado y Contraste:**
   - Foco visible con anillo `--accent` (2px offset 2px) en `Skip`, CTAs y `ThemeToggle`.
   - Contraste `--text` sobre `--bg` ≥ 7:1; `--accent` en botón primario ≥ 4.5:1.
   - Target táctil mínimo de 44×44px.

---

## 8. Guía para el Desarrollador (`developer`)

- **Ruta:** `src/app/(landing)/page.tsx` y `src/app/(landing)/layout.tsx`.
- **Componentes sugeridos:**
  - `src/components/landing/landing-header.tsx`
  - `src/components/landing/landing-footer.tsx`
  - `src/components/landing/landing-hero.tsx`
  - `src/components/landing/parallax-section.tsx` (Hook / wrapper con CSS transform o scroll-driven animation).
- **Prohibiciones:**
  - NO importar la `Navbar` ni `BottomNav` ni `Sidebar` de `(main)`.
  - NO usar valores hexadecimales directos en línea; utilizar únicamente tokens CSS semánticos (`var(--bg)`, `var(--primary)`, `var(--accent)`).