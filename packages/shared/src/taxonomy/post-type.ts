/**
 * Nature of the content (Naturaleza institucional).
 */
export const POST_TYPES = [
    "post",
    "articulo",
    "ensenanza",
    "noticias",
    "eventos",
    "defensas",
    "investigacion",
    "convocatorias",
] as const;

export type PostType = (typeof POST_TYPES)[number];
