import { describe, expect, it } from "vitest";
import { validatePostForm, validateResearchArea } from "./post";

describe("validateResearchArea", () => {
  it("returns null for a valid area in a given category", () => {
    expect(validateResearchArea("optimizacion", "matematicas")).toBe(null);
  });

  it("returns null for general in any category", () => {
    expect(validateResearchArea("general", "fisica")).toBe(null);
  });

  it("returns error for an area that doesn't belong to the category", () => {
    expect(validateResearchArea("robotica", "matematicas")).toBeDefined();
  });

  it("returns error for an invalid area", () => {
    expect(validateResearchArea("invalid-area", "matematicas")).toBeDefined();
  });
});

describe("validatePostForm", () => {
  function createFormData(data: Record<string, string>) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
      fd.append(key, value);
    }
    return fd;
  }

  const validData = {
    title: "Test title is long enough",
    content: "Test content is long enough so that it reaches 30 characters right now",
    type: "noticias",
    category: "computacion",
    researchArea: "robotica",
  };

  it("returns no errors for valid data", () => {
    const fd = createFormData(validData);
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(true);
    expect(errors).toEqual({});
  });

  it("returns error for missing title", () => {
    const fd = createFormData({ ...validData, title: "   " });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it("returns error for short title", () => {
    const fd = createFormData({ ...validData, title: "hi" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it("returns error for title exceeding max length", () => {
    const fd = createFormData({ ...validData, title: "a".repeat(121) });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it("returns error for missing content", () => {
    const fd = createFormData({ ...validData, content: "" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.content).toBeDefined();
  });

  it("returns error for short content", () => {
    const fd = createFormData({ ...validData, content: "hi" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.content).toBeDefined();
  });

  it("returns error for content exceeding max length", () => {
    const fd = createFormData({ ...validData, content: "a".repeat(50001) });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.content).toBeDefined();
  });

  it("returns error for missing type", () => {
    const fd = createFormData({ ...validData, type: "" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.type).toBeDefined();
  });

  it("returns error for invalid type", () => {
    const fd = createFormData({ ...validData, type: "invalid" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.type).toBeDefined();
  });

  it("returns error for missing category", () => {
    const fd = createFormData({ ...validData, category: "" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.category).toBeDefined();
  });

  it("returns error for invalid category", () => {
    const fd = createFormData({ ...validData, category: "invalid" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.category).toBeDefined();
  });

  it("returns error for missing researchArea", () => {
    const fd = createFormData({ ...validData, researchArea: "" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.researchArea).toBeDefined();
  });

  it("returns error for researchArea that doesn't match category", () => {
    const fd = createFormData({ ...validData, researchArea: "genetica" });
    const { success, errors } = validatePostForm(fd, "publicar");
    expect(success).toBe(false);
    expect(errors.researchArea).toBeDefined();
  });
});
