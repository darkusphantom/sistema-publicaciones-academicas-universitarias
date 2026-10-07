import { describe, expect, it } from "vitest";
import type { Post } from "../domain/post";
import { InMemoryPostRepository } from "../infrastructure/repositories/in-memory/in-memory-post-repository";
import { buildApp, jsonOf, promoteToAdmin, registerUser } from "./test-helpers";

const ANA = { givenName: "Ana", familyName: "Rivas", email: "ana@correo.com", password: "secreto123" };

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

describe("Admin routes · PATCH /api/v1/admin/users/:id/role", () => {
  it("forbids non-admin roles (estudiante and profesor)", async () => {
    const { app } = buildApp();
    const jar = await registerUser(app, ANA);
    const other = await registerUser(app, {
      givenName: "Bruno",
      familyName: "Gomez",
      email: "bruno@correo.com",
      password: "secreto123",
    });
    const response = await app.request("/api/v1/admin/users/some-id/role", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ role: "admin" }),
    });
    expect(response.status).toBe(403);
    void other;
  });

  it("lets an admin change a role (204) and reflects it immediately (R14)", async () => {
    const { app, store } = buildApp();
    const jar = await registerUser(app, ANA);
    const otherJar = await registerUser(app, {
      givenName: "Bruno",
      familyName: "Gomez",
      email: "bruno@correo.com",
      password: "secreto123",
    });
    const bruno = store.userByUsername("bruno.gomez");
    expect(bruno?.role).toBe("estudiante");

    promoteToAdmin(store, "ana.rivas");
    const response = await app.request(`/api/v1/admin/users/${bruno?.id}/role`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ role: "profesor" }),
    });
    expect(response.status).toBe(204);
    expect(store.userByUsername("bruno.gomez")?.role).toBe("profesor");

    // La sesión vigente de Bruno (JWT con claim viejo) pierde/ganza rol fresco.
    const session = await app.request("/api/v1/auth/session", {
      headers: { cookie: otherJar.header() },
    });
    expect((await jsonOf(session)).user).toMatchObject({ role: "profesor" });
  });

  it("demoting an admin is effective immediately (fresh role, no stale claim)", async () => {
    const { app, store } = buildApp();
    const jar = await registerUser(app, ANA);
    const anaId = store.userByUsername("ana.rivas")?.id;
    promoteToAdmin(store, "ana.rivas");
    const promote = await app.request(`/api/v1/admin/users/${anaId}/role`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ role: "estudiante" }),
    });
    expect(promote.status).toBe(204);

    // Con el rol ya demovido, la sesión vigente NO autoriza /admin/* (R14).
    const blocked = await app.request(`/api/v1/admin/users/${anaId}/role`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ role: "admin" }),
    });
    expect(blocked.status).toBe(403);
  });

  it("returns 404 for a non-existent user id", async () => {
    const { app, store } = buildApp();
    const jar = await registerUser(app, ANA);
    promoteToAdmin(store, "ana.rivas");
    const response = await app.request("/api/v1/admin/users/missing-id/role", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ role: "admin" }),
    });
    expect(response.status).toBe(404);
  });
});

describe("Admin routes · PATCH /api/v1/admin/posts/:id/visibility", () => {
  it("forbids non-admin and returns 404 for unknown posts", async () => {
    const { app } = buildApp();
    const jar = await registerUser(app, ANA);
    const forbidden = await app.request("/api/v1/admin/posts/p-x/visibility", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ visibility: "oculto" }),
    });
    expect(forbidden.status).toBe(403);
  });

  it("admin can hide and restore a post and the feed reflects it", async () => {
    const { app, store } = buildApp();
    const jar = await registerUser(app, ANA);
    const otherJar = await registerUser(app, {
      givenName: "Bruno",
      familyName: "Gomez",
      email: "bruno@correo.com",
      password: "secreto123",
    });
    const anaId = store.userByUsername("ana.rivas")?.id ?? "u-a";
    const posts = new InMemoryPostRepository(store);
    posts.seed([makePost({ id: "p-1", authorId: anaId, visibility: "publicado" })]);
    promoteToAdmin(store, "ana.rivas");

    const hide = await app.request("/api/v1/admin/posts/p-1/visibility", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ visibility: "oculto" }),
    });
    expect(hide.status).toBe(200);
    expect((await jsonOf(hide)).visibility).toBe("oculto");

    // El feed de otro usuario ya no lo muestra.
    const feed = await app.request("/api/v1/posts", {
      headers: { cookie: otherJar.header() },
    });
    const ids = ((await jsonOf(feed)).items as Array<{ id: string }>).map((p) => p.id);
    expect(ids).not.toContain("p-1");

    const restore = await app.request("/api/v1/admin/posts/p-1/visibility", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ visibility: "publicado" }),
    });
    expect(restore.status).toBe(200);
    const feedAfter = await app.request("/api/v1/posts", {
      headers: { cookie: otherJar.header() },
    });
    const idsAfter = ((await jsonOf(feedAfter)).items as Array<{ id: string }>).map((p) => p.id);
    expect(idsAfter).toContain("p-1");
  });

  it("returns 404 for a non-existent post id", async () => {
    const { app, store } = buildApp();
    const jar = await registerUser(app, ANA);
    promoteToAdmin(store, "ana.rivas");
    const response = await app.request("/api/v1/admin/posts/nope/visibility", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({ visibility: "oculto" }),
    });
    expect(response.status).toBe(404);
  });
});