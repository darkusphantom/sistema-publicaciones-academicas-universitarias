import { z } from "zod";
import { nameSchema, emailSchema, passwordRegisterSchema } from "./auth";

/** Bio: trim, 1–160. Vacío → se guarda `null`. */
export const bioSchema = z.string().trim().max(160);

/** Tope de imagen de perfil: 5 MB = 5 * 1024 * 1024 bytes. */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Únicos formatos aceptados (requisito del producto; §10.6). */
export const AVATAR_MIME_TYPES = ["image/png", "image/jpeg"] as const;

/** Validación de archivo (cliente y, en el futuro, servidor). */
export const avatarFileSchema = z
  .custom<File>((file) => file instanceof File && file.size > 0, {
    message: "empty_file",
  })
  .refine((file) => (AVATAR_MIME_TYPES as readonly string[]).includes(file.type), {
    message: "invalid_type",
  })
  .refine((file) => file.size <= AVATAR_MAX_BYTES, { message: "too_large" });

/**
 * Tope del data URL que viaja en `avatarUrl` (fase estática).
 * Base64 infla ~33%: `ceil(AVATAR_MAX_BYTES * 4 / 3)`.
 */
export const AVATAR_DATA_URL_MAX_CHARS = Math.ceil((AVATAR_MAX_BYTES * 4) / 3);

/** Prefijos de data URL admitidos en `avatarUrl` (§2.1, §2.9). */
const AVATAR_DATA_URL_PREFIXES = ["data:image/png;base64,", "data:image/jpeg;base64,"];

/** `avatarUrl` como data URL validado: prefijo blanco + tope de longitud. */
export const avatarDataUrlSchema = z
  .string()
  .max(AVATAR_DATA_URL_MAX_CHARS, { message: "too_large" })
  .refine(
    (value) => AVATAR_DATA_URL_PREFIXES.some((prefix) => value.startsWith(prefix)),
    { message: "invalid_type" },
  );

/** Cuerpo de edición de perfil: solo campos personales, todo opcional. */
export const UpdateProfileSchema = z
  .object({
    givenName: nameSchema.optional(),
    familyName: nameSchema.optional(),
    email: emailSchema.optional(),
    bio: bioSchema.nullish(),
    avatarUrl: avatarDataUrlSchema.nullish(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "empty_patch" });

/** Cambio de contraseña: la actual nunca viaja sin trim, la nueva 8–128. */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: passwordRegisterSchema, // 8–128, sin trim (auth.md §4.2)
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "password_same",
    path: ["newPassword"],
  });
