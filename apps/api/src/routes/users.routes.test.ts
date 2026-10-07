import { describe, expect, it } from "vitest";
import { authorOptionSchema, userSchema } from "../domain/validation";
import { InMemoryPostRepository } from "../infrastructure/repositories/in-memory/in-memory-post-repository";
import type { Post } from "../domain/post";
import { buildApp, jsonOf, promoteToAdmin, registerUser } from "./test-helpers";

const ANA = { givenName: "Ana", familyName: "Rivas", email: "ana@correo.com", password: "secreto123" };
const BRUNO = { givenName: "Bruno", familyName: "Gomez", email: "bruno@correo.com", password: "secreto123" };

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: `p-${Math.random().toString(36).slice(2)}`,
    title: "T",
    content: "C",
    authorId: "u",
    category: "matematicas",
    type: "post",
    researchArea: "general",
    visibility: "publicado",
    publishedAt: "2026-03-01T00:00:00Z",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    imageUrl: null,
    ...overrides,
  };
}

describe("Users routes · GET /api/v1/users/authors", () => {
  it("requires a session", async () => {
    const { app } = buildApp();
    expect((await app.request("/api/v1/users/authors")).status).toBe(401);
  });

  it("returns only authors with posts, without email or role", async () => {
    const { app, store } = buildApp();
    const anaJar = await registerUser(app, ANA);
    await registerUser(app, BRUNO);
    const anaId = store.userByUsername("ana.rivas")?.id ?? "u-a";
    new InMemoryPostRepository(store).seed([
      makePost({ authorId: anaId }),
    ]);
    const response = await app.request("/api/v1/users/authors", {
      headers: { cookie: anaJar.header() },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown[];
    expect(body).toHaveLength(1);
    expect(authorOptionSchema.safeParse(body[0]).success).toBe(true);
    expect(body[0]).toEqual({
      id: anaId,
      username: "ana.rivas",
      fullName: "Ana Rivas",
    });
    expect(JSON.stringify(body)).not.toContain("email");
    expect(JSON.stringify(body)).not.toContain("role");
  });
});

describe("Users routes · GET /api/v1/users/:username", () => {
  it("returns 404 for an unknown username (anti-enumeration)", async () => {
    const { app } = buildApp();
    const jar = await registerUser(app, ANA);
    const response = await app.request("/api/v1/users/nobody", {
      headers: { cookie: jar.header() },
    });
    expect(response.status).toBe(404);
  });

  it("redacts the email of another user to an empty string", async () => {
    const { app, store } = buildApp();
    const anaJar = await registerUser(app, ANA);
    const brunoJar = await registerUser(app, BRUNO);
    const brunoId = store.userByUsername("bruno.gomez")?.id ?? "u-b";
    new InMemoryPostRepository(store).seed([
      makePost({ authorId: brunoId, visibility: "borrador" }),
    ]);
    const response = await app.request("/api/v1/users/bruno.gomez", {
      headers: { cookie: anaJar.header() },
    });
    expect(response.status).toBe(200);
    const body = await jsonOf(response);
    const profile = body.user as { email: string };
    expect(profile.email).toBe("");
    expect(JSON.stringify(body)).not.toContain("bruno@correo.com");
    // Las publicaciones visibles para la sesión ajena: borrador ajeno excluido.
    expect((body.posts as unknown[])).toHaveLength(0);
    void brunoJar;
  });

  it("shows the full email for the own profile and for admin", async () => {
    const { app, store } = buildApp();
    const anaJar = await registerUser(app, ANA);
    await registerUser(app, BRUNO);

    const own = await app.request("/api/v1/users/ana.rivas", {
      headers: { cookie: anaJar.header() },
    });
    const ownBody = await jsonOf(own);
    expect(userSchema.safeParse(ownBody.user).success).toBe(true);
    expect(ownBody.user).toMatchObject({ email: "ana@correo.com" });

    promoteToAdmin(store, "ana.rivas");
    const asAdmin = await app.request("/api/v1/users/bruno.gomez", {
      headers: { cookie: anaJar.header() },
    });
    expect((await jsonOf(asAdmin)).user).toMatchObject({
      email: "bruno@correo.com",
    });
  });
});