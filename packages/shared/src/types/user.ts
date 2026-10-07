/**
 * Roles posibles de un usuario de la plataforma Red FaCyT.
 */
export type UserRole = "estudiante" | "profesor" | "admin";

/**
 * Usuario registrado en el sistema.
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
 * Datos ligeros de autor para filtros y tarjetas.
 */
export type AuthorOption = {
  id: string;
  username: string;
  /** Nombre completo para mostrar, p. ej. "María Rivas". */
  fullName: string;
};
