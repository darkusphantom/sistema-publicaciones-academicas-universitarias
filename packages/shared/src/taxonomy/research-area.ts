/**
 * Specific research area within a category. 38 areas + "general".
 */
export const RESEARCH_AREA = [
    "general"
    , "estadistica", "probabilidad", "optimizacion"
    , "matematicas-aplicadas", "modelado-matematico"
    , "biotecnologia", "bioquimica", "genetica", "microbiologia"
    , "ecologia", "bioinformatica"
    , "quimica-analitica", "quimica-organica", "quimica-inorganica"
    , "fisicoquimica", "quimica-medioambiental"
    , "fisica-computacional", "fisica-de-materiales", "astronomia"
    , "fisica-nuclear", "mecanica-de-fluidos"
    , "inteligencia-artificial", "aprendizaje-automatico", "ciencia-de-datos"
    , "desarrollo-web", "ingenieria-software", "redes-telecomunicaciones"
    , "seguridad-informatica", "sistemas-distribuidos", "bases-de-datos"
    , "computacion-grafica", "robotica", "arquitectura-computadores"
    , "gestion-proyectos", "liderazgo", "emprendimiento"
    , "comunicacion-profesional", "etica-profesional"

] as const

export type ResearchArea = (typeof RESEARCH_AREA)[number];
