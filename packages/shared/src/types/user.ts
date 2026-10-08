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
  /** Breve presentación personal, máx. 160 caracteres. `null` = sin bio. */
  bio?: string | null;
  /**
   * Foto de perfil. `null` = sin foto (se usan las iniciales).
   * Solo admite data URL validado (fase estática) o ruta relativa `/uploads/…`
   * (futuro). Nunca una URL absoluta externa (§2.9).
   */
  avatarUrl?: string | null;
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
