import { describe, expect, it } from "vitest";
import type { Post } from "../domain/post";
import type { PostDraft } from "../domain/post";
import { postPageSchema, postSchema } from "../domain/validation";
import { InMemoryPostRepository } from "../infrastructure/repositories/in-memory/in-memory-post-repository";
import { buildApp, jsonOf, promoteToAdmin, registerUser } from "./test-helpers";

/** Usuario por defecto de los tests de posts. */
const AUTHOR = {
  givenName: "Ana",
  familyName: "Rivas",
  email: "ana@correo.com",
  password: "secreto123",
};

/** Otro usuario (no autor). */
const OTHER = {
  givenName: "Bruno",
  familyName: "Gomez",
  email: "bruno@correo.com",
  password: "secreto123",
};

/** Construye una publicación mínima para seed. */
function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: `p-${Math.random().toString(36).slice(2)}`,
    title: "Test",
    content: "Body",
    authorId: "u-any",
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

/** Seed del store con publicaciones compartidas. */

/**
 * Crea un entorno con autores y publicaciones seed.
 */
async function setup(
  overrides: Record<string, string> = {},
): Promise<ReturnType<typeof buildApp> & { authorJar: import("./test-helpers").CookieJar }> {
  const built = buildApp(overrides);
  const authorJar = await registerUser(built.app, AUTHOR);
  return { ...built, authorJar };
}

describe("Posts routes · feed GET /api/v1/posts", () => {
  it("requires a session (401 without cookie)", async () => {
    const { app } = await setup();
    const response = await app.request("/api/v1/posts");
    expect(response.status).toBe(401);
  });

  it("returns only posts visible to the session with wire PostPage shape", async () => {
    const { app, store, authorJar } = await setup();
    const other = await registerUser(app, OTHER);
    const posts = new InMemoryPostRepository(store);
    posts.seed([
      makePost({ id: "p-1", authorId: "u-a", visibility: "publicado" }),
      makePost({ id: "p-2", authorId: "u-b", visibility: "borrador" }),
      makePost({ id: "p-3", authorId: "u-b", visibility: "oculto" }),
    ]);
    const response = await app.request("/api/v1/posts", {
      headers: { cookie: authorJar.header() },
    });
    expect(response.status).toBe(200);
    const body = await jsonOf(response);
    expect(postPageSchema.safeParse(body).success).toBe(true);
    // El autor (u-a) no ve borradores/ocultos ajenos.
    expect(body.items).toHaveLength(1);
    void other;
  });

  it("admin sees oculto posts but NOT alien drafts", async () => {
    const { app, store, authorJar } = await setup();
    const adminJar = await registerUser(app, OTHER);
    const adminUser = store.userByUsername("bruno.gomez");
    if (adminUser) store.saveUser({ ...adminUser, role: "admin" });
    const posts = new InMemoryPostRepository(store);
    posts.seed([
      makePost({ id: "p-1", authorId: "u-a", visibility: "publicado" }),
      makePost({ id: "p-2", authorId: "u-a", visibility: "borrador" }),
      makePost({ id: "p-3", authorId: "u-a", visibility: "oculto" }),
    ]);
    const response = await app.request("/api/v1/posts", {
      headers: { cookie: adminJar.header() },
    });
    const body = await jsonOf(response);
    const ids = (body.items as Array<{ id: string }>).map((p) => p.id);
    expect(ids).toContain("p-3");
    expect(ids).not.toContain("p-2");
    void authorJar;
  });

  it("applies filters and pagination by contract", async () => {
    const { app, store, authorJar } = await setup();
    const posts = new InMemoryPostRepository(store);
    posts.seed([
      makePost({ id: "p-1", category: "defensas", title: "Defensa de tesis", publishedAt: "2026-01-01T00:00:00Z" }),
      makePost({ id: "p-2", category: "noticias", title: "Noticia institucional", publishedAt: "2026-03-01T00:00:00Z" }),
      makePost({ id: "p-3", category: "noticias", title: "Otra noticia", publishedAt: "2026-02-01T00:00:00Z" }),
    ]);
    const filtered = await app.request(
      "/api/v1/posts?categoria=noticias&limit=1&offset=0",
      { headers: { cookie: authorJar.header() } },
    );
    const body = await jsonOf(filtered);
    expect(body.total).toBe(2);
    expect((body.items as Array<{ id: string }>).map((p) => p.id)).toEqual([
      "p-2",
    ]);
  });

  it("returns 400 for an invalid query", async () => {
    const { app, authorJar } = await setup();
    const response = await app.request("/api/v1/posts?categoria=otra", {
      headers: { cookie: authorJar.header() },
    });
    expect(response.status).toBe(400);
    expect(await jsonOf(response)).toMatchObject({ error: "validation_error" });
  });
});

describe("Posts routes · GET /api/v1/posts/:id", () => {
  it("returns the post to the author for a draft and 404 for alien drafts", async () => {
    const { app, store, authorJar } = await setup();
    const otherJar = await registerUser(app, OTHER);
    const anaId = store.userByUsername("ana.rivas")?.id ?? "u-a";
    const brunoId = store.userByUsername("bruno.gomez")?.id ?? "u-b";
    const posts = new InMemoryPostRepository(store);
    posts.seed([
      makePost({ id: "p-own", authorId: anaId, visibility: "borrador" }),
      makePost({ id: "p-alien", authorId: brunoId, visibility: "borrador" }),
      makePost({ id: "p-hidden", authorId: brunoId, visibility: "oculto" }),
    ]);
    const own = await app.request("/api/v1/posts/p-own", {
      headers: { cookie: authorJar.header() },
    });
    expect(own.status).toBe(200);
    expect(postSchema.safeParse(await jsonOf(own)).success).toBe(true);

    const alienDraft = await app.request("/api/v1/posts/p-alien", {
      headers: { cookie: authorJar.header() },
    });
    expect(alienDraft.status).toBe(404);

    const hidden = await app.request("/api/v1/posts/p-hidden", {
      headers: { cookie: authorJar.header() },
    });
    expect(hidden.status).toBe(404);

    // El autor sí ve su propio post oculto.
    const ownHidden = await app.request("/api/v1/posts/p-hidden", {
      headers: { cookie: otherJar.header() },
    });
    expect(ownHidden.status).toBe(200);
  });
});

describe("Posts routes · POST /api/v1/posts", () => {
  it("creates a post with authorId from the session and wire Post shape", async () => {
    const { app, store, authorJar } = await setup();
    const userId = store.userByUsername("ana.rivas")?.id;
    const response = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({
        title: "Mi publicación",
        content: "Cuerpo",
        category: "noticias",
        type: "post",
        visibility: "publicado",
      }),
    });
    expect(response.status).toBe(201);
    const body = await jsonOf(response);
    expect(postSchema.safeParse(body).success).toBe(true);
    expect(body.authorId).toBe(userId);
    expect(body.visibility).toBe("publicado");
  });

  it("ignores authorId and role injected in the body", async () => {
    const { app, store, authorJar } = await setup();
    const userId = store.userByUsername("ana.rivas")?.id;
    const response = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({
        title: "Hack",
        content: "Cuerpo",
        category: "noticias",
        type: "post",
        visibility: "publicado",
        authorId: "u-attacker",
        role: "admin",
      }),
    });
    expect(response.status).toBe(201);
    expect((await jsonOf(response)).authorId).toBe(userId);
  });

  it("returns 400 for an invalid payload", async () => {
    const { app, authorJar } = await setup();
    const response = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ title: "", content: "x", category: "nope", type: "post", visibility: "publicado" }),
    });
    expect(response.status).toBe(400);
    expect(await jsonOf(response)).toMatchObject({ error: "validation_error" });
  });

  it("returns 403 on a mutation without CSRF token", async () => {
    const { app, authorJar } = await setup();
    const response = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({
        title: "x",
        content: "y",
        category: "noticias",
        type: "post",
        visibility: "publicado",
      }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 403 on a mutation without the CSRF cookie even with a session (H3)", async () => {
    const { app, authorJar } = await setup();
    const headers = authorJar.header().replace(/facy\.csrf_token=[^;]+(?:; )?/, "");
    const response = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        cookie: headers,
      },
      body: JSON.stringify({
        title: "x",
        content: "y",
        category: "noticias",
        type: "post",
        visibility: "publicado",
      }),
    });
    expect(response.status).toBe(403);
  });
});

describe("Posts routes · PATCH and DELETE /api/v1/posts/:id", () => {
  async function createOwnPost(app: ReturnType<typeof buildApp>["app"], store: ReturnType<typeof buildApp>["store"], jar: import("./test-helpers").CookieJar, draft: Partial<PostDraft> = {}): Promise<string> {
    const response = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": jar.get("facy.csrf_token") ?? "",
        cookie: jar.header(),
      },
      body: JSON.stringify({
        title: "Titulo",
        content: "Cuerpo",
        category: "noticias",
        type: "post",
        visibility: "publicado",
        ...draft,
      }),
    });
    expect(response.status).toBe(201);
    return String((await jsonOf(response)).id);
  }

  it("returns 403 for alien posts and 200/204 for own or admin", async () => {
    const { app, store, authorJar } = await setup();
    const otherJar = await registerUser(app, OTHER);
    const alienId = await createOwnPost(app, store, otherJar);

    const patchAlien = await app.request(`/api/v1/posts/${alienId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ title: "editado" }),
    });
    expect(patchAlien.status).toBe(403);

    const deleteAlien = await app.request(`/api/v1/posts/${alienId}`, {
      method: "DELETE",
      headers: {
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
    });
    expect(deleteAlien.status).toBe(403);

    const ownId = await createOwnPost(app, store, authorJar);
    const patchOwn = await app.request(`/api/v1/posts/${ownId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ title: "editado" }),
    });
    expect(patchOwn.status).toBe(200);
    expect((await jsonOf(patchOwn)).title).toBe("editado");

    const deleteOwn = await app.request(`/api/v1/posts/${ownId}`, {
      method: "DELETE",
      headers: {
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
    });
    expect(deleteOwn.status).toBe(204);

    // Admin puede editar/eliminar posts ajenos.
    promoteToAdmin(store, "ana.rivas");
    const adminId = await createOwnPost(app, store, otherJar);
    const patchAdmin = await app.request(`/api/v1/posts/${adminId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ title: "por-admin" }),
    });
    expect(patchAdmin.status).toBe(200);
    expect((await jsonOf(patchAdmin)).title).toBe("por-admin");
  });

  it("keeps publishedAt immutable on PATCH and sets it on draft→publicado", async () => {
    const { app, store, authorJar } = await setup();
    const draftId = await createOwnPost(app, store, authorJar, { visibility: "borrador" });
    const before = await jsonOf(await app.request(`/api/v1/posts/${draftId}`, { headers: { cookie: authorJar.header() } }));
    const publishedAtBefore = before.publishedAt as string;

    // PATCH de un campo editable + publishedAt ajeno → publishedAt no cambia.
    const patched = await app.request(`/api/v1/posts/${draftId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ title: "nuevo", publishedAt: "2000-01-01T00:00:00Z" }),
    });
    expect(patched.status).toBe(200);
    expect((await jsonOf(patched)).publishedAt).toBe(publishedAtBefore);

    // Transición borrador → publicado fija publishedAt = now.
    const published = await app.request(`/api/v1/posts/${draftId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ visibility: "publicado" }),
    });
    expect(published.status).toBe(200);
    const publishedAt = (await jsonOf(published)).publishedAt as string;
    expect(new Date(publishedAt).getTime()).toBeGreaterThan(
      new Date(publishedAtBefore).getTime(),
    );
  });

  it("forbids a non-admin author from setting oculto via PATCH", async () => {
    const { app, store, authorJar } = await setup();
    const id = await createOwnPost(app, store, authorJar);
    const response = await app.request(`/api/v1/posts/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
      body: JSON.stringify({ visibility: "oculto" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 404 for a non-existent post id", async () => {
    const { app, authorJar } = await setup();
    const response = await app.request("/api/v1/posts/no-such-id", {
      method: "DELETE",
      headers: {
        "x-csrf-token": authorJar.get("facy.csrf_token") ?? "",
        cookie: authorJar.header(),
      },
    });
    expect(response.status).toBe(404);
  });
});