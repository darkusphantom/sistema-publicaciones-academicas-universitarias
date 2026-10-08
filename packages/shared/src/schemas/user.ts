/**
 * Re-exporta los schemas de usuario desde el módulo de auth.
 * Mantenido como módulo separado para permitir importaciones específicas
 * sin incluir los schemas de autenticación completos.
 */
export {
  userSchema,
  sessionSchema,
  SetUserRoleSchema,
  emailSchema,
  usernameSchema,
  nameSchema,
  idSchema,
} from "./auth";

export {
  bioSchema,
  avatarFileSchema,
  avatarDataUrlSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  AVATAR_DATA_URL_MAX_CHARS,
} from "./profile";
