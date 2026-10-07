import { describe, expect, it } from "vitest";
import type { Post } from "../../../domain/post";
import type { PostFilters } from "../../../domain/post";
import type { Session } from "../../../domain/session";
import type { PostDraft } from "../../../domain/post";
import { MemoryUserStore } from "./user-store";
import { InMemoryPostRepository } from "./in-memory-post-repository";

/** Estado de filtros sin filtros activos (espejo de DEFAULT_POST_FILTERS). */
const noFilters: PostFilters = {
  keyword: "",
  category: "todas",
  type: "todos",
  authorId: "todos",
  status: "todos",
  researchArea: "todas",
  dateFrom: null,
  dateTo: null,
};

const fullPage = { limit: 100, offset: 0 };

/**
 * Construye una publicación con overrides (misma forma que `src/data/*`).
 */
function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p-1",
    title: "Test post",
    content: "Content body",
    authorId: "u-author",
    category: "matematicas",
    type: "post",
    researchArea: "general",
    visibility: "publicado",
    publishedAt: "2026-03-12T10:00:00Z",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
    imageUrl: null,
    ...overrides,
  };
}

function makeSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    user: { id: "u-viewer", username: "viewer", role: "estudiante", ...overrides },
    expiresAt: "2099-01-01T00:00:00Z",
  };
}

function makeDraft(overrides: Partial<PostDraft> = {}): PostDraft {
  return {
    title: "Nuevo",
    content: "Cuerpo",
    category: "matematicas",
    type: "post",
    researchArea: "general",
    visibility: "publicado",
    imageUrl: null,
    ...overrides,
  };
}

describe("InMemoryPostRepository · canViewPost (9 combinaciones)", () => {
  describe("publicado", () => {
    it("is visible to any authenticated user", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "publicado" })]);
      const { items } = await repo.findVisible(noFilters, fullPage, makeSession());
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });

    it("is visible to admin", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "publicado" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ role: "admin" }),
      );
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });

    it("is visible even if another user is the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "publicado", authorId: "u-other" })]);
      const { items } = await repo.findVisible(noFilters, fullPage, makeSession());
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });
  });

  describe("borrador", () => {
    it("is visible to the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "borrador", authorId: "u-author" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-author" }),
      );
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });

    it("is NOT visible to another estudiante", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "borrador", authorId: "u-author" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-other", role: "estudiante" }),
      );
      expect(items).toHaveLength(0);
    });

    it("is NOT visible to a profesor who is not the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "borrador", authorId: "u-author" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-prof", role: "profesor" }),
      );
      expect(items).toHaveLength(0);
    });

    it("is NOT visible to admin when admin is not the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "borrador", authorId: "u-author" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-admin", role: "admin" }),
      );
      expect(items).toHaveLength(0);
    });

    it("is visible to admin who IS the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "borrador", authorId: "u-admin" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-admin", role: "admin" }),
      );
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });
  });

  describe("oculto", () => {
    it("is visible to the author (non-admin)", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "oculto", authorId: "u-author" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-author", role: "estudiante" }),
      );
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });

    it("is visible to admin even if not the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "oculto", authorId: "u-other" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-admin", role: "admin" }),
      );
      expect(items.map((p) => p.id)).toEqual(["p-1"]);
    });

    it("is NOT visible to an estudiante who is not the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "oculto", authorId: "u-other" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-viewer", role: "estudiante" }),
      );
      expect(items).toHaveLength(0);
    });

    it("is NOT visible to a profesor who is not the author", async () => {
      const repo = new InMemoryPostRepository(new MemoryUserStore());
      repo.seed([makePost({ visibility: "oculto", authorId: "u-other" })]);
      const { items } = await repo.findVisible(
        noFilters,
        fullPage,
        makeSession({ id: "u-prof", role: "profesor" }),
      );
      expect(items).toHaveLength(0);
    });
  });
});

describe("InMemoryPostRepository · findVisible", () => {
  it("returns items sorted by publishedAt DESC", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([
      makePost({ id: "p-1", publishedAt: "2026-01-01T00:00:00Z" }),
      makePost({ id: "p-2", publishedAt: "2026-06-01T00:00:00Z" }),
      makePost({ id: "p-3", publishedAt: "2026-03-01T00:00:00Z" }),
    ]);
    const { items } = await repo.findVisible(
      noFilters,
      fullPage,
      makeSession(),
    );
    expect(items.map((p) => p.id)).toEqual(["p-2", "p-3", "p-1"]);
  });

  it("filters by category, type, author, status, dates and keyword", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([
      makePost({ id: "p-1", category: "biologia", type: "articulo", authorId: "u-a", visibility: "publicado", publishedAt: "2026-03-01T00:00:00Z", title: "Talleres de primavera", content: "..." }),
      makePost({ id: "p-2", category: "matematicas", type: "post", authorId: "u-a", visibility: "publicado", publishedAt: "2026-03-02T00:00:00Z", title: "Noticia", content: "talleres aquí" }),
      makePost({ id: "p-3", category: "matematicas", type: "post", authorId: "u-b", visibility: "publicado", publishedAt: "2026-04-01T00:00:00Z", title: "Otra", content: "nada" }),
    ]);
    const session = makeSession({ id: "u-viewer" });

    const byCategory = await repo.findVisible({ ...noFilters, category: "matematicas" }, fullPage, session);
    expect(byCategory.items.map((p) => p.id)).toEqual(["p-3", "p-2"]);

    const byType = await repo.findVisible({ ...noFilters, type: "articulo" }, fullPage, session);
    expect(byType.items.map((p) => p.id)).toEqual(["p-1"]);

    const byAuthor = await repo.findVisible({ ...noFilters, authorId: "u-a" }, fullPage, session);
    expect(byAuthor.items.map((p) => p.id)).toEqual(["p-2", "p-1"]);

    const byStatus = await repo.findVisible({ ...noFilters, status: "borrador" }, fullPage, session);
    expect(byStatus.items).toHaveLength(0);

    const byDate = await repo.findVisible({ ...noFilters, dateFrom: "2026-04-01", dateTo: "2026-04-30" }, fullPage, session);
    expect(byDate.items.map((p) => p.id)).toEqual(["p-3"]);

    const byKeyword = await repo.findVisible({ ...noFilters, keyword: "talleres" }, fullPage, session);
    expect(byKeyword.items.map((p) => p.id)).toEqual(["p-2", "p-1"]);
  });

  it("filters with diacritics-insensitive keyword search", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([
      makePost({ id: "p-1", title: "Información institucional", content: "..." }),
      makePost({ id: "p-2", title: "Otro", content: "menciona telecomunicaciones" }),
    ]);
    const { items } = await repo.findVisible(
      { ...noFilters, keyword: "informacion" },
      fullPage,
      makeSession(),
    );
    expect(items.map((p) => p.id)).toEqual(["p-1"]);
  });

  it("returns correct total and paginates with limit/offset", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([
      makePost({ id: "p-1", publishedAt: "2026-01-01T00:00:00Z" }),
      makePost({ id: "p-2", publishedAt: "2026-02-01T00:00:00Z" }),
      makePost({ id: "p-3", publishedAt: "2026-03-01T00:00:00Z" }),
    ]);
    const session = makeSession();
    const { total } = await repo.findVisible(noFilters, fullPage, session);
    const page1 = await repo.findVisible(noFilters, { limit: 2, offset: 0 }, session);
    const page2 = await repo.findVisible(noFilters, { limit: 2, offset: 2 }, session);
    expect(total).toBe(3);
    expect(page1.items.map((p) => p.id)).toEqual(["p-3", "p-2"]);
    expect(page2.items.map((p) => p.id)).toEqual(["p-1"]);
    expect(page1.total + page2.total).toBe(6);
  });

  it("returns empty items and total 0 when nothing matches", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([makePost()]);
    const { items, total } = await repo.findVisible(
      { ...noFilters, keyword: "zzz_no_match_zzz" },
      fullPage,
      makeSession(),
    );
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
  });

  it("returns empty page for an empty store", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    const { items, total } = await repo.findVisible(noFilters, fullPage, makeSession());
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
  });
});

describe("InMemoryPostRepository · findById", () => {
  it("returns the post when it exists regardless of visibility", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([makePost({ id: "p-1", visibility: "borrador" })]);
    expect((await repo.findById("p-1"))?.id).toBe("p-1");
    expect(await repo.findById("missing")).toBeNull();
  });
});

describe("InMemoryPostRepository · create/update/delete", () => {
  it("creates a post with server-side metadata", async () => {
    const store = new MemoryUserStore();
    const repo = new InMemoryPostRepository(store);
    const created = await repo.create({
      ...makeDraft(),
      authorId: "u-a",
      publishedAt: "2026-03-01T00:00:00Z",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z",
    });
    expect(created.authorId).toBe("u-a");
    expect(created.id).toBeTruthy();
    expect(store.postById(created.id)).toBeDefined();
    expect((await repo.findById(created.id))?.title).toBe("Nuevo");
  });

  it("updates an existing post and returns the new version", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([makePost({ id: "p-1" })]);
    const updated = await repo.update("p-1", { title: "Editado", visibility: "borrador" });
    expect(updated?.title).toBe("Editado");
    expect(updated?.visibility).toBe("borrador");
    expect((await repo.findById("p-1"))?.title).toBe("Editado");
    expect(await repo.update("missing", { title: "x" })).toBeNull();
  });

  it("uses the injected clock for updatedAt on update (QA-4)", async () => {
    const fixed = new Date("2026-05-01T12:00:00.000Z");
    const repo = new InMemoryPostRepository(new MemoryUserStore(), {
      now: () => fixed,
    });
    repo.seed([makePost({ id: "p-1", updatedAt: "2026-01-01T00:00:00.000Z" })]);
    const updated = await repo.update("p-1", { title: "Editado" });
    expect(updated?.updatedAt).toBe(fixed.toISOString());
    expect((await repo.findById("p-1"))?.updatedAt).toBe(fixed.toISOString());
  });

  it("deletes a post and reports existence", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    repo.seed([makePost({ id: "p-1" })]);
    expect(await repo.delete("p-1")).toBe(true);
    expect(await repo.findById("p-1")).toBeNull();
    expect(await repo.delete("p-1")).toBe(false);
  });

  it("findVisible reflects created/updated/deleted posts immediately", async () => {
    const repo = new InMemoryPostRepository(new MemoryUserStore());
    const created = await repo.create({
      ...makeDraft(),
      authorId: "u-a",
      publishedAt: "2026-03-01T00:00:00Z",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z",
    });
    expect((await repo.findVisible(noFilters, fullPage, makeSession())).items).toHaveLength(1);
    await repo.update(created.id, { visibility: "borrador" });
    expect((await repo.findVisible(noFilters, fullPage, makeSession())).items).toHaveLength(0);
    expect((await repo.findVisible(noFilters, fullPage, makeSession({ id: "u-a" }))).items).toHaveLength(1);
    await repo.delete(created.id);
    expect((await repo.findVisible(noFilters, fullPage, makeSession())).items).toHaveLength(0);
  });
});