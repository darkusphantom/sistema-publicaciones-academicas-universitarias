# Accesibilidad — Red FaCyT

Cumplimiento objetivo: **WCAG 2.2 nivel AA** en ambos temas (claro y oscuro). Este documento es la lista de decisión por pantalla; el `developer` debe respetarla en cada componente.

## 1. Contraste

| Par | Requisito AA | Verificación en paleta |
| --- | --- | --- |
| Texto body sobre `--bg`/`--surface` | ≥ 4.5:1 | `--text` sobre `#FFFFFF`: **ok**; `--text` (#E6EAF2) sobre `#131C31` (dark): **ok** |
| `--text-muted` (captions) | ≥ 4.5:1 | Verificar con herramienta al implementar; si falla, subir a `#6A7A96` (light) |
| `--accent` sobre `--surface` | ≥ 3:1 para UI (links/borde) y ≥ 4.5:1 si es texto en botones | `#2563EB` sobre blanco: ok para texto 4.5:1; dark `#60A5FA` sobre `#131C31`: ok |
| `--danger`, `--warning`, `--success` como texto | ≥ 4.5:1 | Tokens oscuros (`#F87171`, `#FBBF24`, `#4ADE80`) sí; valores light verificarse |
| Badges de estado | Distinguibles **no solo por color**: siempre van acompañados de texto ("Publicado", "Borrador") | — |

Regla: **ningún estado se comunica solo con color** (WCAG 1.4.1).

## 2. Foco y teclado

- **Foco visible** en todos los elementos interactivos: anillo de `--accent` de 2px con offset 2px (no se elimina el outline del navegador).
- Orden de tabulación lógico: navbar → contenido → filtros → feed → footer. Sin reordenaciones.
- **No trampas de foco**: modales (AlertDialog de eliminar) con `aria-modal`, foco inicial en el botón de confirmación y retorno al disparador al cerrar (Esc también cierra).
- Menús desplegables (dropdown del card `⋮`, combobox de filtros): navegables por teclado (arrows), cerrable con Esc.
- Tema del `ThemeToggle`: botón real con `aria-pressed`/`aria-label="Cambiar a modo oscuro"`.

## 3. Semántica y estructura

- Landmarks: `<header>` (navbar), `<main>` (una sola), `<footer>`. El footer de la nav pública y el del layout autenticado: correctos por página.
- Encabezados jerárquicos sin saltos (h1 → h2 → h3).
- Cada `Card` de publicación: `article` con `h2` o `h3` como título y `aria-label` descriptivo si enlaza a detalle.
- Feed: avisar resultados — el contador de resultados del filtro tiene `aria-live="polite"` ("24 resultados").

## 4. Formularios

- **Etiquetas visibles** asociadas (`<label for>` o `aria-labelledby`) — nunca placeholder como única etiqueta.
- **Errores inline junto al campo**: mensaje de error con `role="alert"`, además de un **resumen de errores** al inicio del formulario (WCAG 3.3.1/3.3.3). Ej.: "El título es obligatorio".
- Validación en vivo solo tras abandonar el campo; nunca bloquear el submit sin explicar.
- Inputs accesibles por nombre: "Buscar publicaciones", "Contraseña", etc.

## 5. Movimiento, Parallax y Animaciones

- **`prefers-reduced-motion: reduce`**: desactiva todas las animaciones, transiciones y efectos de parallax en scroll. Los elementos de la pantalla de bienvenida se renderizan estáticos en posición natural.
- **Parallax Accesible (Capas de Fondo):**
  - Los elementos con movimiento parallax (desfase de scroll) deben ser **únicamente capas decorativas de fondo** (números `01/02/03`, reglas horizontales, marcas de agua).
  - Toda capa parallax decorativa DEBE llevar `aria-hidden="true"` para evitar que los lectores de pantalla anuncien elementos duplicados o fuera de contexto durante el desplazamiento.
  - El texto legible (titulares, cuerpo, captions) y los controles interactivos (botones CTAs, enlaces, toggles) NUNCA deben sufrir distorsión, movimiento excesivo ni alteraciones de opacidad que impidan su lectura.
- Ningún parpadeo > 3 destellos/segundo (WCAG 2.3.1).
- Transiciones de tema (claro/oscuro): instantáneas o con `transition` corta y respetando reduced-motion (evitar flash de fondo en el toggle → aplicar clase `.dark` en `<html>` antes de pintar para no parpadear blanco).

## 6. Pantallas y estados

- **EmptyState**: no solo color/imagen — texto accionable + CTA real.
- **Skeleton**: evitar "bailes" (espacio reservado, sin CLS); `aria-hidden` mientras carga y contenido real al terminar.
- **Toast**: `role="status"` (éxito) / `role="alert"` (error), auto-dismiss ≥ 5s o con botón de cierre, sin bloquear el foco.
- Imágenes (bonificación futura): `alt` descriptivo obligatorio; decorativas con `alt=""`.
- Botones icon-only (⋮ acciones, ThemeToggle): siempre `aria-label`.
- Target de toque ≥ 44×44px (WCAG 2.5.8/2.5.5).

## 7. Verificación durante implementación

- Auditoría automatizada en el pipeline del `developer` (axe/Lighthouse) al menos una vez por pantalla.
- Checklist manual por pantalla antes de pasar a revisión:
  1. Solo teclado completo (Tab, Enter, Esc).
  2. Contraste AA en ambos temas (medido por tokens, no a ojo).
  3. Narrativa del lector de pantalla: título → contenido → acciones.
  4. Zoom 200% sin pérdida de contenido ni scroll horizontal.
  5. Foco nunca invisible.