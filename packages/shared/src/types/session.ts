import type { UserRole } from "./user";

/**
 * Sesión activa de usuario.
 * La sesión nunca contiene la contraseña ni el correo completo.
 */
export type Session = {
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
  expiresAt: string;
};
