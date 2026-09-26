import { User } from "@/lib/types";

/**
 * Mock data for users.
 * Credentials (passwords) are strictly NOT stored here.
 */
export const mockUsers: User[] = [
  {
    id: "u-1",
    username: "admin",
    email: "admin@facyt.edu",
    givenName: "Administrador",
    familyName: "Sistema",
    role: "admin",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-2",
    username: "m.rivas",
    email: "maria@correo.com",
    givenName: "María",
    familyName: "Rivas",
    role: "estudiante",
    createdAt: "2026-09-01T00:00:00Z",
  },
];
