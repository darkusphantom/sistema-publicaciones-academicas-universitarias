/**
 * Classification Realm / Disciplines (Rubro de clasificación).
 * Five disciplines of the FCT plus one professional development track.
 */
export const POST_CATEGORIES = [
    "matematicas",
    "biologia",
    "quimica",
    "fisica",
    "computacion",
    "crecimiento-profesional",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
