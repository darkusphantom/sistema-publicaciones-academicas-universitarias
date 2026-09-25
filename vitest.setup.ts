import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Unmounts the React tree rendered by a test before the next one starts.
 * Vitest runs without globals, so Testing Library cannot register this hook by
 * itself: without it, elements of a previous test would leak into the next one.
 */
afterEach(() => {
  cleanup();
});
