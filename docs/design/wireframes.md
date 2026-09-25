# Wireframes y Navegación — Red FaCyT (Estrategia Mobile-First Slider)

Este documento detalla la estructura visual y de navegación para la vista de bienvenida `/` (`(landing)`), organizada en torno a un **deslizante (slider/carrusel) interactivo y responsivo**.

---

## 1. Mapa de Navegación del Flujo de Bienvenida

```
                          ┌───────────────────────────┐
                          │    PÁGINA DE BIENVENIDA   │
                          │   / (landing/page.tsx)    │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  SLIDE 1: BIENVENIDA │ ──►│ SLIDE 2: COMUNICADOS │ ──►│ SLIDE 3: ACADÉMICO   │
│ Gaceta Digital FaCyT │ ◄──│  Noticias y Avisos   │ ◄──│  Defensas y Tesis    │
└──────────────────────┘    └──────────────────────┘    └──────────┬───────────┘
                                                                   │
                                                                   ▼
┌──────────────────────┐                                ┌──────────────────────┐
│       REGISTRO       │ ◄──────────────────────────────│   SLIDE 4: COMUNIDAD │
│      (/register)     │    Botón "Empezar" / CTA       │  Únete a la Red + CTA│
└──────────────────────┘                                └──────────┬───────────┘
                                                                   │
┌──────────────────────┐                                           │
│    INICIO SESIÓN     │ ◄─────────────────────────────────────────┘
│       (/login)       │    Botón "Ya tengo cuenta" / "Omitir"
└──────────────────────┘
```

---

## 2. Wireframe Móvil (360px - 480px) — Vista Principal

### 2.1 Estructura en Móvil (Mobile-First)

```
┌───────────────────────────────────────────┐
│ [FaCyT Logo]                 [🌙] [Omitir] │  ← Header Superior Fijo
├───────────────────────────────────────────┤
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │ SLIDE 1 / 4                           │ │  ← Contenedor Deslizante (Swipeable)
│ │                                       │ │
│ │  [ILUSTRACIÓN HERO]                   │ │
│ │                                       │ │
│ │  Gaceta Digital FaCyT                 │ │  ← Titular H1 Serif
│ │  Facultad Experimental de Ciencias    │ │
│ │  y Tecnología                         │ │
│ │                                       │ │
│ │  Tu espacio oficial para noticias,    │ │  ← Subtítulo descriptivo
│ │  eventos y publicaciones científicas. │ │
│ └───────────────────────────────────────┘ │
│                                           │
│           [ ●  ○  ○  ○ ]                  │  ← Indicadores de Diapositiva (Pills)
│                                           │
├───────────────────────────────────────────┤
│ [ Empezar (Registro) ]                    │  ← Botón Primario Ámbar/Acento (Sticky)
│ [ Ya tengo cuenta (Login) ]               │  ← Enlace/Botón Secundario
└───────────────────────────────────────────┘
```

---

## 3. Wireframe Escritorio (1024px+) — Adaptación Responsiva

En computadoras de escritorio, la vista se centra elegantemente sobre el fondo neutro oscuro (`#0B0F19`), mostrando una tarjeta amplia de 2 columnas con navegación por flechas.

### 3.1 Estructura en Escritorio

```
┌───────────────────────────────────────────────────────────────────────────┐
│  [FaCyT Logo Gaceta]                             [🌙 Tema] [Omitir ↦]     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│            ┌─────────────────────────────────────────────────┐            │
│            │ SLIDE ACTIVE (2 columnas)                       │            │
│            │                                                 │            │
│  [◄ Prev]  │  ┌────────────────────┬──────────────────────┐  │  [Next ►]  │
│            │  │ TEXTO E INFORMACIÓN│ ILUSTRACIÓN / ASSET  │  │            │
│            │  │                    │                      │  │            │
│            │  │ Red FaCyT          │  [ facyt_hero_       │  │            │
│            │  │ La gaceta digital  │    gazette.png ]     │  │            │
│            │  │ universitaria.     │                      │  │            │
│            │  │                    │                      │  │            │
│            │  │ [ Empezar ahora ]  │                      │  │            │
│            │  └────────────────────┴──────────────────────┘  │            │
│            └─────────────────────────────────────────────────┘            │
│                                                                           │
│                              [ ●  ○  ○  ○ ]                               │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│  © 2026 Facultad Experimental de Ciencias y Tecnología — Universidad      │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Desglose de Diapositivas (Contenido del Slider)

| Diapositiva | Ilustración / Asset | Titular | Descripción | Acción Destacada |
| --- | --- | --- | --- | --- |
| **Slide 1: Presentación** | `facyt_hero_gazette.png` | **Red FaCyT: La Gaceta Digital** | La plataforma oficial de comunicación, noticias y ciencia de la Facultad Experimental de Ciencias y Tecnología. | Siguiente ➔ / Empezar |
| **Slide 2: Noticias** | `news_pillar_icon.png` | **01. Avisos y Comunicados** | Entérate al instante de comunicados decanales, noticias departamentales y boletines académicos. | Siguiente ➔ |
| **Slide 3: Académico** | `academic_pillar_icon.png` | **02. Publicaciones y Defensas** | Explora carteleras de trabajos de grado, publicaciones de investigación y seminarios de la facultad. | Siguiente ➔ |
| **Slide 4: Comunidad** | `campus_pillar_icon.png` | **03. Vida Universitaria** | Participa activa e integradamente como estudiante, profesor o personal administrativo. | **[ Empezar Registro ]** |

---

## 5. Comportamientos Interactivos

1. **Gestos Táctiles (Swipe en Móvil):**
   - Deslizar a la izquierda avanza a la siguiente diapositiva.
   - Deslizar a la derecha regresa a la diapositiva anterior.
2. **Navegación por Teclado:**
   - Teclas `Flecha Izquierda` y `Flecha Derecha` cambian la diapositiva activa.
3. **Indicadores de Diapositiva (Dots/Pills):**
   - Al hacer clic o tap en un punto indicador, cambia directamente a esa diapositiva.
   - El punto activo se expande (`w-8`) y toma el color de acento `--accent` (#F59E0B).