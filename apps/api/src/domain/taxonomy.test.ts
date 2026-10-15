import { describe, expect, it } from "vitest";
import {
  AREAS_BY_CATEGORY,
  POST_CATEGORIES,
  POST_TYPES,
  RESEARCH_AREAS,
  isResearchAreaInCategory,
} from "./taxonomy";

describe("taxonomy", () => {
  it("exposes the six rubros and five institutional types", () => {
    expect(POST_CATEGORIES).toHaveLength(6);
    expect(POST_TYPES).toHaveLength(5);
  });

  it("exposes 39 research areas (38 specific + general) without duplicates", () => {
    expect(RESEARCH_AREAS).toHaveLength(39);
    expect(new Set(RESEARCH_AREAS).size).toBe(39);
  });

  it("keeps general available in every rubro", () => {
    for (const category of POST_CATEGORIES) {
      expect(AREAS_BY_CATEGORY[category]).toContain("general");
    }
  });

  it("accepts general in any category but rejects a foreign specific area", () => {
    expect(isResearchAreaInCategory("general", "fisica")).toBe(true);
    expect(isResearchAreaInCategory("general", "computacion")).toBe(true);

    expect(isResearchAreaInCategory("desarrollo-web", "computacion")).toBe(true);
    expect(isResearchAreaInCategory("astronomia", "fisica")).toBe(true);

    // Áreas que pertenecen a otro rubro (o al track) se rechazan.
    expect(isResearchAreaInCategory("desarrollo-web", "fisica")).toBe(false);
    expect(isResearchAreaInCategory("astronomia", "computacion")).toBe(false);
    expect(isResearchAreaInCategory("liderazgo", "computacion")).toBe(false);
  });

  it("only lists areas of the same union as RESEARCH_AREAS", () => {
    const allowed = new Set<string>(RESEARCH_AREAS);
    for (const category of POST_CATEGORIES) {
      for (const area of AREAS_BY_CATEGORY[category]) {
        expect(allowed.has(area)).toBe(true);
      }
    }
  });
});
