import { describe, expect, it } from "vitest";
import {
  normalizeSearchText,
  fromSearchParams,
  toSearchParams,
  applyFilters,
  countActiveFilters,
  isDateRangeValid,
} from "./filters";
import { DEFAULT_POST_FILTERS } from "./types";
import type { Post, PostFilters } from "./types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p-1",
    title: "Cartelera de defensas de grado",
    content: "El cronograma de las próximas defensas de grado.",
    authorId: "u-1",
    category: "defensas",
    type: "articulo",
    visibility: "publicado",
    publishedAt: "2026-03-12T10:00:00Z",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
    imageUrl: null,
    ...overrides,
  };
}

const noFilters: PostFilters = { ...DEFAULT_POST_FILTERS };

// ─── normalizeSearchText ──────────────────────────────────────────────────────

describe("normalizeSearchText", () => {
  it("trims whitespace", () => {
    expect(normalizeSearchText("  hola  ")).toBe("hola");
  });

  it("converts to lowercase", () => {
    expect(normalizeSearchText("Defensas")).toBe("defensas");
  });

  it("removes diacritics", () => {
    expect(normalizeSearchText("Investigación")).toBe("investigacion");
    expect(normalizeSearchText("Publicación")).toBe("publicacion");
    expect(normalizeSearchText("niño")).toBe("nino");
  });

  it("handles empty string", () => {
    expect(normalizeSearchText("")).toBe("");
  });
});

// ─── fromSearchParams ─────────────────────────────────────────────────────────

describe("fromSearchParams", () => {
  it("returns default filters for empty params", () => {
    expect(fromSearchParams({})).toEqual(DEFAULT_POST_FILTERS);
  });

  it("parses a valid category", () => {
    const result = fromSearchParams({ categoria: "noticias" });
    expect(result.category).toBe("noticias");
  });

  it("falls back to 'todas' for an invalid category", () => {
    const result = fromSearchParams({ categoria: "invented" });
    expect(result.category).toBe("todas");
  });

  it("parses a valid type", () => {
    const result = fromSearchParams({ tipo: "articulo" });
    expect(result.type).toBe("articulo");
  });

  it("falls back to 'todos' for an invalid type", () => {
    const result = fromSearchParams({ tipo: "nonexistent" });
    expect(result.type).toBe("todos");
  });

  it("parses a valid status", () => {
    const result = fromSearchParams({ estado: "borrador" });
    expect(result.status).toBe("borrador");
  });

  it("falls back to 'todos' for an invalid status", () => {
    const result = fromSearchParams({ estado: "badvalue" });
    expect(result.status).toBe("todos");
  });

  it("parses keyword query (q) and trims it", () => {
    const result = fromSearchParams({ q: "  talleres  " });
    expect(result.keyword).toBe("talleres");
  });

  it("truncates q to 80 characters", () => {
    const long = "a".repeat(100);
    const result = fromSearchParams({ q: long });
    expect(result.keyword).toHaveLength(80);
  });

  it("parses valid dateFrom and dateTo", () => {
    const result = fromSearchParams({ desde: "2026-03-01", hasta: "2026-03-31" });
    expect(result.dateFrom).toBe("2026-03-01");
    expect(result.dateTo).toBe("2026-03-31");
  });

  it("returns null for a malformed date", () => {
    const result = fromSearchParams({ desde: "not-a-date", hasta: "2026-99-99" });
    expect(result.dateFrom).toBeNull();
    expect(result.dateTo).toBeNull();
  });

  it("passes through authorId without validation", () => {
    const result = fromSearchParams({ autor: "u-123" });
    expect(result.authorId).toBe("u-123");
  });
});

// ─── toSearchParams ───────────────────────────────────────────────────────────

describe("toSearchParams", () => {
  it("returns empty params for default filters", () => {
    const params = toSearchParams(DEFAULT_POST_FILTERS);
    expect(params.toString()).toBe("");
  });

  it("includes non-default values", () => {
    const filters: PostFilters = {
      ...DEFAULT_POST_FILTERS,
      keyword: "defensas",
      category: "noticias",
    };
    const params = toSearchParams(filters);
    expect(params.get("q")).toBe("defensas");
    expect(params.get("categoria")).toBe("noticias");
  });

  it("omits fields that have default values", () => {
    const filters: PostFilters = {
      ...DEFAULT_POST_FILTERS,
      category: "todas",
      type: "todos",
    };
    const params = toSearchParams(filters);
    expect(params.has("categoria")).toBe(false);
    expect(params.has("tipo")).toBe(false);
  });
});

// ─── countActiveFilters ───────────────────────────────────────────────────────

describe("countActiveFilters", () => {
  it("returns 0 for default filters", () => {
    expect(countActiveFilters(DEFAULT_POST_FILTERS)).toBe(0);
  });

  it("counts each non-default dimension", () => {
    const filters: PostFilters = {
      ...DEFAULT_POST_FILTERS,
      keyword: "test",
      category: "noticias",
      type: "articulo",
      authorId: "u-1",
      status: "publicado",
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
    };
    expect(countActiveFilters(filters)).toBe(7);
  });

  it("counts only the active dimensions", () => {
    const filters: PostFilters = { ...DEFAULT_POST_FILTERS, category: "eventos" };
    expect(countActiveFilters(filters)).toBe(1);
  });
});

// ─── isDateRangeValid ─────────────────────────────────────────────────────────

describe("isDateRangeValid", () => {
  it("is valid when both dates are null", () => {
    expect(isDateRangeValid({ ...DEFAULT_POST_FILTERS })).toBe(true);
  });

  it("is valid when only dateFrom is set", () => {
    expect(isDateRangeValid({ ...DEFAULT_POST_FILTERS, dateFrom: "2026-03-01" })).toBe(true);
  });

  it("is valid when only dateTo is set", () => {
    expect(isDateRangeValid({ ...DEFAULT_POST_FILTERS, dateTo: "2026-03-31" })).toBe(true);
  });

  it("is valid when dateFrom equals dateTo", () => {
    expect(
      isDateRangeValid({ ...DEFAULT_POST_FILTERS, dateFrom: "2026-03-15", dateTo: "2026-03-15" }),
    ).toBe(true);
  });

  it("is valid when dateFrom is before dateTo", () => {
    expect(
      isDateRangeValid({ ...DEFAULT_POST_FILTERS, dateFrom: "2026-03-01", dateTo: "2026-03-31" }),
    ).toBe(true);
  });

  it("is INVALID when dateFrom is after dateTo", () => {
    expect(
      isDateRangeValid({ ...DEFAULT_POST_FILTERS, dateFrom: "2026-03-31", dateTo: "2026-03-01" }),
    ).toBe(false);
  });
});

// ─── applyFilters ─────────────────────────────────────────────────────────────

describe("applyFilters", () => {
  const posts: Post[] = [
    makePost({
      id: "p-1",
      title: "Cartelera de defensas",
      content: "Contenido defensa",
      category: "defensas",
      type: "articulo",
      authorId: "u-1",
      publishedAt: "2026-03-12T10:00:00Z",
    }),
    makePost({
      id: "p-2",
      title: "Taller de software",
      content: "Taller de desarrollo de software libre",
      category: "eventos",
      type: "post",
      authorId: "u-2",
      publishedAt: "2026-03-11T09:00:00Z",
    }),
    makePost({
      id: "p-3",
      title: "Convocatoria de beca",
      content: "Beca disponible para estudiantes",
      category: "convocatorias",
      type: "ensenanza",
      authorId: "u-3",
      publishedAt: "2026-02-02T08:00:00Z",
    }),
  ];

  it("returns all posts sorted DESC when no filters are active", () => {
    const result = applyFilters(posts, noFilters);
    expect(result.map((p) => p.id)).toEqual(["p-1", "p-2", "p-3"]);
  });

  it("filters by category", () => {
    const result = applyFilters(posts, { ...noFilters, category: "eventos" });
    expect(result.map((p) => p.id)).toEqual(["p-2"]);
  });

  it("filters by type", () => {
    const result = applyFilters(posts, { ...noFilters, type: "post" });
    expect(result.map((p) => p.id)).toEqual(["p-2"]);
  });

  it("filters by authorId", () => {
    const result = applyFilters(posts, { ...noFilters, authorId: "u-3" });
    expect(result.map((p) => p.id)).toEqual(["p-3"]);
  });

  it("filters by keyword in title (case and diacritics insensitive)", () => {
    const result = applyFilters(posts, { ...noFilters, keyword: "Taller" });
    expect(result.map((p) => p.id)).toEqual(["p-2"]);
  });

  it("filters by keyword in content", () => {
    const result = applyFilters(posts, { ...noFilters, keyword: "beca" });
    expect(result.map((p) => p.id)).toEqual(["p-3"]);
  });

  it("filters by keyword without diacritics matching accented content", () => {
    const result = applyFilters(posts, { ...noFilters, keyword: "convocatoria" });
    expect(result.map((p) => p.id)).toEqual(["p-3"]);
  });

  it("filters by dateFrom (inclusive)", () => {
    const result = applyFilters(posts, { ...noFilters, dateFrom: "2026-03-01" });
    expect(result.map((p) => p.id)).toEqual(["p-1", "p-2"]);
  });

  it("filters by dateTo (inclusive)", () => {
    const result = applyFilters(posts, { ...noFilters, dateTo: "2026-02-28" });
    expect(result.map((p) => p.id)).toEqual(["p-3"]);
  });

  it("combines multiple filters", () => {
    const result = applyFilters(posts, {
      ...noFilters,
      category: "defensas",
      dateFrom: "2026-03-01",
    });
    expect(result.map((p) => p.id)).toEqual(["p-1"]);
  });

  it("returns empty array when no posts match", () => {
    const result = applyFilters(posts, { ...noFilters, keyword: "noencontrado" });
    expect(result).toHaveLength(0);
  });

  it("sorts DESC by publishedAt with same-day posts using time precision", () => {
    const postsWithTime: Post[] = [
      makePost({ id: "p-a", publishedAt: "2026-03-12T08:00:00Z" }),
      makePost({ id: "p-b", publishedAt: "2026-03-12T16:00:00Z" }),
      makePost({ id: "p-c", publishedAt: "2026-03-12T12:00:00Z" }),
    ];
    const result = applyFilters(postsWithTime, noFilters);
    expect(result.map((p) => p.id)).toEqual(["p-b", "p-c", "p-a"]);
  });
});
