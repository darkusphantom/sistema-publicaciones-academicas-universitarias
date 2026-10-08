"use client";

import Link from "next/link";
import { useSession } from "@/lib/session/session-provider";
import { canViewPost } from "@/lib/visibility";
import { taxonomyLabel, TYPE_LABELS, VISIBILITY_LABELS, VISIBILITY_NOTES } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { extractKeywords } from "@/lib/keywords";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeftIcon, TagIcon, LockIcon } from "@/components/ui/icons";
import { buttonStyles } from "@/components/ui/button";
import type { Post, AuthorOption } from "@/lib/types";
import { setVisibilityAction } from "@/app/(main)/@modal/posts/actions";
import { useState } from "react";

/** Props accepted by {@link PostDetail}. */
export type PostDetailProps = {
  post: Post;
  author: AuthorOption | null;
};

/**
 * Detailed post reader view.
 *
 * Design spec (`docs/design/wireframes_post_detail.md`):
 * - Client component: session gating via `useSession()` and `canViewPost`.
 * - Accessible article layout with heading hierarchy starting at `h1#titulo-publicacion`.
 * - Author linking to `/profile/[username]`.
 * - Full content block rendering and complete hashtag chips list.
 * - Role-aware action bar (Edit/Delete for author; Visibility/Delete for admin).
 *
 * @param props - Post detail props.
 * @returns The article view or unavailable empty state.
 */
export function PostDetail({ post: initialPost, author }: PostDetailProps) {
  const { session, status } = useSession();
  const [post, setPost] = useState<Post>(initialPost);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  if (status === "loading") {
    return <div aria-busy="true" className="min-h-96" aria-label="Cargando publicación" />;
  }

  if (!session || !canViewPost(post, session)) {
    return (
      <div className="py-12">
        <EmptyState
          title="No encontramos esta publicación"
          description="Puede que se haya eliminado o que no tengas permiso para verla."
          action={{
            label: "Volver al feed",
            href: "/feed",
          }}
        />
      </div>
    );
  }

  const isAuthor = session.user.id === post.authorId;
  const isAdmin = session.user.role === "admin";
  const visibilityLabel = VISIBILITY_LABELS[post.visibility];
  const visibilityNote = VISIBILITY_NOTES[post.visibility];
  const keywords = extractKeywords(post.content);
  const blocks = post.content.split(/\n{2,}/).filter((b) => b.trim().length > 0);

  async function handleToggleVisibility() {
    const nextVisibility = post.visibility === "publicado" ? "oculto" : "publicado";
    try {
      const updated = await setVisibilityAction(post.id, nextVisibility);
      setPost(updated);
      setActionStatus(
        nextVisibility === "oculto" ? "Publicación oculta." : "Publicación visible.",
      );
    } catch {
      setActionStatus("Error al actualizar la visibilidad.");
    }
  }

  return (
    <article
      aria-labelledby="titulo-publicacion"
      className="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8 py-4"
    >
      {/* ── 1. Volver al feed link ── */}
      <div>
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-teal hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded-sm"
        >
          <ArrowLeftIcon className="size-4" />
          Volver al feed
        </Link>
      </div>

      {/* ── 2. Badges (type + visibility) ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge tone="category">{TYPE_LABELS[post.type]}</Badge>
        {visibilityLabel && (
          <Badge
            tone={post.visibility === "oculto" ? "warning" : "muted"}
            icon={<LockIcon className="size-3" />}
          >
            {visibilityLabel}
          </Badge>
        )}
      </div>

      {/* ── 3. Title ── */}
      <h1
        id="titulo-publicacion"
        className="font-display text-h1 text-text leading-tight"
      >
        {post.title}
      </h1>

      {/* ── 4. Metadata ── */}
      <div className="text-sm text-text-muted flex flex-col gap-1">
        {author ? (
          <>
            <p>
              Por{" "}
              <Link
                href={`/profile/${author.username}`}
                className="underline hover:text-accent-teal transition-colors"
              >
                {author.fullName}
              </Link>
            </p>
            <p>
              @{author.username} ·{" "}
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </p>
          </>
        ) : (
          <p>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </p>
        )}
        <p>Facultad Experimental de Ciencias y Tecnología</p>
      </div>

      {/* ── 5. Taxonomy ── */}
      <p className="text-sm font-medium text-text-muted">{taxonomyLabel(post)}</p>

      {visibilityNote && (
        <p className="flex items-center gap-1.5 text-sm text-text-muted bg-surface-muted p-3 rounded-md border border-border">
          <LockIcon aria-hidden="true" className="size-4" />
          {visibilityNote}
        </p>
      )}

      <hr className="border-border" />

      {/* ── 7. Image (optional) ── */}
      {post.imageUrl && (
        <div className="w-full aspect-video overflow-hidden rounded-lg border border-border bg-surface-alt relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt=""
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* ── 8. Body ── */}
      <div className="flex flex-col gap-4 text-base md:text-lg leading-relaxed text-text max-w-[68ch]">
        {blocks.map((block, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {block}
          </p>
        ))}
      </div>

      {/* ── 9. Keywords ── */}
      {keywords.length > 0 && (
        <ul
          className="flex flex-wrap gap-2 list-none p-0 m-0 items-center"
          aria-label="Palabras clave"
        >
          <li aria-hidden="true" className="text-text-muted">
            <TagIcon className="size-4" />
          </li>
          {keywords.map((kw) => (
            <li key={kw}>
              <Badge tone="neutral">{kw}</Badge>
            </li>
          ))}
        </ul>
      )}

      <hr className="border-border" />

      {/* ── 11. Actions by role ── */}
      {(isAuthor || isAdmin) && (
        <div
          role="group"
          aria-label="Acciones sobre la publicación"
          className="flex flex-wrap gap-3 justify-start sm:justify-end items-center"
        >
          {actionStatus && (
            <p role="status" className="text-sm text-text-muted mr-auto">
              {actionStatus}
            </p>
          )}

          {isAuthor ? (
            <>
              <Link
                href={`/posts/${post.id}/edit`}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Editar
              </Link>
              <Link
                href={`/posts/${post.id}/delete`}
                className={buttonStyles({ variant: "ghost", size: "sm" }) + " text-danger hover:bg-surface-muted"}
              >
                Eliminar
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <form
                action={handleToggleVisibility}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleToggleVisibility();
                }}
              >
                <button
                  type="submit"
                  className={buttonStyles({ variant: "secondary", size: "sm" })}
                >
                  {post.visibility === "publicado" ? "Ocultar" : "Mostrar"}
                </button>
              </form>
              <Link
                href={`/posts/${post.id}/delete`}
                className={buttonStyles({ variant: "ghost", size: "sm" }) + " text-danger hover:bg-surface-muted"}
              >
                Eliminar
              </Link>
            </>
          ) : null}
        </div>
      )}
    </article>
  );
}
