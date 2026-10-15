import { describe, expect, it } from "vitest";
import { NotImplementedError } from "../../../application/errors";
import { parseEnv } from "../../../config/env";
import type { Session } from "../../../domain/session";
import { DEFAULT_POST_FILTERS } from "../../../domain/post";
import { createRepositories } from "../create-repositories";
import { InMemoryPostRepository } from "../in-memory/in-memory-post-repository";
import { InMemoryUserRepository } from "../in-memory/in-memory-user-repository";
import { MemoryUserStore } from "../in-memory/user-store";
import { PostgresPostRepository } from "./postgres-post-repository";
import { PostgresUserRepository } from "./postgres-user-repository";

/** Cadena ficticia: los stubs no abren conexión, solo validan que exista. */
const CONNECTION = "postgresql://postgres.ref:secret@aws-0.pooler.supabase.com:5432/postgres";

/** Sesión mínima para las firmas del contrato. */
const SESSION: Session = {
  user: { id: "u-1", username: "a.rivas", role: "estudiante" },
  expiresAt: "2099-01-01T00:00:00Z",
};

describe("Postgres adapters (scaffold sin implementar)", () => {
  it("falla rápido si falta la cadena de conexión", () => {
    expect(() => new PostgresPostRepository("")).toThrow(/DATABASE_URL/);
    expect(() => new PostgresUserRepository("")).toThrow(/DATABASE_URL/);
  });

  it("PostRepository: cada método lanza NotImplementedError (no simula datos)", async () => {
    const repo = new PostgresPostRepository(CONNECTION);
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
    const repo = new PostgresUserRepository(CONNECTION);
    await expect(repo.listAuthors()).rejects.toBeInstanceOf(NotImplementedError);
    await expect(repo.findById("u-1")).rejects.toBeInstanceOf(
      NotImplementedError,
    );
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
  it("sin DATABASE_URL usa los adaptadores en memoria (fallback de desarrollo)", () => {
    const env = parseEnv({ NODE_ENV: "test", LOG_LEVEL: "silent" });
    const repos = createRepositories(env, new MemoryUserStore());
    expect(repos.posts).toBeInstanceOf(InMemoryPostRepository);
    expect(repos.users).toBeInstanceOf(InMemoryUserRepository);
  });

  it("con DATABASE_URL usa los adaptadores PostgreSQL (Supabase)", () => {
    const env = parseEnv({
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: CONNECTION,
    });
    const repos = createRepositories(env, new MemoryUserStore());
    expect(repos.posts).toBeInstanceOf(PostgresPostRepository);
    expect(repos.users).toBeInstanceOf(PostgresUserRepository);
  });
});
