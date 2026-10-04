import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("applies the documented defaults when nothing is provided", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(3001);
    expect(env.HOST).toBe("0.0.0.0");
    expect(env.CORS_ORIGINS).toBe("http://localhost:3000");
    expect(env.MAX_BODY_BYTES).toBe(102_400);
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("parses a fully provided source into a typed environment", () => {
    const env = parseEnv({
      NODE_ENV: "production",
      PORT: "4000",
      HOST: "127.0.0.1",
      CORS_ORIGINS: "https://red.facyt.edu.ve, https://api.red.facyt.edu.ve",
      MAX_BODY_BYTES: "2048",
      LOG_LEVEL: "debug",
    });
    expect(env.NODE_ENV).toBe("production");
    expect(env.PORT).toBe(4000);
    expect(env.HOST).toBe("127.0.0.1");
    expect(env.CORS_ORIGINS).toBe(
      "https://red.facyt.edu.ve, https://api.red.facyt.edu.ve",
    );
    expect(env.MAX_BODY_BYTES).toBe(2048);
    expect(env.LOG_LEVEL).toBe("debug");
  });

  it("fails fast when CORS_ORIGINS is missing in production", () => {
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrow(/CORS_ORIGINS/);
  });

  it("allows CORS_ORIGINS to be absent outside production", () => {
    expect(() => parseEnv({ NODE_ENV: "test" })).not.toThrow();
  });

  it("fails fast on a non-numeric PORT", () => {
    expect(() => parseEnv({ PORT: "not-a-number" })).toThrow(/Invalid environment/);
  });

  it("fails fast on an unknown NODE_ENV", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow(/Invalid environment/);
  });

  it("fails fast on an invalid LOG_LEVEL", () => {
    expect(() => parseEnv({ LOG_LEVEL: "verbose" })).toThrow(/Invalid environment/);
  });

  it("fails fast on a whitespace-only CORS_ORIGINS", () => {
    expect(() => parseEnv({ CORS_ORIGINS: "   " })).toThrow(/Invalid environment/);
  });

  it("reserves future keys as optional", () => {
    const withReserved = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/red_facyt",
      BETTER_AUTH_SECRET: "0123456789abcdef",
      BETTER_AUTH_URL: "http://localhost:3001",
      RATE_LIMIT_MAX: "100",
      RATE_LIMIT_WINDOW_MS: "60000",
    });
    expect(withReserved.DATABASE_URL).toBe("postgresql://localhost:5432/red_facyt");
    expect(withReserved.BETTER_AUTH_SECRET).toBe("0123456789abcdef");
    expect(withReserved.BETTER_AUTH_URL).toBe("http://localhost:3001");
    expect(withReserved.RATE_LIMIT_MAX).toBe(100);
    expect(withReserved.RATE_LIMIT_WINDOW_MS).toBe(60000);

    const withoutReserved = parseEnv({});
    expect(withoutReserved.DATABASE_URL).toBeUndefined();
    expect(withoutReserved.BETTER_AUTH_SECRET).toBeUndefined();
    expect(withoutReserved.BETTER_AUTH_URL).toBeUndefined();
  });
});