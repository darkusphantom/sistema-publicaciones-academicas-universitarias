import { describe, expect, it } from "vitest";
import type { Post } from "../../../domain/post";
import type { StoredUser } from "./user-store";
import { MemoryUserStore } from "./user-store";
import { InMemoryUserRepository } from "./in-memory-user-repository";

/**
 * Crea un usuario almacenado con la forma que persiste Better Auth.
 */
function makeStoredUser(overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id: "u-1",
    email: "ana@correo.com",
    emailVerified: false,
    name: "Ana Rivas",
    image: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    username: "a.rivas",
    givenName: "Ana",
    familyName: "Rivas",
    role: "estudiante",
    ...overrides,
  };
}

/**
 * Crea una publicación mínima para poblar el store.
 */
function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p-1",
    title: "Test",
    content: "Body",
    authorId: "u-1",
    category: "noticias",
    type: "post",
    visibility: "publicado",
    publishedAt: "2026-03-01T00:00:00Z",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    imageUrl: null,
    ...overrides,
  };
}

describe("InMemoryUserRepository", () => {
  it("findById returns the user in wire form or null", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser());
    const repo = new InMemoryUserRepository(store);

    const user = await repo.findById("u-1");
    expect(user).toEqual({
      id: "u-1",
      username: "a.rivas",
      email: "ana@correo.com",
      givenName: "Ana",
      familyName: "Rivas",
      role: "estudiante",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(await repo.findById("missing")).toBeNull();
  });

  it("findByUsername is case-insensitive and returns null when absent", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser());
    const repo = new InMemoryUserRepository(store);

    expect((await repo.findByUsername("A.RIVAS"))?.id).toBe("u-1");
    expect(await repo.findByUsername("nobody")).toBeNull();
  });

  it("findByEmail is case-insensitive and returns null when absent", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser());
    const repo = new InMemoryUserRepository(store);

    expect((await repo.findByEmail("ANA@Correo.com"))?.id).toBe("u-1");
    expect(await repo.findByEmail("missing@correo.com")).toBeNull();
  });

  it("updateRole changes the stored role immediately and returns the user", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser());
    const repo = new InMemoryUserRepository(store);

    const updated = await repo.updateRole("u-1", "admin");
    expect(updated?.role).toBe("admin");
    expect((await repo.findById("u-1"))?.role).toBe("admin");
    expect(await repo.updateRole("missing", "admin")).toBeNull();
  });

  it("listAuthors returns only users with at least one post", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser({ id: "u-1", username: "a.rivas", givenName: "Ana", familyName: "Rivas" }));
    store.saveUser(makeStoredUser({ id: "u-2", username: "b.gomez", email: "b@correo.com", givenName: "Bruno", familyName: "Gomez" }));
    store.savePost(makePost({ authorId: "u-2" }));
    const repo = new InMemoryUserRepository(store);

    const authors = await repo.listAuthors();
    expect(authors).toHaveLength(1);
    expect(authors[0]).toEqual({ id: "u-2", username: "b.gomez", fullName: "Bruno Gomez" });
  });

  it("listAuthors sorts by fullName using the es locale", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser({ id: "u-1", username: "a.rivas", givenName: "Ana", familyName: "Rivas" }));
    store.saveUser(makeStoredUser({ id: "u-2", username: "z.avila", email: "z@correo.com", givenName: "Zulay", familyName: "Avila" }));
    store.saveUser(makeStoredUser({ id: "u-3", username: "c.barrios", email: "c@correo.com", givenName: "Carla", familyName: "Barrios" }));
    store.savePost(makePost({ authorId: "u-1" }));
    store.savePost(makePost({ id: "p-2", authorId: "u-2" }));
    store.savePost(makePost({ id: "p-3", authorId: "u-3" }));
    const repo = new InMemoryUserRepository(store);

    const names = (await repo.listAuthors()).map((a) => a.fullName);
    expect(names).toEqual(["Ana Rivas", "Carla Barrios", "Zulay Avila"]);
  });

  it("listAuthors never includes email or role fields", async () => {
    const store = new MemoryUserStore();
    store.saveUser(makeStoredUser());
    store.savePost(makePost());
    const repo = new InMemoryUserRepository(store);

    const authors = await repo.listAuthors();
    expect(authors[0]).not.toHaveProperty("email");
    expect(authors[0]).not.toHaveProperty("role");
    expect(Object.keys(authors[0]).sort()).toEqual(["fullName", "id", "username"]);
  });
});