"use client";

import { buttonStyles } from "@/components/ui/button";

/** Props accepted by {@link LoadMore}. */
export type LoadMoreProps = {
  /** Number of posts currently shown in the grid. */
  shown: number;
  /** Total number of posts matching the current filters. */
  total: number;
  /** Number of additional posts loaded per click. */
  pageSize: number;
  /** Called when the user clicks the button. */
  onLoadMore: () => void;
};

/**
 * "Cargar más" button for the feed pagination.
 *
 * Design spec (`docs/design/wireframes_feed.md` §6.5):
 * - Only renders when `shown < total`.
 * - Copy: `Cargar más` (all loaded) or `Cargar más (6)` (remaining count).
 * - Not a numbered pagination component — the design discards that pattern
 *   in favour of the growing-limit strategy (§10.4).
 *
 * @param props - LoadMore props.
 * @returns The load-more button, or `null` when all posts are visible.
 */
export function LoadMore({ shown, total, pageSize, onLoadMore }: LoadMoreProps) {
  if (shown >= total) return null;

  const remaining = total - shown;
  const nextBatch = Math.min(pageSize, remaining);

  return (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        id="feed-load-more"
        onClick={onLoadMore}
        className={buttonStyles({ variant: "secondary" })}
      >
        Cargar más ({nextBatch})
      </button>
    </div>
  );
}
