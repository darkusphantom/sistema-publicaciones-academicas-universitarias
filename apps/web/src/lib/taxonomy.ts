import type {
  Post,
  PostCategory,
  PostType,
  ResearchArea,
  PostVisibility,
} from "@/lib/types";

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  matematicas: "Matemáticas",
  biologia: "Biología",
  quimica: "Química",
  fisica: "Física",
  computacion: "Computación",
  "crecimiento-profesional": "Desarrollo profesional",
};

export const TYPE_LABELS: Record<PostType, string> = {
  noticias: "Noticias",
  eventos: "Eventos",
  defensas: "Defensas",
  investigacion: "Investigación",
  convocatorias: "Convocatorias",
  post: "",
  articulo: "",
  ensenanza: "",
};

export const AREA_LABELS: Record<ResearchArea, string> = {
  general: "General",
  estadistica: "Estadística",
  probabilidad: "Probabilidad",
  optimizacion: "Optimización",
  "matematicas-aplicadas": "Matemáticas Aplicadas",
  "modelado-matematico": "Modelado Matemático",
  biotecnologia: "Biotecnología",
  bioquimica: "Bioquímica",
  genetica: "Genética",
  microbiologia: "Microbiología",
  ecologia: "Ecología",
  bioinformatica: "Bioinformática",
  "quimica-analitica": "Química Analítica",
  "quimica-organica": "Química Orgánica",
  "quimica-inorganica": "Química Inorgánica",
  fisicoquimica: "Fisicoquímica",
  "quimica-medioambiental": "Química Medioambiental",
  "fisica-computacional": "Física Computacional",
  "fisica-de-materiales": "Física de Materiales",
  astronomia: "Astronomía",
  "fisica-nuclear": "Física Nuclear",
  "mecanica-de-fluidos": "Mecánica de Fluidos",
  "inteligencia-artificial": "Inteligencia Artificial",
  "aprendizaje-automatico": "Aprendizaje Automático",
  "ciencia-de-datos": "Ciencia de Datos",
  "desarrollo-web": "Desarrollo Web",
  "ingenieria-software": "Ingeniería de Software",
  "redes-telecomunicaciones": "Redes y Telecomunicaciones",
  "seguridad-informatica": "Seguridad Informática",
  "sistemas-distribuidos": "Sistemas Distribuidos",
  "bases-de-datos": "Bases de Datos",
  "computacion-grafica": "Computación Gráfica",
  robotica: "Robótica",
  "arquitectura-computadores": "Arquitectura de Computadores",
  "gestion-proyectos": "Gestión de Proyectos",
  liderazgo: "Liderazgo y Gestión de Equipos",
  emprendimiento: "Emprendimiento",
  "comunicacion-profesional": "Comunicación Profesional",
  "etica-profesional": "Ética Profesional",
};

export const AREAS_BY_CATEGORY: Record<PostCategory, ResearchArea[]> = {
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
    "liderazgo",
    "comunicacion-profesional",
    "etica-profesional",
    "emprendimiento",
    "gestion-proyectos",
  ],
};

export const VISIBILITY_LABELS: Record<PostVisibility, string | null> = {
  publicado: null,
  borrador: "Borrador",
  oculto: "Oculto",
};

export const VISIBILITY_NOTES: Record<PostVisibility, string | null> = {
  publicado: null,
  borrador: "Solo tú ves esta publicación.",
  oculto: "Oculta por un administrador.",
};

/**
 * Returns formatted taxonomy string (e.g., "Computación · General").
 *
 * @param post - Post object containing category and researchArea.
 * @returns Human readable taxonomy label string.
 */
export function taxonomyLabel(post: Post): string {
  const category = CATEGORY_LABELS[post.category] ?? post.category;
  const area = AREA_LABELS[post.researchArea] ?? post.researchArea;
  return `${category} · ${area}`;
}
