import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LockIcon } from "@/components/ui/icons";
import { formatDate, truncateText } from "@/lib/format";
import type { Post, PostCategory, PostType, PostVisibility, AuthorOption } from "@/lib/types";

/** Props accepted by {@link PostCard}. */
export type PostCardProps = {
  post: Post;
  /**
   * Resolved author data. `null` when the `authorId` has no matching user in
   * the repository (broken reference in mock data); the card degrades gracefully
   * by showing only the date.
   */
  author: AuthorOption | null;
};

// ─── Label maps ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PostCategory, string> = {
  noticias: "Noticias",
  eventos: "Eventos",
  defensas: "Defensas",
  investigacion: "Investigación",
  convocatorias: "Convocatorias",
};

const TYPE_LABELS: Record<PostType, string> = {
  post: "Post",
  articulo: "Artículo",
  ensenanza: "Enseñanza",
};

const VISIBILITY_LABELS: Record<PostVisibility, string | null> = {
  publicado: null, // no badge shown for published posts
  borrador: "Borrador",
  oculto: "Oculto",
};

const VISIBILITY_NOTES: Record<PostVisibility, string | null> = {
  publicado: null,
  borrador: "Solo tú ves esta publicación.",
  oculto: "Oculta por un administrador.",
};

/**
 * Editorial post card for the feed.
 *
 * Design spec (`docs/design/wireframes_feed.md` §6.4):
 * - Server Component — no interactivity on the card itself.
 * - The title is the only focusable element: a stretched-link pattern
 *   (`after:absolute after:inset-0`) makes the entire card clickable while
 *   keeping the accessible name on the `<a>` text.
 * - Hover and focus-within both change the border colour so keyboard users
 *   see the same "active card" affordance as pointer users.
 * - Badges never convey state by colour alone (SC 1.4.1); text labels always
 *   accompany any icon.
 * - `line-clamp-3` on the excerpt keeps card heights homogeneous in the grid.
 *
 * @param props - Card props.
 * @returns An `<article>` card element.
 */
export function PostCard({ post, author }: PostCardProps) {
  const visibilityLabel = VISIBILITY_LABELS[post.visibility];
  const visibilityNote = VISIBILITY_NOTES[post.visibility];

  return (
    <article
      className="relative border border-border rounded-lg bg-surface p-5 flex flex-col gap-3 hover:border-primary focus-within:border-primary transition-colors"
    >
      {/* ── Badge row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="category">
          {CATEGORY_LABELS[post.category]}
        </Badge>

        <Badge tone="neutral">
          {TYPE_LABELS[post.type]}
        </Badge>

        {visibilityLabel && (
          <Badge
            tone={post.visibility === "oculto" ? "warning" : "muted"}
            icon={<LockIcon />}
          >
            {visibilityLabel}
          </Badge>
        )}
      </div>

      {/* ── Title (stretched link) ── */}
      <h3 className="font-display text-h3 text-text leading-snug">
        <Link
          href={`/posts/${post.id}`}
          className="after:absolute after:inset-0 focus:outline-none"
        >
          {post.title}
        </Link>
      </h3>

      {/* ── Author and date ── */}
      <p className="text-sm text-text-muted">
        {author
          ? `${author.fullName} · ${formatDate(post.publishedAt)}`
          : formatDate(post.publishedAt)}
      </p>

      {/* ── Excerpt ── */}
      <p className="text-base text-text-muted line-clamp-3">
        {truncateText(post.content, 180)}
      </p>

      {/* ── Visibility note (borrador / oculto) ── */}
      {visibilityNote && (
        <p className="flex items-center gap-1 text-sm text-text-muted">
          <LockIcon aria-hidden="true" />
          {visibilityNote}
        </p>
      )}
    </article>
  );
}
