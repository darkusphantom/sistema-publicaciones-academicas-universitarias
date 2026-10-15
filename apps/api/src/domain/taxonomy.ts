/**
 * Taxonomía de publicaciones — espejo de `src/lib/types.ts` y
 * `src/lib/validation/post.ts` del frontend.
 *
 * Es la **fuente única** de los valores válidos del dominio en la API y del
 * catálogo `researchArea` por rubro. Los esquemas `zod` de
 * `domain/validation.ts` derivan de estos arreglos, de modo que la validación
 * del servidor y la del cliente no pueden divergir (requisito R8:
 * `threat-model-api.md`).
 *
 * Referencia de diseño: `docs/design/wireframes_posts.md` §4.1–§4.2 y
 * `docs/design/wireframes_feed.md` §4.1.
 */

/**
 * Rubros de clasificación: cinco disciplinas de la FCT más el track de
 * desarrollo profesional.
 */
export const POST_CATEGORIES = [
  "matematicas",
  "biologia",
  "quimica",
  "fisica",
  "computacion",
  "crecimiento-profesional",
] as const;

/** Naturaleza institucional de una publicación. */
export const POST_TYPES = [
  "noticias",
  "eventos",
  "defensas",
  "investigacion",
  "convocatorias",
] as const;

/**
 * Áreas de investigación: 38 áreas específicas más `general`, que es válido en
 * los seis rubros.
 */
export const RESEARCH_AREAS = [
  "general",
  // matematicas
  "estadistica",
  "probabilidad",
  "optimizacion",
  "matematicas-aplicadas",
  "modelado-matematico",
  // biologia
  "biotecnologia",
  "bioquimica",
  "genetica",
  "microbiologia",
  "ecologia",
  "bioinformatica",
  // quimica
  "quimica-analitica",
  "quimica-organica",
  "quimica-inorganica",
  "fisicoquimica",
  "quimica-medioambiental",
  // fisica
  "fisica-computacional",
  "fisica-de-materiales",
  "astronomia",
  "fisica-nuclear",
  "mecanica-de-fluidos",
  // computacion
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
  // crecimiento-profesional
  "gestion-proyectos",
  "liderazgo",
  "emprendimiento",
  "comunicacion-profesional",
  "etica-profesional",
] as const;

/** Rubro de clasificación de una publicación. */
export type PostCategory = (typeof POST_CATEGORIES)[number];

/** Naturaleza institucional de una publicación. */
export type PostType = (typeof POST_TYPES)[number];

/** Área de investigación adscrita a un rubro (`general` es universal). */
export type ResearchArea = (typeof RESEARCH_AREAS)[number];

/**
 * Catálogo de áreas válidas por rubro. `general` se incluye en todos (§4.2).
 */
export const AREAS_BY_CATEGORY: Record<PostCategory, readonly ResearchArea[]> = {
  matematicas: [
    "general",
    "estadistica",
    "probabilidad",
    "optimizacion",
    "matematicas-aplicadas",
    "modelado-matematico",
  ],
  biologia: [
    "general",
    "biotecnologia",
    "bioquimica",
    "genetica",
    "microbiologia",
    "ecologia",
    "bioinformatica",
  ],
  quimica: [
    "general",
    "quimica-analitica",
    "quimica-organica",
    "quimica-inorganica",
    "fisicoquimica",
    "quimica-medioambiental",
  ],
  fisica: [
    "general",
    "fisica-computacional",
    "fisica-de-materiales",
    "astronomia",
    "fisica-nuclear",
    "mecanica-de-fluidos",
  ],
  computacion: [
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
  ],
  "crecimiento-profesional": [
    "general",
    "gestion-proyectos",
    "liderazgo",
    "emprendimiento",
    "comunicacion-profesional",
    "etica-profesional",
  ],
};

/**
 * Comprueba que un área pertenezca al rubro indicado.
 *
 * Regla de `wireframes_posts.md` §4.2: `general` es válido en cualquier rubro;
 * cualquier otra área debe figurar en el catálogo del rubro.
 *
 * @param area     - Área de investigación.
 * @param category - Rubro de clasificación.
 * @returns `true` si el par es coherente.
 * @complexity O(k) con k ≤ 13 (áreas del rubro de mayor tamaño).
 */
export function isResearchAreaInCategory(
  area: ResearchArea,
  category: PostCategory,
): boolean {
  if (area === "general") return true;
  return AREAS_BY_CATEGORY[category].includes(area);
}
