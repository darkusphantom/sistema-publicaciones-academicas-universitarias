import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { AppError } from "../application/errors";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, csrf } from "./csrf";

/**
 * Construye una app mínima con el middleware CSRF sobre una ruta de mutación
 * y una de lectura, con el error handler de la app real (AppError → status).
 *
 * @param trustedOrigins - Orígenes permitidos.
 * @returns App Hono de prueba.
 */
function buildApp(trustedOrigins: string[] = ["http://localhost:3000"]): Hono {
  const app = new Hono();
  app.post("/mutate", csrf(trustedOrigins), (c) => c.text("ok", 200));
  app.get("/read", csrf(trustedOrigins), (c) => c.text("ok", 200));
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(
        { error: err.code, message: err.message },
        err.status as 400,
      );
    }
    return c.json({ error: "internal_error", message: "Internal server error" }, 500);
  });
  return app;
}

const TRUSTED = "http://localhost:3000";

describe("csrf middleware", () => {
  it("exempts GET requests (no token required)", async () => {
    const app = buildApp();
    expect((await app.request("/read")).status).toBe(200);
  });

  it("allows a mutation with trusted origin, cookie and matching header", async () => {
    const app = buildApp();
    const token = "a".repeat(64);
    const response = await app.request("/mutate", {
      method: "POST",
      headers: {
        origin: TRUSTED,
        cookie: `${CSRF_COOKIE_NAME}=${token}`,
        [CSRF_HEADER_NAME]: token,
      },
    });
    expect(response.status).toBe(200);
  });

  it("allows a mutation without Origin but with cookie and matching header", async () => {
    const app = buildApp();
    const token = "a".repeat(64);
    const response = await app.request("/mutate", {
      method: "POST",
      headers: {
        cookie: `${CSRF_COOKIE_NAME}=${token}`,
        [CSRF_HEADER_NAME]: token,
      },
    });
    expect(response.status).toBe(200);
  });

  it("rejects a mutation with the cookie but no header token", async () => {
    const app = buildApp();
    const response = await app.request("/mutate", {
      method: "POST",
      headers: {
        origin: TRUSTED,
        cookie: `${CSRF_COOKIE_NAME}=${"a".repeat(64)}`,
      },
    });
    expect(response.status).toBe(403);
  });

  it("rejects a mutation with a mismatched header token", async () => {
    const app = buildApp();
    const response = await app.request("/mutate", {
      method: "POST",
      headers: {
        origin: TRUSTED,
        cookie: `${CSRF_COOKIE_NAME}=${"a".repeat(64)}`,
        [CSRF_HEADER_NAME]: "attacker-token",
      },
    });
    expect(response.status).toBe(403);
  });

  it("rejects a mutation WITHOUT the CSRF cookie even if the header is present", async () => {
    const app = buildApp();
    const response = await app.request("/mutate", {
      method: "POST",
      headers: {
        origin: TRUSTED,
        [CSRF_HEADER_NAME]: "a".repeat(64),
      },
    });
    expect(response.status).toBe(403);
  });

  it("rejects a mutation with an origin outside the whitelist", async () => {
    const app = buildApp();
    const token = "a".repeat(64);
    const response = await app.request("/mutate", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        cookie: `${CSRF_COOKIE_NAME}=${token}`,
        [CSRF_HEADER_NAME]: token,
      },
    });
    expect(response.status).toBe(403);
  });
});