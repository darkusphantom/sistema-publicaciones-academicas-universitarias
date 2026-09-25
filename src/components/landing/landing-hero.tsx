import Link from "next/link";
import { ParallaxPlane } from "@/components/shared/parallax-plane";
import { ParallaxSection } from "@/components/shared/parallax-section";
import { buttonStyles } from "@/components/ui/button";

/** Id of the masthead heading, used to name the hero region. */
export const MASTHEAD_TITLE_ID = "masthead-title";

/**
 * Masthead of the welcome screen (parallax layer 1 of `docs/design/welcome.md` §3).
 *
 * Renders the final copy of the spec: the institutional `h1`, the faculty name,
 * the editorial intro and the two neutral entry points to the public routes. The
 * accent blue is deliberately absent: it belongs to the single primary CTA of
 * the closing section (`docs/design/components.md` §5).
 *
 * Server Component: it ships no JavaScript; the only interactive descendants are
 * client components already mounted by the page.
 *
 * @returns The masthead region.
 */
export function LandingHero() {
  return (
    <ParallaxSection
      labelledBy={MASTHEAD_TITLE_ID}
      className="overflow-hidden"
      layerClassName="place-items-start justify-items-end px-6 pt-6 sm:px-8"
      planes={[
        {
          id: "vineta",
          speed: 18,
          className: "font-display text-2xl text-primary opacity-20",
          children: "FaCyT · Est.",
        },
      ]}
      contentClassName="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 sm:px-8 md:pb-24 md:pt-20"
    >
      <h1
        id={MASTHEAD_TITLE_ID}
        className="font-display text-display text-primary"
      >
        FaCyT
      </h1>
      <p className="mt-3 max-w-2xl text-h3 text-text">
        Facultad Experimental de Ciencias y Tecnología
      </p>
      <ParallaxPlane
        motion="stretch"
        stretchFrom={0.65}
        className="mt-8 h-px w-full bg-border"
      />
      <p className="mt-8 max-w-2xl text-lg text-text-muted">
        La gaceta digital de la facultad: noticias, avisos y vida universitaria.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/login"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          Registrar
        </Link>
      </div>
    </ParallaxSection>
  );
}
