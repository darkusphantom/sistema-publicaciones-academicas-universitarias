/**
 * Colour theme helpers (light/dark) for the Red FaCyT design tokens.
 *
 * The dark theme is applied through the `.dark` class on the root element, as
 * mandated by `docs/architecture/frontend-structure.md` §5. `next-themes` is
 * still pending installation (see `docs/architecture/progress.md`), so this
 * module owns the small amount of logic the project needs today:
 *
 * - reading and persisting the user preference in `localStorage`;
 * - deciding which theme applies on a first visit (system preference);
 * - toggling the `.dark` class and the native `color-scheme`;
 * - the inline bootstrap script that avoids a light flash before the first paint;
 * - the accessible label of the icon-only toggle.
 */

/** Key that holds the colour theme preference in `localStorage`. */
export const THEME_STORAGE_KEY = "facy:theme";

/** Supported colour themes. */
export type Theme = "light" | "dark";

/** Theme used when nothing is stored and the system does not prefer dark mode. */
export const DEFAULT_THEME: Theme = "light";

/**
 * Event dispatched on `window` after the theme is applied, so the components
 * that mirror it (the toggle label and state) can re-render.
 */
export const THEME_CHANGE_EVENT = "facyt-theme-change";

/**
 * Minimal Web Storage surface required by the theme helpers.
 */
export type ThemeStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Type guard that validates a raw stored value.
 *
 * @param value - Raw value read from storage.
 * @returns `true` when the value is one of the supported {@link Theme}s.
 * @complexity O(1) — a comparison against two literals.
 */
export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * Decides which theme to apply.
 *
 * @param prefersDark - Whether the system prefers the dark colour scheme.
 * @param stored - Theme previously stored by the user, if any.
 * @returns The stored theme when present, otherwise the system-derived one.
 * @complexity O(1) — constant-time selection.
 */
export function resolveTheme(prefersDark: boolean, stored: Theme | null): Theme {
  if (stored !== null) {
    return stored;
  }

  return prefersDark ? "dark" : DEFAULT_THEME;
}

/**
 * Returns the opposite theme of the given one.
 *
 * @param theme - Current theme.
 * @returns The theme to switch to.
 * @complexity O(1).
 */
export function toggleTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/**
 * Resolves the storage to operate on.
 *
 * @returns `window.localStorage` in the browser, or `null` while server rendering.
 */
function resolveStorage(): ThemeStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads the theme previously stored by the user.
 *
 * @param storage - Storage to read from; defaults to `window.localStorage`.
 * @returns The stored theme, or `null` when missing, invalid or unreadable.
 * @complexity O(1) — a single storage read.
 */
export function readStoredTheme(
  storage: ThemeStorage | null = resolveStorage(),
): Theme | null {
  if (storage === null) {
    return null;
  }

  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Persists the theme selected by the user.
 *
 * @param theme - Theme to persist.
 * @param storage - Storage to write to; defaults to `window.localStorage`.
 * @complexity O(1) — a single storage write.
 */
export function storeTheme(
  theme: Theme,
  storage: ThemeStorage | null = resolveStorage(),
): void {
  if (storage === null) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is blocked (private mode, cookies disabled): the theme still
    // applies to the current document, it simply will not be remembered.
  }
}

/**
 * Applies a theme to the document and notifies its subscribers.
 *
 * @param theme - Theme to apply to the root element.
 * @complexity O(1) — a single class toggle, one inline style and one event.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/**
 * Reads the theme currently applied to the document.
 *
 * Used as the client snapshot of the theme store: the root element is the single
 * source of truth, so the markup rendered by the server and the state of React
 * can never disagree.
 *
 * @returns The applied theme.
 * @complexity O(1) — a single class check.
 */
export function getAppliedTheme(): Theme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : DEFAULT_THEME;
}

/**
 * Theme reported while server rendering, where the document does not exist yet.
 *
 * @returns The default light theme.
 * @complexity O(1).
 */
export function getServerTheme(): Theme {
  return DEFAULT_THEME;
}

/**
 * Subscribes to theme changes.
 *
 * @param onThemeChange - Callback invoked whenever {@link applyTheme} runs.
 * @returns The function that cancels the subscription.
 * @complexity O(1) — a single listener registration.
 */
export function subscribeToThemeChanges(onThemeChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  };
}

/**
 * Builds the accessible label of the icon-only theme toggle.
 *
 * The label announces the action to perform, not the current state
 * (`docs/design/accessibility.md` §2 and §6).
 *
 * @param theme - Currently applied theme.
 * @returns Spanish label describing the resulting mode.
 * @complexity O(1).
 */
export function getThemeToggleLabel(theme: Theme): string {
  return theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
}

/**
 * Inline script injected in the document `<head>` to apply the theme before the
 * first paint, so dark-mode visitors never see a white flash (WCAG-friendly,
 * see `docs/design/accessibility.md` §5).
 *
 * It is intentionally tiny, dependency-free and wrapped in `try/catch`: it runs
 * in the browser before hydration, where storage access may still be blocked.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var s=localStorage.getItem(k);var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;
