# Design System — Red FaCyT (Tokens y componentes)

## 1. Implementación de tokens

Implementación prevista: CSS variables en `globals.css` combinadas con Tailwind. El modo oscuro usa la clase `.dark` en `<html>` (`darkMode: 'class'`) y `next-themes` para el toggle persistido en `localStorage`.

```
:root { /* light */
  --bg: #F5F7FA; --surface: #FFFFFF; --surface-muted: #EEF1F6;
  --text: #172033; --text-muted: #51607A;
  --primary: #1E3A5F; --accent: #2563EB;
  --border: #D8DEEA; --danger: #B91C1C;
  --success: #15803D; --warning: #B45309;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --space-1.. --space-12 (escala 4px);
}
.dark { /* dark: mismos nombres, valores de brief.md */ }
```

Los componentes usan **solo tokens semánticos** — prohibido color `hex` suelto en la UI (auditable con `design-system`).

## 2. Escala de espaciado y tipografía

| Escala | Valor |
| --- | --- |
| Spacing | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px |
| Tipo | Display 40 / H1 32 / H2 24 / H3 20 / Body 16 / Caption 14 |
| Radio | sm 4 / md 8 / lg 12 (botones well-rounded prohibido) |
| Sombras | solo `shadow-sm` en surface elevada; sin `shadow-lg` decorativo |

## 3. Inventario de componentes

### 3.1 Primitivos (`components/ui` — shadcn/ui)
- **Button** (variants: `primary`/acento, `secondary`/surface, `ghost`, `danger`; sizes sm/md/lg)
- **Input**, **Textarea**, **Select**, **Switch**, **Checkbox**
- **Label** (visible siempre, nunca placeholder como única etiqueta)
- **Card** (surface + border, sin sombra llamativa)
- **Badge** (estado: `borrador`, `publicado`, `oculto`, `admin/profesor/estudiante`)
- **Dialog** / **AlertDialog** (modal de confirmación de eliminación)
- **DropdownMenu** (menú de acciones en la card)
- **Tabs**, **Skeleton**, **Toast**, **Pagination**
- **Command** (search input si se usa combobox por autor/categoría)

### 3.2 Estructurales (`components/layout`)
- **Navbar** — logo FaCyT, enlaces (Feed, Perfil, Admin si aplica), `ThemeToggle`, menú de usuario.
- **Sidebar** (escritorio ≥ 1024px) — navegación secundaria; en móvil se sustituye por **BottomNav** (≤5 destinos).
- **ThemeToggle** — alterna `.dark`, renderiza icono sol/luna, aria-label, persistente con `next-themes`.
- **Footer** — institucional (facultad, año, enlace repositorio).

### 3.3 De dominio (`components/feed`, `components/forms`)
- **PostCard** — componentes de la home: título (serif), autor/rol, categoría, badge de visibilidad, fecha, extracto del contenido; acciones si es autor/admin.
- **PostDetail** — view completa; botones "Editar" / "Eliminar" (autor) y "Ocultar" / "Eliminar" (admin).
- **FilterBar** — buscador + filtros combinados (categoría, tipo, autor, palabra clave, fecha inicio/fin, estado).
- **SearchInput** — con label visible "Buscar publicaciones".
- **PostForm** — crear/editar: título, contenido, imagen (sin backend aún: campo deshabilitado o placeholder), tipo, visibilidad, categoría.
- **LoginForm** / **RegisterForm** — con validación inline y resumen de errores.

### 3.4 Compartidos (`components/shared`)
- **EmptyState** — feed/perfil sin publicaciones: mensaje + CTA.
- **Skeleton** — estados de carga (fase con datos estáticos: útil para simular latencia y probar CLS).
- **Toast** — feedback de "Publicado", "Cambios guardados", errores.
- **Pagination** — o carga incremental; decisión en fase de datos, aquí el componente de la UI.

## 4. Estados de cada card de publicación

| Estado | Badge | Visible para |
| --- | --- | --- |
| `publicado` | azul `--accent` | todos |
| `borrador` | gris `--surface-muted` | solo autor |
| `oculto` (por admin) | ámbar `--warning` | nadie excepto autor y admin |

Regla del feed: `visibility = 'publicado' OR author_id === sessionUser.id`. En fase estática, la sesión simulada vive en `src/data/`.

## 5. Reglas de consistencia

- Botón primario = único acento azul en la vista (un CTA por pantalla prioritario).
- El azul `--primary` (institucional) se usa en masthead/marca, no en CTAs (el acento `--accent` es el accionable).
- El peligro solo aparece en acciones destructivas confirmadas (AlertDialog).
- Metadatos (fecha, autor) siempre en `caption`/`--text-muted`, separados por divisores o comas — no por middle-dot ni em-dash.
- Iconos SVG (lucide/shadcn), nunca emoji como iconografía.