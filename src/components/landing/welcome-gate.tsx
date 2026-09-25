"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasSeenOnboarding } from "@/lib/onboarding";

/** Destination of visitors whose introduction has already been seen. */
export const ONBOARDING_REDIRECT_PATH = "/login";

/** Props of {@link WelcomeGate}. */
export type WelcomeGateProps = {
  /** Introduction to render while the visitor is new to the platform. */
  children: ReactNode;
};

/**
 * Guards the welcome introduction: first-time visitors read it, recurrent ones
 * are sent to the login screen.
 *
 * The decision depends on `localStorage`, so it can only be taken on the client:
 * the server has no access to it and therefore always renders the introduction
 * (good for indexing and for the first paint). This client component is the only
 * place with `'use client'` on the screen that owns the guard, so the rest of the
 * page stays a Server Component tree.
 *
 * The redirect runs in an effect, right after hydration: the introduction is
 * still mounted, so no layout shift or flash of an empty page is produced.
 *
 * @param props - Gate props.
 * @returns The introduction, unchanged.
 */
export function WelcomeGate({ children }: WelcomeGateProps) {
  const router = useRouter();

  useEffect(() => {
    if (hasSeenOnboarding()) {
      router.replace(ONBOARDING_REDIRECT_PATH);
    }
  }, [router]);

  return <>{children}</>;
}
