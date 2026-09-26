/**
 * Define the possible roles for users in the platform.
 */
export type UserRole = "estudiante" | "profesor" | "admin";

/**
 * Represents a registered user in the system.
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
 * Represents an active user session.
 */
export type Session = {
  user: Pick<User, "id" | "username" | "role">;
  expiresAt: string;
};

/**
 * Utility type to represent field-level errors in a form based on its model.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Standardized result for authentication operations.
 */
export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
