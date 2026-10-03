"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  applyTheme,
  getAppliedTheme,
  getServerTheme,
  getThemeToggleLabel,
  storeTheme,
  subscribeToThemeChanges,
  toggleTheme,
} from "@/lib/theme";

/** Props of {@link ThemeToggle}. */
export type ThemeToggleProps = {
  /** Extra class names. */
  className?: string;
};

/**
 * Icon-only switch between the light and dark colour themes.
 *
 * Accessibility notes (`docs/design/accessibility.md` §2 and §6):
 * - real `<button>` with a Spanish `aria-label` that announces the resulting mode;
 * - `aria-pressed` communicates the current state;
 * - 44×44px minimum touch target.
 *
 * The theme lives outside React, on the root element (the same class the
 * pre-paint bootstrap script sets), and is mirrored through
 * `useSyncExternalStore`. Reading it through a store instead of an effect keeps
 * the server HTML and the first client render identical, so there is no
 * hydration mismatch and no cascading re-render.
 *
 * @param props - Toggle props.
 * @returns The theme toggle button.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getAppliedTheme,
    getServerTheme,
  );

  function handleToggle() {
    const nextTheme = toggleTheme(theme);

    storeTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={theme === "dark"}
      aria-label={getThemeToggleLabel(theme)}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-text transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </button>
  );
}
