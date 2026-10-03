import { describe, expect, it } from "vitest";
import { canViewPost, filterVisiblePosts } from "./visibility";
import type { Post, Session } from "./types";

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p-1",
    title: "Test post",
    content: "Content body",
    authorId: "u-author",
    category: "noticias",
    type: "post",
    visibility: "publicado",
    publishedAt: "2026-03-12T10:00:00Z",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
    imageUrl: null,
    ...overrides,
  };
}

function makeSession(
  overrides: Partial<Session["user"]> = {},
): Session {
  return {
    user: { id: "u-viewer", username: "viewer", role: "estudiante", ...overrides },
    expiresAt: "2099-01-01T00:00:00Z",
  };
}

// ─── canViewPost ──────────────────────────────────────────────────────────────

describe("canViewPost", () => {
  describe("publicado posts", () => {
    it("is visible to any authenticated user", () => {
      const post = makePost({ visibility: "publicado" });
      const session = makeSession();
      expect(canViewPost(post, session)).toBe(true);
    });

    it("is visible to admin", () => {
      const post = makePost({ visibility: "publicado" });
      const session = makeSession({ role: "admin" });
      expect(canViewPost(post, session)).toBe(true);
    });

    it("is visible even if another user is the author", () => {
      const post = makePost({ visibility: "publicado", authorId: "u-other" });
      const session = makeSession({ id: "u-viewer" });
      expect(canViewPost(post, session)).toBe(true);
    });
  });

  describe("borrador posts", () => {
    it("is visible to the author", () => {
      const post = makePost({ visibility: "borrador", authorId: "u-author" });
      const session = makeSession({ id: "u-author" });
      expect(canViewPost(post, session)).toBe(true);
    });

    it("is NOT visible to another estudiante", () => {
      const post = makePost({ visibility: "borrador", authorId: "u-author" });
      const session = makeSession({ id: "u-other", role: "estudiante" });
      expect(canViewPost(post, session)).toBe(false);
    });

    it("is NOT visible to a profesor who is not the author", () => {
      const post = makePost({ visibility: "borrador", authorId: "u-author" });
      const session = makeSession({ id: "u-prof", role: "profesor" });
      expect(canViewPost(post, session)).toBe(false);
    });

    it("is NOT visible to admin when admin is not the author", () => {
      const post = makePost({ visibility: "borrador", authorId: "u-author" });
      const session = makeSession({ id: "u-admin", role: "admin" });
      expect(canViewPost(post, session)).toBe(false);
    });

    it("is visible to admin who IS the author", () => {
      const post = makePost({ visibility: "borrador", authorId: "u-admin" });
      const session = makeSession({ id: "u-admin", role: "admin" });
      expect(canViewPost(post, session)).toBe(true);
    });
  });

  describe("oculto posts", () => {
    it("is visible to the author (non-admin)", () => {
      const post = makePost({ visibility: "oculto", authorId: "u-author" });
      const session = makeSession({ id: "u-author", role: "estudiante" });
      expect(canViewPost(post, session)).toBe(true);
    });

    it("is visible to admin even if not the author", () => {
      const post = makePost({ visibility: "oculto", authorId: "u-other" });
      const session = makeSession({ id: "u-admin", role: "admin" });
      expect(canViewPost(post, session)).toBe(true);
    });

    it("is NOT visible to an estudiante who is not the author", () => {
      const post = makePost({ visibility: "oculto", authorId: "u-other" });
      const session = makeSession({ id: "u-viewer", role: "estudiante" });
      expect(canViewPost(post, session)).toBe(false);
    });

    it("is NOT visible to a profesor who is not the author", () => {
      const post = makePost({ visibility: "oculto", authorId: "u-other" });
      const session = makeSession({ id: "u-prof", role: "profesor" });
      expect(canViewPost(post, session)).toBe(false);
    });
  });
});

// ─── filterVisiblePosts ───────────────────────────────────────────────────────

describe("filterVisiblePosts", () => {
  it("returns only posts visible to the session", () => {
    const posts: Post[] = [
      makePost({ id: "p-1", visibility: "publicado" }),
      makePost({ id: "p-2", visibility: "borrador", authorId: "u-viewer" }),
      makePost({ id: "p-3", visibility: "borrador", authorId: "u-other" }),
      makePost({ id: "p-4", visibility: "oculto", authorId: "u-viewer" }),
      makePost({ id: "p-5", visibility: "oculto", authorId: "u-other" }),
    ];

    const session = makeSession({ id: "u-viewer", role: "estudiante" });
    const result = filterVisiblePosts(posts, session);

    expect(result.map((p) => p.id)).toEqual(["p-1", "p-2", "p-4"]);
  });

  it("returns all non-draft posts to admin, plus admin own drafts", () => {
    const posts: Post[] = [
      makePost({ id: "p-1", visibility: "publicado" }),
      makePost({ id: "p-2", visibility: "borrador", authorId: "u-admin" }),
      makePost({ id: "p-3", visibility: "borrador", authorId: "u-other" }),
      makePost({ id: "p-4", visibility: "oculto", authorId: "u-other" }),
    ];

    const session = makeSession({ id: "u-admin", role: "admin" });
    const result = filterVisiblePosts(posts, session);

    // p-3 is a draft not owned by admin — should be excluded
    expect(result.map((p) => p.id)).toEqual(["p-1", "p-2", "p-4"]);
  });

  it("returns an empty array when no posts match", () => {
    const posts: Post[] = [
      makePost({ visibility: "borrador", authorId: "u-other" }),
    ];
    const session = makeSession({ id: "u-viewer" });
    expect(filterVisiblePosts(posts, session)).toHaveLength(0);
  });

  it("handles an empty input array", () => {
    const session = makeSession();
    expect(filterVisiblePosts([], session)).toHaveLength(0);
  });
});
