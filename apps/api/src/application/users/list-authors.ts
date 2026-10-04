import type { AuthorOption } from "../../domain/user";
import type { UserRepository } from "../../domain/user";

/** Dependencias del caso de uso de listado de autores. */
export type ListAuthorsDeps = {
  users: UserRepository;
};

/**
 * Crea el caso de uso de listado de autores (R18).
 *
 * Solo autores con publicaciones, orden `es`; nunca incluye email ni rol.
 *
 * @param deps - Puerto de usuarios.
 * @returns Caso de uso `() → AuthorOption[]`.
 */
export function listAuthors(deps: ListAuthorsDeps) {
  return async (): Promise<AuthorOption[]> => deps.users.listAuthors();
}