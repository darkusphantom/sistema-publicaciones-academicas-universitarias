import type { UserRole } from "./user";

/**
 * Sesión activa de usuario (espejo de `src/lib/types.ts`).
 * La sesión nunca contiene la contraseña ni el correo.
 */
export type Session = {
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
  expiresAt: string;
};