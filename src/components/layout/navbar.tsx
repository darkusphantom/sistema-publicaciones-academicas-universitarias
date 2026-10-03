"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { buttonStyles } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserIcon, PlusIcon } from "@/components/ui/icons";
import { useSession } from "@/lib/session/session-provider";
import { useState, useEffect, useRef } from "react";

/** Navigation link configuration. */
type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/feed", label: "Publicaciones" },
  { href: "/profile", label: "Perfil" },
  { href: "/admin", label: "Administración", adminOnly: true },
];

/**
 * Main authenticated navigation bar.
 *
 * Design spec (`docs/design/wireframes_feed.md` §2.2):
 * - Sticky, not fixed — no scroll offset compensation needed.
 * - Three zones: brand (left), section links (centre, ≥768px only), actions (right).
 * - The amber `--accent` appears only on the "Nueva publicación" CTA button.
 * - Nav links are NOT shown on mobile; BottomNav handles mobile navigation.
 * - The account button opens a dropdown menu with `aria-expanded` + `aria-haspopup`.
 *   The menu closes on `Escape` and on click outside.
 *
 * @returns The sticky navigation bar.
 */
export function Navbar() {
  const pathname = usePathname();
  const { session, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isAdmin = session?.user.role === "admin";
  const username = session?.user.username ?? "";

  // Close on click outside
  useEffect(() => {
    if (!menuOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border">
      <nav
        aria-label="Secciones"
        className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* ── Brand ── */}
        <Link
          href="/feed"
          className="font-display text-h3 text-primary hover:opacity-80 transition-opacity"
        >
          Red FaCyT
        </Link>

        {/* ── Section links (desktop only) ── */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label, adminOnly }) => {
            if (adminOnly && !isAdmin) return null;
            const isActive =
              href === "/profile"
                ? pathname.startsWith("/profile")
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={
                    href === "/profile" ? `/profile/${username}` : href
                  }
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-[15px] transition-colors",
                    isActive
                      ? "text-accent-teal font-medium"
                      : "text-text hover:text-accent-teal",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          <Link
            href="/posts/new"
            id="navbar-new-post"
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Nueva publicación</span>
          </Link>

          <ThemeToggle />

          {/* Account button with dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              id="navbar-account-button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={`Cuenta de @${username}`}
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-text transition-colors hover:bg-surface-muted"
            >
              <UserIcon className="size-5" />
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Opciones de cuenta"
                className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-surface shadow-md z-40"
              >
                <p className="px-4 py-2 text-xs text-text-muted border-b border-border">
                  @{username}
                </p>
                <button
                  role="menuitem"
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-text hover:bg-surface-muted transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
