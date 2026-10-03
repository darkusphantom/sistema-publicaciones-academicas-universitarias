"use client";

import { useRouter } from "next/navigation";
import { markOnboardingAsSeen } from "@/lib/onboarding";
import { WelcomeGate } from "@/components/landing/welcome-gate";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingSlider } from "@/components/landing/landing-slider";
import { LandingFooter } from "@/components/landing/landing-footer";

/**
 * Welcome Screen of Red FaCyT (public route group `(landing)`).
 *
 * Renders the lightweight mobile-first interactive carousel/slider introducing
 * the platform features and pillars (`docs/design/welcome.md`). Recurrent visitors
 * are redirected to `/login` via {@link WelcomeGate}.
 */
export default function LandingPage() {
  const router = useRouter();

  const handleSkip = () => {
    markOnboardingAsSeen();
    router.push("/login");
  };

  const handleFinish = (target: "register" | "login") => {
    if (target === "register") {
      markOnboardingAsSeen();
      router.push("/register");
    } else {
      router.push("/login");
    }
  };

  return (
    <WelcomeGate>
      <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100">
        <LandingHeader onSkip={handleSkip} />
        <main id="contenido" className="flex flex-1 flex-col items-center justify-center py-6 sm:py-10">
          <LandingSlider onFinishOnboarding={handleFinish} />
        </main>
        <LandingFooter />
      </div>
    </WelcomeGate>
  );
}
