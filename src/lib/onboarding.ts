/**
 * Onboarding flag helpers for the public welcome screen.
 *
 * The welcome introduction is a first-visit experience. Because the static
 * frontend phase has no backend, the "already seen" decision is persisted in
 * `localStorage` (see `docs/design/welcome.md` §2) and read on the client.
 *
 * Every read/write is defensive: storage may be unavailable during server
 * rendering and may throw when the browser blocks it (private mode, cookies
 * disabled), and a broken flag must never break the navigation.
 */

/** Key that holds the welcome-onboarding flag in `localStorage`. */
export const ONBOARDING_STORAGE_KEY = "facy:onboarding";

/** Value stored under {@link ONBOARDING_STORAGE_KEY} once the introduction is seen. */
export const ONBOARDING_SEEN_VALUE = "visto";

/**
 * Minimal Web Storage surface required by the onboarding helpers.
 * Keeping it narrow makes the logic testable with a plain in-memory double.
 */
export type OnboardingStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Resolves the storage to operate on.
 *
 * @returns `window.localStorage` in the browser, or `null` while server rendering.
 */
function resolveStorage(): OnboardingStorage | null {
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
 * Tells whether the welcome introduction has already been seen.
 *
 * @param storage - Storage to read from; defaults to `window.localStorage`.
 * @returns `true` only when the flag holds the {@link ONBOARDING_SEEN_VALUE} marker.
 * @complexity O(1) — a single storage read.
 */
export function hasSeenOnboarding(
  storage: OnboardingStorage | null = resolveStorage(),
): boolean {
  if (storage === null) {
    return false;
  }

  try {
    return storage.getItem(ONBOARDING_STORAGE_KEY) === ONBOARDING_SEEN_VALUE;
  } catch {
    return false;
  }
}

/**
 * Persists that the welcome introduction has been seen.
 *
 * @param storage - Storage to write to; defaults to `window.localStorage`.
 * @returns `true` when the flag was written, `false` when storage is unavailable.
 * @complexity O(1) — a single storage write.
 */
export function markOnboardingAsSeen(
  storage: OnboardingStorage | null = resolveStorage(),
): boolean {
  if (storage === null) {
    return false;
  }

  try {
    storage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);
    return true;
  } catch {
    return false;
  }
}
