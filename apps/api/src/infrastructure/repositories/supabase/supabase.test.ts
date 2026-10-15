import { describe, expect, it } from "vitest";
import { NotImplementedError } from "../../../application/errors";
import { parseEnv } from "../../../config/env";
import type { Session } from "../../../domain/session";
import { DEFAULT_POST_FILTERS } from "../../../domain/post";
import { createRepositories } from "../create-repositories";
import { InMemoryPostRepository } from "../in-memory/in-memory-post-repository";
import { InMemoryUserRepository } from "../in-memory/in-memory-user-repository";
import { MemoryUserStore } from "../in-memory/user-store";
import { createSupabaseClient } from "./supabase-client";
import { SupabasePostRepository } from "./supabase-post-repository";
import { SupabaseUserRepository } from "./supabase-user-repository";

/** Entorno de Supabase ficticio: los stubs no hacen red, solo se construyen. */
const SUPABASE_ENV = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_example",
};

/** Sesión mínima para las firmas del contrato. */
const SESSION: Session = {
  user: { id: "u-1", username: "a.rivas", role: "estudiante" },
  expiresAt: "2099-01-01T00:00:00Z",
};

describe("createSupabaseClient", () => {
  it("falla si faltan SUPABASE_URL o SUPABASE_SECRET_KEY", () => {
    const env = parseEnv({ SUPABASE_URL: "https://example.supabase.co" });
    expect(() => createSupabaseClient(env)).toThrow(/SUPABASE_URL and SUPABASE_SECRET_KEY/);
  });

  it("construye el cliente con URL + secret key", () => {
    const env = parseEnv(SUPABASE_ENV);
    expect(createSupabaseClient(env)).toBeDefined();
  });
});

describe("Supabase adapters (scaffold sin implementar)", () => {
  it("PostRepository: cada método lanza NotImplementedError (no simula datos)", async () => {
    const repo = new SupabasePostRepository(createSupabaseClient(parseEnv(SUPABASE_ENV)));
    await expect(
      repo.findVisible(DEFAULT_POST_FILTERS, { limit: 6, offset: 0 }, SESSION),
    ).rejects.toBeInstanceOf(NotImplementedError);
    await expect(repo.findById("p-1")).rejects.toBeInstanceOf(NotImplementedError);
    await expect(
      repo.create({
        title: "Título de prueba",
        content: "Cuerpo de prueba con longitud suficiente.",
        category: "computacion",
        type: "defensas",
        researchArea: "general",
        visibility: "publicado",
        imageUrl: null,
        authorId: "u-1",
        publishedAt: "2026-03-01T00:00:00Z",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      }),
    ).rejects.toBeInstanceOf(NotImplementedError);
    await expect(repo.update("p-1", { title: "x" })).rejects.toBeInstanceOf(
      NotImplementedError,
    );
    await expect(repo.delete("p-1")).rejects.toBeInstanceOf(NotImplementedError);
  });

  it("UserRepository: cada método lanza NotImplementedError", async () => {
    const repo = new SupabaseUserRepository(createSupabaseClient(parseEnv(SUPABASE_ENV)));
    await expect(repo.listAuthors()).rejects.toBeInstanceOf(NotImplementedError);
    await expect(repo.findById("u-1")).rejects.toBeInstanceOf(NotImplementedError);
    await expect(repo.findByUsername("a.rivas")).rejects.toBeInstanceOf(
      NotImplementedError,
    );
    await expect(repo.findByEmail("a@correo.com")).rejects.toBeInstanceOf(
      NotImplementedError,
    );
    await expect(repo.updateRole("u-1", "admin")).rejects.toBeInstanceOf(
      NotImplementedError,
    );
  });
});

describe("createRepositories", () => {
  it("sin claves de Supabase usa los adaptadores en memoria (fallback de desarrollo)", () => {
    const env = parseEnv({ NODE_ENV: "test", LOG_LEVEL: "silent" });
    const repos = createRepositories(env, new MemoryUserStore());
    expect(repos.posts).toBeInstanceOf(InMemoryPostRepository);
    expect(repos.users).toBeInstanceOf(InMemoryUserRepository);
  });

  it("con SUPABASE_URL + SUPABASE_SECRET_KEY usa los adaptadores de Supabase", () => {
    const env = parseEnv(SUPABASE_ENV);
    const repos = createRepositories(env, new MemoryUserStore());
    expect(repos.posts).toBeInstanceOf(SupabasePostRepository);
    expect(repos.users).toBeInstanceOf(SupabaseUserRepository);
  });
});
