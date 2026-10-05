"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { HomeIcon, PlusIcon, UserIcon, ShieldIcon } from "@/components/ui/icons";
import { useSession } from "@/lib/session/session-provider";
import type { ReactNode } from "react";

/** Single navigation destination configuration. */
type NavDestination = {
  href: string | ((username: string) => string);
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
  matchPrefix?: string;
};

/**
 * Fixed bottom navigation bar shown on mobile (`< 768px`).
 *
 * Design spec (`docs/design/wireframes_feed.md` §2.3):
 * - `md:hidden` — disappears on desktop; the Navbar handles desktop nav.
 * - Four destinations: Feed, Crear, Perfil, Administración (admin only).
 * - With a non-admin user only three destinations are shown; Perfil keeps its
 *   position in the layout.
 * - The active destination uses `--accent-teal` and `aria-current="page"`.
 *   The inactive icon has no fill; the active icon gains `fill-current`.
 * - `pb-[env(safe-area-inset-bottom)]` prevents the bar from overlapping the
 *   home indicator on iOS.
 * - `min-h-14` (56px) ensures reachable touch targets.
 *
 * @returns The fixed bottom navigation bar, hidden on ≥768px.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { session } = useSession();

  const isAdmin = session?.user.role === "admin";
  const username = session?.user.username ?? "";

  const destinations: NavDestination[] = [
    {
      href: "/feed",
      label: "Feed",
      icon: <HomeIcon className="size-6" />,
      matchPrefix: "/feed",
    },
    {
      href: "/posts/new",
      label: "Crear",
      icon: <PlusIcon className="size-6" />,
      matchPrefix: "/posts/new",
    },
    {
      href: (u) => `/profile/${u}`,
      label: "Perfil",
      icon: <UserIcon className="size-6" />,
      matchPrefix: "/profile",
    },
    {
      href: "/admin",
      label: "Admin",
      icon: <ShieldIcon className="size-6" />,
      matchPrefix: "/admin",
      adminOnly: true,
    },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex list-none m-0 p-0">
        {destinations.map(({ href, label, icon, adminOnly, matchPrefix }) => {
          if (adminOnly && !isAdmin) return null;

          const resolvedHref =
            typeof href === "function" ? href(username) : href;
          const isActive = matchPrefix
            ? pathname.startsWith(matchPrefix)
            : pathname === resolvedHref;

          return (
            <li key={resolvedHref} className="flex-1">
              <Link
                href={resolvedHref}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-accent-teal" : "text-text-muted",
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive && "[&_svg]:fill-current",
                  )}
                >
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
