"use client";

import Link from "next/link";
import { useSession } from "@/lib/session/session-provider";
import { mockUsers } from "@/data/users";
import { mockPosts } from "@/data/posts";
import { filterVisiblePosts } from "@/lib/visibility";
import { formatDate } from "@/lib/format";
import { PostCard } from "@/components/feed/post-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PlusIcon } from "@/components/ui/icons";
import { buttonStyles } from "@/components/ui/button";

/** Props accepted by {@link UserProfileView}. */
export type UserProfileViewProps = {
  targetUsername: string;
};

/**
 * User Profile view component.
 *
 * Design spec (`docs/design/wireframes.md` §3.3):
 * - Renders user details card (avatar initials, full name, @username, email, role badge, joined date).
 * - Renders user publications list filtered by session visibility.
 * - Shows an empty state with "Nueva publicación" CTA if the profile user has no visible publications.
 *
 * @param props - View props containing targetUsername.
 * @returns The profile page section.
 */
export function UserProfileView({ targetUsername }: UserProfileViewProps) {
  const { session } = useSession();

  // Find user by username
  const targetUser = mockUsers.find(
    (u) => u.username.toLowerCase() === targetUsername.toLowerCase(),
  );

  if (!targetUser) {
    return (
      <div className="py-12">
        <EmptyState
          title="Usuario no encontrado"
          description={`No existe ningún usuario registrado con el nombre @${targetUsername}.`}
          action={{
            label: "Volver al feed",
            href: "/feed",
          }}
        />
      </div>
    );
  }

  const isOwnProfile = session?.user.username === targetUser.username;

  // Filter posts created by target user that are visible to current session
  const visiblePosts = session ? filterVisiblePosts(mockPosts, session) : [];
  const userPosts = visiblePosts.filter((p) => p.authorId === targetUser.id);

  const authorOption = {
    id: targetUser.id,
    username: targetUser.username,
    fullName: `${targetUser.givenName} ${targetUser.familyName}`,
  };

  const roleTone =
    targetUser.role === "admin"
      ? "warning"
      : targetUser.role === "profesor"
        ? "category"
        : "neutral";

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      {/* ── Profile Header Card ── */}
      <section
        aria-label="Información del perfil"
        className="border border-border rounded-xl bg-surface p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
      >
        <div className="flex items-center gap-5">
          <div className="size-16 sm:size-20 rounded-full bg-surface-muted border border-border flex items-center justify-center text-primary text-xl sm:text-2xl font-bold font-display shrink-0">
            {targetUser.givenName.charAt(0)}
            {targetUser.familyName.charAt(0)}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-h2 text-text">
                {targetUser.givenName} {targetUser.familyName}
              </h1>
              <Badge tone={roleTone}>{targetUser.role}</Badge>
            </div>
            <p className="text-text-muted text-sm font-medium">
              @{targetUser.username} · {targetUser.email}
            </p>
            <p className="text-text-muted text-xs">
              Miembro desde {formatDate(targetUser.createdAt)}
            </p>
          </div>
        </div>

        {isOwnProfile && (
          <Link
            href="/posts/new"
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            <PlusIcon className="size-4" />
            <span>Nueva publicación</span>
          </Link>
        )}
      </section>

      {/* ── User Publications Section ── */}
      <section aria-labelledby="user-posts-heading" className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 id="user-posts-heading" className="font-display text-h3 text-text">
            Publicaciones ({userPosts.length})
          </h2>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} author={authorOption} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin publicaciones"
            description={
              isOwnProfile
                ? "Aún no has creado ninguna publicación visible."
                : `Este usuario aún no tiene publicaciones visibles.`
            }
            action={
              isOwnProfile
                ? {
                    label: "Crear publicación",
                    href: "/posts/new",
                  }
                : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
