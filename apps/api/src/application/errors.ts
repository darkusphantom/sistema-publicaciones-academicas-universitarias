/**
 * Errores de aplicación (capa `application/`).
 *
 * Los casos de uso lanzan errores semánticos; las rutas (`routes/`) los
 * traducen al JSON wire de error sin fuga de detalle interno (R2).
 */

/** Base de los errores de aplicación con su status HTTP asociado. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Recurso no encontrado o no visible → 404. */
export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404, "not_found");
    this.name = "NotFoundError";
  }
}

/** El llamante no tiene permiso → 403. */
export class ForbiddenError extends AppError {
  constructor(message = "No tienes permiso para realizar esta acción") {
    super(message, 403, "forbidden");
    this.name = "ForbiddenError";
  }
}

/** Conflicto de unicidad (email/username duplicados) → 409. */
export class ConflictError extends AppError {
  constructor(message: string, code = "conflict") {
    super(message, 409, code);
    this.name = "ConflictError";
  }
}

/** Credenciales inválidas (R13: 401 idéntico en todos los casos). */
export class InvalidCredentialsError extends AppError {
  constructor() {
    super("El usuario o la contraseña no coinciden.", 401, "invalid_credentials");
    this.name = "InvalidCredentialsError";
  }
}

/** Sin sesión o sesión inválida → 401. */
export class UnauthorizedError extends AppError {
  constructor(message = "Debes iniciar sesión para continuar") {
    super(message, 401, "unauthorized");
    this.name = "UnauthorizedError";
  }
}