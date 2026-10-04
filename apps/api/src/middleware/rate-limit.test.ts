import { Hono } from "hono";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRateLimiter, clientIp, resolveClientIdentity } from "./rate-limit";

/**
 * Obtiene la identidad IP que resuelve `clientIp` para unos headers dados.
 *
 * @param headers - Headers de la petición (p. ej. `x-forwarded-for`).
 * @returns La identidad resuelta por el middleware.
 */
async function ipViaApp(headers: Record<string, string>): Promise<string> {
  const app = new Hono();
  app.use("*", async (c, next) => {
    c.header("x-test-ip", clientIp(c));
    await next();
  });
  app.get("/", (c) => c.text("ok"));
  const response = await app.request("/", { headers });
  return response.headers.get("x-test-ip") ?? "";
}

describe("MemoryRateLimiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("check allows up to max requests and blocks the next one", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    expect(limiter.check("k")).toBe(true);
    expect(limiter.check("k")).toBe(true);
    expect(limiter.check("k")).toBe(true);
    expect(limiter.check("k")).toBe(false);
  });

  it("record + isBlocked only block once failures reach the max", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    expect(limiter.isBlocked("k")).toBe(false);
    limiter.record("k");
    limiter.record("k");
    expect(limiter.isBlocked("k")).toBe(false);
    limiter.record("k");
    expect(limiter.isBlocked("k")).toBe(true);
  });

  it("a key that is only checked (never fails) is never blocked", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    for (let index = 0; index < 10; index += 1) {
      expect(limiter.isBlocked("healthy")).toBe(false);
    }
  });

  it("sweeps expired entries so the store does not grow unbounded", () => {
    vi.useFakeTimers();
    const limiter = new MemoryRateLimiter(3, 60_000);
    limiter.record("a");
    limiter.record("b");
    expect(limiter.size()).toBe(2);
    vi.advanceTimersByTime(61_000);
    expect(limiter.isBlocked("a")).toBe(false);
    expect(limiter.size()).toBe(0);
    limiter.record("a");
    expect(limiter.size()).toBe(1);
  });

  it("reset clears a single key", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    limiter.record("a");
    limiter.record("b");
    limiter.reset("a");
    expect(limiter.size()).toBe(1);
  });
});

describe("resolveClientIdentity / clientIp", () => {
  it("combines the socket remote address with the XFF hop", () => {
    expect(resolveClientIdentity("203.0.113.7", "1.2.3.4, 10.0.0.1")).toBe(
      "203.0.113.7|1.2.3.4",
    );
  });

  it("uses the socket address alone when there is no X-Forwarded-For", () => {
    expect(resolveClientIdentity("203.0.113.7", undefined)).toBe("203.0.113.7");
  });

  it("falls back to the sanitized XFF hop when no socket is exposed", () => {
    expect(resolveClientIdentity(null, " 198.51.100.9 , 10.0.0.1 ")).toBe(
      "none|198.51.100.9",
    );
  });

  it("returns the socket address when neither source exists", () => {
    expect(resolveClientIdentity(null, undefined)).toBe("none");
  });

  it("clientIp reads and sanitizes x-forwarded-for on the request", async () => {
    expect(await ipViaApp({ "x-forwarded-for": " 203.0.113.5 " })).toBe(
      "none|203.0.113.5",
    );
    expect(await ipViaApp({})).toBe("none");
  });
});