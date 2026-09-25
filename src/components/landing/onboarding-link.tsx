"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { markOnboardingAsSeen } from "@/lib/onboarding";

/** Props of {@link OnboardingLink}. */
export type OnboardingLinkProps = {
  /** Destination of the navigation (an existing route). */
  href: string;
  /** Visual variant; defaults to the single primary CTA. */
  variant?: ButtonVariant;
  /** Size of the control. */
  size?: ButtonSize;
  /** Extra class names, appended last. */
  className?: string;
  /** Visible label. */
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

/**
 * Anchor that records the welcome introduction as seen and then navigates.
 *
 * Used by the two actions that end the introduction — the primary CTA
 * ("Empezar" → `/register`) and the skip control ("Omitir introducción" →
 * `/login`) — per `docs/design/welcome.md` §2. The link is a real anchor, so the
 * route is reachable with the keyboard and without JavaScript; the flag write
 * happens in the click handler, before the browser follows the href.
 *
 * @param props - Link props.
 * @returns The anchor element.
 */
export function OnboardingLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: OnboardingLinkProps) {
  return (
    <Link
      href={href}
      className={buttonStyles({ variant, size, className })}
      {...rest}
      onClick={() => {
        markOnboardingAsSeen();
      }}
    >
      {children}
    </Link>
  );
}
