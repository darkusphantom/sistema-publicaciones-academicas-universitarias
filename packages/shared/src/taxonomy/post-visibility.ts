/**
 * Visibility and editorial state of a publication.
 * - `publicado`: visible to everyone.
 * - `borrador`: visible only to the author.
 * - `oculto`: hidden by admin; visible to author and admin.
 */
export const POST_VISIBILITIES = [
    "publicado",
    "borrador",
    "oculto",
] as const;

export type PostVisibility = (typeof POST_VISIBILITIES)[number];
