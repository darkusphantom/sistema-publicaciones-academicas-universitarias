import { OnboardingLink } from "@/components/landing/onboarding-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowRightIcon } from "@/components/ui/icons";

/** Destination of the skip control of the introduction. */
const SKIP_HREF = "/login";

/**
 * Minimal public navigation of the landing screen (parallax layer 0).
 *
 * The authenticated `Navbar` and `BottomNav` are not used here
 * (`docs/design/welcome.md` §8): the brand, the theme toggle and the skip
 * control are enough for a public screen that is only shown on the first visit.
 *
 * The skip control is rendered by the page, not by this component, so it can be
 * wrapped in the onboarding guard. This component is a Server Component.
 *
 * @returns The top bar element.
 */
export function LandingTopBar() {
  return (
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
      <span className="font-display text-h2 text-primary">FaCyT</span>
      <div className="flex items-center gap-2">
        <OnboardingLink href={SKIP_HREF} variant="ghost" size="sm">
          Omitir introducción
          <ArrowRightIcon />
        </OnboardingLink>
        <ThemeToggle />
      </div>
    </div>
  );
}
