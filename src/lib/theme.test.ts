import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_THEME,
  THEME_BOOTSTRAP_SCRIPT,
  THEME_STORAGE_KEY,
  applyTheme,
  getAppliedTheme,
  getServerTheme,
  getThemeToggleLabel,
  isTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  subscribeToThemeChanges,
  toggleTheme,
  type Theme,
} from "./theme";

/** In-memory stand-in for the Web Storage API. */
class MemoryStorage {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

/** Storage double that always throws, mimicking blocked storage (private mode). */
const blockedStorage = {
  getItem(): string | null {
    throw new DOMException("Storage is blocked", "SecurityError");
  },
  setItem(): void {
    throw new DOMException("Storage is blocked", "SecurityError");
  },
};

beforeEach(() => {
  window.localStorage.clear();
  applyTheme(DEFAULT_THEME);
});

afterEach(() => {
  window.localStorage.clear();
  applyTheme(DEFAULT_THEME);
});

describe("theme contract", () => {
  it("stores the preference under the 'facy:theme' key", () => {
    expect(THEME_STORAGE_KEY).toBe("facy:theme");
  });

  it("falls back to the light theme", () => {
    expect(DEFAULT_THEME).toBe("light");
  });
});

describe("isTheme", () => {
  it("accepts the two supported themes", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isTheme("neon")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("follows the system preference when nothing is stored", () => {
    expect(resolveTheme(true, null)).toBe("dark");
    expect(resolveTheme(false, null)).toBe("light");
  });

  it("gives priority to the stored preference over the system one", () => {
    expect(resolveTheme(true, "light")).toBe("light");
    expect(resolveTheme(false, "dark")).toBe("dark");
  });
});

describe("readStoredTheme", () => {
  it("returns null when no preference is stored", () => {
    expect(readStoredTheme(new MemoryStorage())).toBeNull();
  });

  it("returns the stored theme", () => {
    const storage = new MemoryStorage();
    storage.setItem(THEME_STORAGE_KEY, "dark");

    expect(readStoredTheme(storage)).toBe("dark");
  });

  it("returns null when the stored value is not a valid theme", () => {
    const storage = new MemoryStorage();
    storage.setItem(THEME_STORAGE_KEY, "sepia");

    expect(readStoredTheme(storage)).toBeNull();
  });

  it("returns null instead of throwing when storage access is blocked", () => {
    expect(readStoredTheme(blockedStorage)).toBeNull();
  });

  it("returns null when no storage is available (server rendering)", () => {
    expect(readStoredTheme(null)).toBeNull();
  });

  it("reads window.localStorage by default", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    expect(readStoredTheme()).toBe("dark");
  });

  it("treats a missing window as no stored preference", () => {
    vi.stubGlobal("window", undefined);

    expect(readStoredTheme()).toBeNull();

    vi.unstubAllGlobals();
  });
});

describe("storeTheme", () => {
  it("persists the theme", () => {
    const storage = new MemoryStorage();

    storeTheme("dark", storage);

    expect(storage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("does not throw when storage access is blocked", () => {
    expect(() => storeTheme("dark", blockedStorage)).not.toThrow();
  });

  it("does nothing when no storage is available (server rendering)", () => {
    expect(() => storeTheme("dark", null)).not.toThrow();
  });

  it("persists to window.localStorage by default", () => {
    storeTheme("dark");

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("does not throw when the browser blocks access to localStorage", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new DOMException("Storage is blocked", "SecurityError");
      },
    });

    expect(() => storeTheme("dark")).not.toThrow();

    vi.unstubAllGlobals();
  });
});

describe("applyTheme", () => {
  it("adds the 'dark' class to the document element for the dark theme", () => {
    applyTheme("dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("removes the 'dark' class for the light theme", () => {
    applyTheme("dark");
    applyTheme("light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

describe("theme store", () => {
  it("reads the theme applied to the document", () => {
    expect(getAppliedTheme()).toBe("light");

    applyTheme("dark");

    expect(getAppliedTheme()).toBe("dark");
  });

  it("reports the default theme while server rendering", () => {
    expect(getServerTheme()).toBe("light");
  });

  it("notifies subscribers when the theme is applied", () => {
    const onThemeChange = vi.fn();
    const unsubscribe = subscribeToThemeChanges(onThemeChange);

    applyTheme("dark");
    expect(onThemeChange).toHaveBeenCalledTimes(1);

    unsubscribe();
    applyTheme("light");
    expect(onThemeChange).toHaveBeenCalledTimes(1);
  });
});

describe("getThemeToggleLabel", () => {
  it("announces the resulting mode as a real button label", () => {
    expect(getThemeToggleLabel("light")).toBe("Cambiar a modo oscuro");
    expect(getThemeToggleLabel("dark")).toBe("Cambiar a modo claro");
  });
});

describe("THEME_BOOTSTRAP_SCRIPT", () => {
  it("applies the stored theme before the first paint", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("classList");
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("prefers-color-scheme: dark");
  });

  it("never throws when storage is unavailable", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("try");
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("catch");
  });
});

describe("toggleTheme", () => {
  it("switches to the opposite theme", () => {
    expect(toggleTheme("light")).toBe<Theme>("dark");
    expect(toggleTheme("dark")).toBe<Theme>("light");
  });
});
