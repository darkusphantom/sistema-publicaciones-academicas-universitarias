import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingTopBar } from "@/components/landing/landing-top-bar";
import { OnboardingLink } from "@/components/landing/onboarding-link";
import { WelcomeGate } from "@/components/landing/welcome-gate";
import { ParallaxPlane } from "@/components/shared/parallax-plane";
import { ParallaxSection } from "@/components/shared/parallax-section";
import { buttonStyles } from "@/components/ui/button";

/**
 * Editorial blocks of the "qué ofrece" section, with the final copy of
 * `docs/design/welcome.md` §5.
 */
const OFFERINGS = [
  {
    id: "noticias",
    number: "01",
    title: "Noticias y avisos",
    description: "Comunicados oficiales y agenda en un solo lugar.",
  },
  {
    id: "academico",
    number: "02",
    title: "Académico",
    description: "Cursos, talleres y defensas, organizados.",
  },
  {
    id: "vida",
    number: "03",
    title: "Vida universitaria",
    description: "Eventos y actividades para toda la comunidad.",
  },
] as const;

const SECTION_CONTENT_CLASS = "mx-auto w-full max-w-7xl px-6 sm:px-8";

/**
 * Welcome screen of Red FaCyT (public route group `(landing)`).
 *
 * Editorial introduction shown to first-time visitors: masthead, what the
 * platform offers, the audience it serves and the single call to action that
 * closes the narrative (`docs/design/welcome.md`). Recurrent visitors are
 * redirected to the login screen by {@link WelcomeGate}, the only client
 * component that owns the onboarding decision; the rest of the screen is a
 * Server Component tree with CSS-only parallax.
 *
 * @returns The welcome screen.
 */
export default function LandingPage() {
  return (
    <WelcomeGate>
      <div className="flex min-h-dvh flex-col bg-bg text-text">
        <header>
          <LandingTopBar />
          <LandingHero />
        </header>

        <main id="contenido" className="flex-1">
          <ParallaxSection
            label="Qué ofrece"
            className="py-20 md:py-28"
            contentClassName={SECTION_CONTENT_CLASS}
            layerClassName="mx-auto max-w-7xl grid-cols-1 grid-rows-3 gap-10 px-6 sm:px-8 md:grid-cols-3 md:grid-rows-1 md:gap-8"
            planes={OFFERINGS.map((offering) => ({
              id: `numero-${offering.id}`,
              speed: 8,
              className:
                "flex items-start justify-start font-display text-display text-primary opacity-15",
              children: offering.number,
            }))}
          >
            <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
              {OFFERINGS.map((offering) => (
                <li key={offering.id} className="border-t border-border pt-6">
                  <h2 className="font-display text-h2 text-text">
                    {offering.title}
                  </h2>
                  <p className="mt-3 text-base text-text-muted">
                    {offering.description}
                  </p>
                </li>
              ))}
            </ul>
          </ParallaxSection>

          <ParallaxSection
            label="Roles"
            className="py-20 md:py-28"
            contentClassName={SECTION_CONTENT_CLASS}
          >
            <ParallaxPlane
              motion="stretch"
              stretchFrom={0.35}
              className="mb-10 h-px w-full bg-border"
            />
            <p className="max-w-2xl font-display text-h2 text-text">
              Para profesores, estudiantes y administración.
            </p>
            <p className="mt-4 text-base text-text-muted">
              Estudiante · Profesor · Admin
            </p>
          </ParallaxSection>

          <ParallaxSection
            label="Cierre"
            className="py-24 md:py-32"
            contentClassName={SECTION_CONTENT_CLASS}
            layerClassName="place-items-center"
            planes={[
              {
                id: "marca-agua",
                speed: 15,
                className:
                  "font-display text-[3rem] text-primary opacity-10 md:text-[5rem]",
                children: "Red FaCyT",
              },
            ]}
          >
            <div className="flex flex-wrap items-center gap-4">
              <OnboardingLink href="/register" size="lg">
                Empezar
              </OnboardingLink>
              <Link
                href="/login"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </ParallaxSection>
        </main>

        <Footer />
      </div>
    </WelcomeGate>
  );
}
