import type { ReactNode } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

/** Action configuration for {@link EmptyState}. */
type EmptyStateAction = {
  /** Button or link label. */
  label: string;
  /** When provided, renders a `<Link>` instead of a `<button>`. */
  href?: string;
  /** Click handler for button-style actions. */
  onClick?: () => void;
};

/** Props accepted by {@link EmptyState}. */
export type EmptyStateProps = {
  /** Decorative icon (must be `aria-hidden`). */
  icon?: ReactNode;
  /** Primary message heading. */
  title: string;
  /** Supporting explanation text. */
  description?: string;
  /** Optional call-to-action: link or button. */
  action?: EmptyStateAction;
};

/**
 * Generic empty state display for lists with no results.
 *
 * Used for:
 * - "No posts yet" on first visit.
 * - "No results matching filters".
 * - Error states with a retry action.
 *
 * Will be reused by `/profile` and `/admin` screens
 * (`docs/design/wireframes_feed.md` §6.7).
 *
 * @param props - Empty state props.
 * @returns A centred card with icon, title, description and optional action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="border border-border rounded-lg bg-surface p-10 text-center flex flex-col items-center gap-3">
      {icon && (
        <span className="text-text-muted" aria-hidden="true">
          {icon}
        </span>
      )}

      <h2 className="font-display text-h3 text-text">{title}</h2>

      {description && (
        <p className="max-w-sm text-sm text-text-muted">{description}</p>
      )}

      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
