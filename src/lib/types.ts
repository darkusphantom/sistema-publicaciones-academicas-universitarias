export type UserRole = "estudiante" | "profesor" | "admin";

export type User = {
  id: string;
  username: string;
  email: string;
  givenName: string;
  familyName: string;
  role: UserRole;
  createdAt: string;
};

export type Session = {
  user: Pick<User, "id" | "username" | "role">;
  expiresAt: string;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
