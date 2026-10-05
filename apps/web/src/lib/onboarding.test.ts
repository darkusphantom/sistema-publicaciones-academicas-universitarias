import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ONBOARDING_SEEN_VALUE,
  ONBOARDING_STORAGE_KEY,
  hasSeenOnboarding,
  markOnboardingAsSeen,
} from "./onboarding";

/**
 * In-memory stand-in for the Web Storage API used by the onboarding guard.
 */
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
});

afterEach(() => {
  window.localStorage.clear();
});

describe("onboarding contract", () => {
  it("stores the flag under the key defined in the design spec", () => {
    expect(ONBOARDING_STORAGE_KEY).toBe("facy:onboarding");
  });

  it("marks the introduction as seen with the 'visto' value", () => {
    expect(ONBOARDING_SEEN_VALUE).toBe("visto");
  });
});

describe("hasSeenOnboarding", () => {
  it("returns false on a first visit (no flag stored)", () => {
    expect(hasSeenOnboarding(new MemoryStorage())).toBe(false);
  });

  it("returns true once the introduction has been seen", () => {
    const storage = new MemoryStorage();
    markOnboardingAsSeen(storage);

    expect(hasSeenOnboarding(storage)).toBe(true);
  });

  it("returns false when the stored value is not the 'visto' marker", () => {
    const storage = new MemoryStorage();
    storage.setItem(ONBOARDING_STORAGE_KEY, "pendiente");

    expect(hasSeenOnboarding(storage)).toBe(false);
  });

  it("treats the absence of storage (server rendering) as a first visit", () => {
    expect(hasSeenOnboarding(null)).toBe(false);
  });

  it("returns false instead of throwing when storage access is blocked", () => {
    expect(hasSeenOnboarding(blockedStorage)).toBe(false);
  });

  it("reads window.localStorage by default", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);

    expect(hasSeenOnboarding()).toBe(true);
  });

  it("treats a missing window as a first visit", () => {
    vi.stubGlobal("window", undefined);

    expect(hasSeenOnboarding()).toBe(false);

    vi.unstubAllGlobals();
  });
});

describe("markOnboardingAsSeen", () => {
  it("writes the 'visto' marker under the onboarding key", () => {
    const storage = new MemoryStorage();

    expect(markOnboardingAsSeen(storage)).toBe(true);
    expect(storage.getItem(ONBOARDING_STORAGE_KEY)).toBe(ONBOARDING_SEEN_VALUE);
  });

  it("is idempotent", () => {
    const storage = new MemoryStorage();

    markOnboardingAsSeen(storage);
    markOnboardingAsSeen(storage);

    expect(storage.getItem(ONBOARDING_STORAGE_KEY)).toBe(ONBOARDING_SEEN_VALUE);
  });

  it("reports a failure without throwing when storage access is blocked", () => {
    expect(markOnboardingAsSeen(blockedStorage)).toBe(false);
  });

  it("reports a failure when no storage is available (server rendering)", () => {
    expect(markOnboardingAsSeen(null)).toBe(false);
  });

  it("writes to window.localStorage by default", () => {
    expect(markOnboardingAsSeen()).toBe(true);
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe(
      ONBOARDING_SEEN_VALUE,
    );
  });

  it("reports a failure when the browser blocks access to localStorage", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new DOMException("Storage is blocked", "SecurityError");
      },
    });

    expect(markOnboardingAsSeen()).toBe(false);

    vi.unstubAllGlobals();
  });
});
