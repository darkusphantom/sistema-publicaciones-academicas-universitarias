# Brief de diseño — Red FaCyT

## 1. Concepto

**Identidad editorial-institucional** para la Facultad Experimental de Ciencias y Tecnología (FaCyT). La interfaz debe parecer la gaceta electrónica de una facultad, no una red social comercial. Esto responde directamente al enunciado del proyecto: *"No se evaluará la copia estética de redes sociales comerciales"*.

Tres principios rectores:
1. **Sobriedad académica** — orden, jerarquía clara, cero ruido decorativo.
2. **Confianza institucional** — azul profundo como ancla, formato editorial (titulares serif).
3. **Ciencia y tecnología** — un único acento azul vivo que guía la acción, sin gradientes ni burbujas de red social.

## 2. Audiencia y tono

- **Audiencia:** estudiantes, profesores y administración de la facultad.
- **Tono:** formal pero cercano; lenguaje de la interfaz en voz activa y oraciones cortas ("Publicar", "Guardar cambios", "Publicado").
- **Idioma de la UI:** español (interfaz) — el **código** permanece en inglés por regla del proyecto.

## 3. Sistema de color — modo claro/oscuro

Solo los colores conmutan entre temas; tipografía y espaciado son fijos. Los valores oscuros usan tintes más claros del mismo azul para mantener contraste WCAG AA.

| Token | Light | Dark | Uso |
| --- | --- | --- | --- |
| `--bg` | `#F5F7FA` | `#0B1220` | Fondo base |
| `--surface` | `#FFFFFF` | `#131C31` | Cards, nav, inputs |
| `--surface-muted` | `#EEF1F6` | `#1C2740` | Secciones destacadas, hover |
| `--text` | `#172033` | `#E6EAF2` | Texto principal |
| `--text-muted` | `#51607A` | `#93A1BC` | Metadatos, captions |
| `--primary` | `#1E3A5F` | `#7FA8E8` | Azul institucional (masthead, marca) |
| `--accent` | `#2563EB` | `#60A5FA` | Único azul vivo: CTAs, links, foco |
| `--border` | `#D8DEEA` | `#2B3A57` | Bordes y divisores |
| `--danger` | `#B91C1C` | `#F87171` | Errores y estados destructivos |
| `--success` | `#15803D` | `#4ADE80` | Éxito (toast, publicado) |
| `--warning` | `#B45309` | `#FBBF24` | Avisos (oculto, pendiente) |

## 4. Tipografía

- **Titulares (display):** serif editorial — da el carácter académico de "gaceta de la facultad".
- **Cuerpo y UI:** sans sansserif legible — neutral, sin personalidad ruidosa.
- **Escala:** una sola secuencia clara `display → h1 → h2 → h3 → body → caption`. Sin eyebrows en mayúsculas, sin etiquetas decorativas sobre el contenido.
- **Reglas:** cuerpo ≥ 16px, line-height 1.5–1.6, líneas ≤ 80 caracteres. Serif en cuerpo: line-height ligeramente mayor.

## 5. Layout

- **Alineación:** izquierda (editorial); centrado solo en elementos puntuales (hero, formular).
- **Grid del feed:** cards institucionales (borde fino + superficie), sombras mínimas o nulas. Nada de "flotar" tarjetas estilo red social.
- **Mobile-first:** una columna en móvil; grid 2–3 columnas en escritorio con contenedor de ancho máximo (~1120px).
- **Navegación:** `(main)` con navbar superior (logo + enlaces + ThemeToggle + usuario); en móvil, barra inferior con ≤5 destinos.

## 6. Guías de contenido (voz de la interfaz)

- Nombres por lo que el usuario entiende, no por el sistema: "Publicar", no "Enviar a repositorio".
- La acción mantiene el mismo nombre en todo el flujo: botón "Publicar" → toast "Publicación publicada".
- Errores concretos y sin disculpas: "El título es obligatorio", no "Ha ocurrido un error".
- Pantallas vacías = invitación a actuar: "Aún no hay publicaciones. Crea la primera".

## 7. Movimiento

- Mínimo y solo si responde a una acción del usuario (abrir, expandir, confirmar).
- Respetar `prefers-reduced-motion`. Sin animaciones decorativas de entrada en scroll.