import type { Hono } from "hono";
import { createPost } from "../application/posts/create-post";
import { deletePost } from "../application/posts/delete-post";
import { getFeed, getPost } from "../application/posts/get-post";
import { updatePost } from "../application/posts/update-post";
import {
  AdminUpdatePostSchema,
  FeedQuerySchema,
  PostDraftSchema,
  idSchema,
} from "../domain/validation";
import { csrf } from "../middleware/csrf";
import { requireSession } from "../middleware/require-session";
import type { RouteDeps } from "./route-deps";
import { parseJsonBody, validationError } from "./helpers";

/**
 * Registra las rutas de posts y feed (api-structure.md §9.3):
 * `GET /posts`, `GET /posts/:id`, `POST /posts`, `PATCH /posts/:id`,
 * `DELETE /posts/:id`.
 *
 * Matriz de enforcement (R11/R15): todas autenticadas; creación con
 * `authorId` de la sesión; edición/eliminación solo autor o admin; las
 * mutaciones llevan CSRF. El feed replica la visibilidad del frontend.
 *
 * @param app  - App Hono.
 * @param deps - Dependencias inyectadas.
 */
export function registerPostRoutes(app: Hono, deps: RouteDeps): void {
  const { auth, users, posts, trustedOrigins } = deps;
  const csrfMiddleware = csrf(trustedOrigins);
  const createPostUseCase = createPost({ posts });
  const updatePostUseCase = updatePost({ posts });
  const deletePostUseCase = deletePost({ posts });
  const getPostUseCase = getPost({ posts });
  const getFeedUseCase = getFeed({ posts });

  app.get("/api/v1/posts", requireSession(auth, users), async (c) => {
    const parsed = FeedQuerySchema.safeParse(c.req.query());
    if (!parsed.success) return validationError(c, parsed.error);
    const session = c.get("session");
    const filters = {
      keyword: parsed.data.q,
      category: parsed.data.categoria,
      type: parsed.data.tipo,
      authorId: parsed.data.autor,
      status: parsed.data.estado,
      dateFrom: parsed.data.desde,
      dateTo: parsed.data.hasta,
    };
    const page = { limit: parsed.data.limit, offset: parsed.data.offset };
    const result = await getFeedUseCase(filters, page, session);
    return c.json(result, 200);
  });

  app.get(
    "/api/v1/posts/:id",
    requireSession(auth, users),
    async (c) => {
      const parsed = idSchema.safeParse(c.req.param("id"));
      if (!parsed.success) return validationError(c, parsed.error);
      const post = await getPostUseCase(parsed.data, c.get("session"));
      return c.json(post, 200);
    },
  );

  app.post(
    "/api/v1/posts",
    requireSession(auth, users),
    csrfMiddleware,
    async (c) => {
      const body = await parseJsonBody(c);
      const parsed = PostDraftSchema.safeParse(body);
      if (!parsed.success) return validationError(c, parsed.error);
      const post = await createPostUseCase(parsed.data, c.get("session"));
      return c.json(post, 201);
    },
  );

  app.patch(
    "/api/v1/posts/:id",
    requireSession(auth, users),
    csrfMiddleware,
    async (c) => {
      const idParsed = idSchema.safeParse(c.req.param("id"));
      if (!idParsed.success) return validationError(c, idParsed.error);
      const body = await parseJsonBody(c);
      const parsed = AdminUpdatePostSchema.safeParse(body);
      if (!parsed.success) return validationError(c, parsed.error);
      const post = await updatePostUseCase(
        idParsed.data,
        parsed.data,
        c.get("session"),
      );
      return c.json(post, 200);
    },
  );

  app.delete(
    "/api/v1/posts/:id",
    requireSession(auth, users),
    csrfMiddleware,
    async (c) => {
      const parsed = idSchema.safeParse(c.req.param("id"));
      if (!parsed.success) return validationError(c, parsed.error);
      await deletePostUseCase(parsed.data, c.get("session"));
      return c.body(null, 204);
    },
  );
}