import { describe, expect, it } from "vitest";
import {
  CATEGORY_LABELS,
  TYPE_LABELS,
  AREA_LABELS,
  AREAS_BY_CATEGORY,
  VISIBILITY_LABELS,
  taxonomyLabel,
} from "./taxonomy";
import type { Post } from "@/lib/types";

describe("taxonomy", () => {
  it("provides labels for all categories", () => {
    expect(CATEGORY_LABELS.computacion).toBe("Computación");
    expect(CATEGORY_LABELS["crecimiento-profesional"]).toBe("Desarrollo profesional");
  });

  it("provides labels for types", () => {
    expect(TYPE_LABELS.defensas).toBe("Defensas");
    expect(TYPE_LABELS.noticias).toBe("Noticias");
  });

  it("provides labels for research areas", () => {
    expect(AREA_LABELS.general).toBe("General");
    expect(AREA_LABELS["inteligencia-artificial"]).toBe("Inteligencia Artificial");
  });

  it("maps research areas by category", () => {
    expect(AREAS_BY_CATEGORY.computacion).toContain("inteligencia-artificial");
    expect(AREAS_BY_CATEGORY.computacion[0]).toBe("general");
    expect(AREAS_BY_CATEGORY.matematicas[0]).toBe("general");
  });

  it("provides labels for post visibility", () => {
    expect(VISIBILITY_LABELS.publicado).toBeNull();
    expect(VISIBILITY_LABELS.borrador).toBe("Borrador");
    expect(VISIBILITY_LABELS.oculto).toBe("Oculto");
  });

  it("formats taxonomyLabel correctly", () => {
    const post = {
      category: "computacion",
      researchArea: "general",
    } as Post;

    expect(taxonomyLabel(post)).toBe("Computación · General");
  });
});
