import type { Metadata } from "next";
import { FeedView } from "@/components/feed/feed-view";
import { StaticUserRepository } from "@/lib/repositories/post-repository.static";
import { fromSearchParams } from "@/lib/filters";

/** Metadata for the feed page. */
export const metadata: Metadata = {
  title: "Publicaciones | Red FaCyT",
  description:
    "Novedades, avisos y convocatorias de la Facultad Experimental de Ciencias y Tecnología.",
};

/** Props injected by Next.js App Router for page components. */
type FeedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const userRepo = new StaticUserRepository();

/**
 * Feed page — `/feed`.
 *
 * Server Component responsibility (`docs/design/wireframes_feed.md` §6.6):
 * - Parses `searchParams` into `PostFilters` via `fromSearchParams`.
 * - Pre-loads the author list for the filter dropdown (avoids a waterfall).
 * - Passes both to `FeedView` with a `key` prop so that a filter change
 *   triggers a full remount, which resets `visibleCount` to `POSTS_PAGE_SIZE`
 *   without a `useEffect`.
 *
 * The `SessionProvider` in the `(main)` layout gates access: anonymous
 * visitors are redirected to `/login` before this component renders.
 *
 * @param props - Next.js page props.
 * @returns The feed page.
 */
export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const filters = fromSearchParams(params);
  const authors = await userRepo.listAuthors();

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-h1 text-text">Publicaciones</h1>
        <p className="mt-1 text-sm text-text-muted">
          Novedades, avisos y convocatorias de la facultad.
        </p>
      </div>

      {/* Feed orchestrator — remounts on filter changes to reset pagination */}
      <FeedView
        key={JSON.stringify(filters)}
        filters={filters}
        authors={authors}
      />
    </div>
  );
}