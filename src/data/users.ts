import { User } from "@/lib/types";

/**
 * Mock user dataset for the static frontend phase.
 * Credentials (passwords) are strictly NOT stored here.
 *
 * Distribution (docs/design/wireframes_feed.md §4.6):
 * - 1 admin
 * - 1 profesor
 * - 3 estudiantes (one of which is the default session user)
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
    username: "j.perez",
    email: "juan@facyt.edu",
    givenName: "Juan",
    familyName: "Pérez",
    role: "profesor",
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "u-3",
    username: "m.rivas",
    email: "maria@correo.com",
    givenName: "María",
    familyName: "Rivas",
    role: "estudiante",
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "u-4",
    username: "c.torres",
    email: "carlos@correo.com",
    givenName: "Carlos",
    familyName: "Torres",
    role: "estudiante",
    createdAt: "2026-09-02T00:00:00Z",
  },
  {
    id: "u-5",
    username: "l.gomez",
    email: "luisa@correo.com",
    givenName: "Luisa",
    familyName: "Gómez",
    role: "estudiante",
    createdAt: "2026-09-03T00:00:00Z",
  },
];

