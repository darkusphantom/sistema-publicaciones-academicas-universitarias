import {
  type PostCategory,
} from "../types";

export function validateTitle(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 120) {
    return "El título debe tener entre 5 y 120 caracteres.";
  }
  return null;
}

export function validateContent(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 30) {
    return "La descripción debe tener al menos 30 caracteres.";
  }
  if (trimmed.length > 4000) {
    return "La descripción no puede tener más de 4000 caracteres.";
  }
  return null;
}

export function validateImageUrl(value: string | null | undefined): string | null {
  if (!value) return null; // Opción válida
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.length > 500) {
    return "Escribe una dirección web válida.";
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Escribe una dirección web válida.";
    }
  } catch {
    return "Escribe una dirección web válida.";
  }

  return null;
}

export function validateType(value: string): string | null {
  const validTypes = new Set<string>([
    "noticias",
    "eventos",
    "defensas",
    "investigacion",
    "convocatorias",
  ]);
  if (!validTypes.has(value)) {
    return "Elige un tipo de publicación.";
  }
  return null;
}

export function validateCategory(value: string): string | null {
  const validCategories = new Set<string>([
    "matematicas",
    "biologia",
    "quimica",
    "fisica",
    "computacion",
    "crecimiento-profesional",
  ]);
  if (!validCategories.has(value)) {
    return "Elige una categoría.";
  }
  return null;
}

const AREAS_BY_CATEGORY: Record<PostCategory, Set<string>> = {
  matematicas: new Set([
    "general",
    "estadistica",
    "probabilidad",
    "optimizacion",
    "matematicas-aplicadas",
    "modelado-matematico",
  ]),
  biologia: new Set([
    "general",
    "biotecnologia",
    "bioquimica",
    "genetica",
    "microbiologia",
    "ecologia",
    "bioinformatica",
  ]),
  quimica: new Set([
    "general",
    "quimica-analitica",
    "quimica-organica",
    "quimica-inorganica",
    "fisicoquimica",
    "quimica-medioambiental",
  ]),
  fisica: new Set([
    "general",
    "fisica-computacional",
    "fisica-de-materiales",
    "astronomia",
    "fisica-nuclear",
    "mecanica-de-fluidos",
  ]),
  computacion: new Set([
    "general",
    "inteligencia-artificial",
    "aprendizaje-automatico",
    "ciencia-de-datos",
    "desarrollo-web",
    "ingenieria-software",
    "redes-telecomunicaciones",
    "seguridad-informatica",
    "sistemas-distribuidos",
    "bases-de-datos",
    "computacion-grafica",
    "robotica",
    "arquitectura-computadores",
  ]),
  "crecimiento-profesional": new Set([
    "general",
    "gestion-proyectos",
    "liderazgo",
    "emprendimiento",
    "comunicacion-profesional",
    "etica-profesional",
  ]),
};

export function validateResearchArea(area: string, category: string): string | null {
  if (area === "general") return null;

  const validCategories = new Set(Object.keys(AREAS_BY_CATEGORY));
  if (!validCategories.has(category)) {
    return "Elige un área de investigación.";
  }

  const allowedAreas = AREAS_BY_CATEGORY[category as PostCategory];
  if (!allowedAreas.has(area)) {
    return "Elige un área de investigación.";
  }
  return null;
}

export function validateVisibility(value: string): string | null {
  if (value !== "publicado" && value !== "borrador") {
    return "Estado de visibilidad inválido.";
  }
  return null;
}

export function validatePostForm(data: FormData, intent: "publicar" | "guardar-borrador"): { success: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const title = data.get("title")?.toString() || "";
  const content = data.get("content")?.toString() || "";
  const imageUrl = data.get("imageUrl")?.toString() || "";
  const type = data.get("type")?.toString() || "";
  const category = data.get("category")?.toString() || "";
  const researchArea = data.get("researchArea")?.toString() || "";

  const titleError = validateTitle(title);
  if (titleError) errors.title = titleError;

  const contentError = validateContent(content);
  if (contentError) errors.content = contentError;

  const imageError = validateImageUrl(imageUrl);
  if (imageError) errors.imageUrl = imageError;

  const typeError = validateType(type);
  if (typeError) errors.type = typeError;

  const categoryError = validateCategory(category);
  if (categoryError) errors.category = categoryError;

  const areaError = validateResearchArea(researchArea, category);
  if (areaError) errors.researchArea = areaError;

  // Visibility is implicitly validated by the intent
  const visibility = intent === "publicar" ? "publicado" : "borrador";
  const visibilityError = validateVisibility(visibility);
  if (visibilityError) errors.visibility = visibilityError; // Although this should not occur from UI intent directly

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}
