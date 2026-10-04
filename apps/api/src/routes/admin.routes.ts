import type { Hono } from "hono";
import { setPostVisibility } from "../application/admin/set-post-visibility";
import { setUserRole } from "../application/admin/set-user-role";
import {
  AdminSetVisibilitySchema,
  SetUserRoleSchema,
  idSchema,
} from "../domain/validation";
import { csrf } from "../middleware/csrf";
import { requireRole } from "../middleware/require-role";
import { requireSession } from "../middleware/require-session";
import type { RouteDeps } from "./route-deps";
import { parseJsonBody, validationError } from "./helpers";

/**
 * Registra las rutas de admin (api-structure.md §9.5 y §9.6):
 * `PATCH /admin/users/:id/role` y `PATCH /admin/posts/:id/visibility`.
 *
 * Matriz de enforcement (R16): solo `admin`, verificado EN SERVIDOR por
 * petición (`requireSession` + `requireRole("admin")`) con el rol fresco del
 * store (R14). Mutaciones con CSRF. Id inexistente → 404.
 *
 * @param app  - App Hono.
 * @param deps - Dependencias inyectadas.
 */
export function registerAdminRoutes(app: Hono, deps: RouteDeps): void {
  const { auth, users, posts, trustedOrigins } = deps;
  const csrfMiddleware = csrf(trustedOrigins);
  const setUserRoleUseCase = setUserRole({ users });
  const setPostVisibilityUseCase = setPostVisibility({ posts });

  app.patch(
    "/api/v1/admin/users/:id/role",
    requireSession(auth, users),
    requireRole("admin"),
    csrfMiddleware,
    async (c) => {
      const idParsed = idSchema.safeParse(c.req.param("id"));
      if (!idParsed.success) return validationError(c, idParsed.error);
      const body = await parseJsonBody(c);
      const parsed = SetUserRoleSchema.safeParse(body);
      if (!parsed.success) return validationError(c, parsed.error);
      await setUserRoleUseCase(idParsed.data, parsed.data.role);
      return c.body(null, 204);
    },
  );

  app.patch(
    "/api/v1/admin/posts/:id/visibility",
    requireSession(auth, users),
    requireRole("admin"),
    csrfMiddleware,
    async (c) => {
      const idParsed = idSchema.safeParse(c.req.param("id"));
      if (!idParsed.success) return validationError(c, idParsed.error);
      const body = await parseJsonBody(c);
      const parsed = AdminSetVisibilitySchema.safeParse(body);
      if (!parsed.success) return validationError(c, parsed.error);
      const post = await setPostVisibilityUseCase(
        idParsed.data,
        parsed.data.visibility,
      );
      return c.json(post, 200);
    },
  );
}