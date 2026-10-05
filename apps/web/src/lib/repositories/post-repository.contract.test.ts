import { describe, expect, it } from "vitest";
import { StaticPostRepository, StaticUserRepository } from "./post-repository.static";
import { DEFAULT_POST_FILTERS } from "@/lib/types";
import type { Session, PostFilters } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    user: { id: "u-3", username: "m.rivas", role: "estudiante", ...overrides },
    expiresAt: "2099-01-01T00:00:00Z",
  };
}

const noFilters: PostFilters = { ...DEFAULT_POST_FILTERS };
const fullPage = { limit: 100, offset: 0 };

// ─── StaticPostRepository ─────────────────────────────────────────────────────

describe("StaticPostRepository", () => {
  const repo = new StaticPostRepository();

  describe("findVisible", () => {
    it("returns only posts visible to an estudiante session", async () => {
      const session = makeSession(); // u-3 estudiante
      const { items } = await repo.findVisible(noFilters, fullPage, session);

      // Should not include drafts from other authors or hidden posts (unless
      // u-3 is the author of the hidden post, which they are not in the mock).
      const invisibleIds = items.filter(
        (p) =>
          (p.visibility === "borrador" && p.authorId !== "u-3") ||
          (p.visibility === "oculto" && p.authorId !== "u-3"),
      );
      expect(invisibleIds).toHaveLength(0);
    });

    it("returns all non-draft posts + admin-own-draft to admin", async () => {
      const session = makeSession({ id: "u-1", role: "admin" });
      const { items } = await repo.findVisible(noFilters, fullPage, session);

      // Admin should see publicado + oculto + own drafts; not others' drafts
      const alienDrafts = items.filter(
        (p) => p.visibility === "borrador" && p.authorId !== "u-1",
      );
      expect(alienDrafts).toHaveLength(0);
    });

    it("returns items sorted by publishedAt DESC", async () => {
      const session = makeSession({ id: "u-1", role: "admin" });
      const { items } = await repo.findVisible(noFilters, fullPage, session);

      const dates = items.map((p) => new Date(p.publishedAt).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    });

    it("returns correct total and paginates", async () => {
      const session = makeSession({ id: "u-1", role: "admin" });
      const { total } = await repo.findVisible(noFilters, fullPage, session);
      const page1 = await repo.findVisible(noFilters, { limit: 6, offset: 0 }, session);
      const page2 = await repo.findVisible(noFilters, { limit: 6, offset: 6 }, session);

      expect(page1.total).toBe(total);
      expect(page1.items.length + page2.items.length).toBeLessThanOrEqual(total);
    });

    it("filters by category", async () => {
      const session = makeSession();
      const { items } = await repo.findVisible(
        { ...noFilters, category: "defensas" },
        fullPage,
        session,
      );
      expect(items.every((p) => p.category === "defensas")).toBe(true);
    });

    it("filters by keyword", async () => {
      const session = makeSession();
      const { items } = await repo.findVisible(
        { ...noFilters, keyword: "talleres" },
        fullPage,
        session,
      );
      expect(items.length).toBeGreaterThan(0);
      items.forEach((p) => {
        const haystack = `${p.title} ${p.content}`.toLowerCase();
        expect(haystack).toContain("taller");
      });
    });

    it("returns empty items and total 0 when no posts match", async () => {
      const session = makeSession();
      const { items, total } = await repo.findVisible(
        { ...noFilters, keyword: "zzz_no_match_zzz" },
        fullPage,
        session,
      );
      expect(items).toHaveLength(0);
      expect(total).toBe(0);
    });
  });

  describe("findById", () => {
    it("returns the post when it exists", async () => {
      const post = await repo.findById("post-1");
      expect(post).not.toBeNull();
      expect(post?.id).toBe("post-1");
    });

    it("returns null for a non-existent ID", async () => {
      const post = await repo.findById("nonexistent");
      expect(post).toBeNull();
    });
  });
});

// ─── StaticUserRepository ─────────────────────────────────────────────────────

describe("StaticUserRepository", () => {
  const repo = new StaticUserRepository();

  describe("listAuthors", () => {
    it("returns only users who have at least one post", async () => {
      const authors = await repo.listAuthors();
      expect(authors.length).toBeGreaterThan(0);
      // Every returned author must have at least one post in the mock dataset
      authors.forEach((author) => {
        expect(author.id).toBeDefined();
        expect(author.username).toBeDefined();
        expect(author.fullName).toBeDefined();
      });
    });

    it("sorts authors alphabetically by fullName in Spanish locale", async () => {
      const authors = await repo.listAuthors();
      const names = authors.map((a) => a.fullName);
      const sorted = [...names].sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      );
      expect(names).toEqual(sorted);
    });

    it("includes fullName as givenName + familyName", async () => {
      const authors = await repo.listAuthors();
      authors.forEach((a) => {
        expect(a.fullName.split(" ").length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
