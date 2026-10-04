/**
 * Roles posibles de un usuario de la plataforma (espejo de `src/lib/types.ts`).
 */
export type UserRole = "estudiante" | "profesor" | "admin";

/**
 * Usuario registrado en el sistema (espejo de `src/lib/types.ts`).
 */
export type User = {
  id: string;
  username: string;
  email: string;
  givenName: string;
  familyName: string;
  role: UserRole;
  createdAt: string;
};

/**
 * Datos ligeros de autor para filtros y tarjetas (espejo de `src/lib/types.ts`).
 */
export type AuthorOption = {
  id: string;
  username: string;
  /** Nombre completo para mostrar, p. ej. "María Rivas". */
  fullName: string;
};

/**
 * Puerto hexagonal para el acceso a datos de usuarios (subconjunto de lectura
 * usado por el feed). Espejo fiel de `UserRepository` del frontend.
 */
export interface UserRepository {
  /**
   * Devuelve los usuarios con al menos una publicación, ordenados por nombre
   * completo con locale `"es"` para un orden estable entre sistemas.
   *
   * @returns Opciones de autor ordenadas por nombre completo.
   */
  listAuthors(): Promise<AuthorOption[]>;
}