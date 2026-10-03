import { cn } from "@/lib/cn";

/**
 * Visual variants defined by the design system (`docs/design/components.md` §3.1).
 *
 * - `primary` is the **only** accent-blue surface of a screen: exactly one per
 *   view (`docs/design/components.md` §5).
 * - `secondary` is a neutral bordered surface.
 * - `ghost` is a borderless text action.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Available sizes; every size keeps a ≥ 44px touch target (WCAG 2.5.8). */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Classes shared by every interactive surface: layout, focus-safe radius,
 * minimum touch target and disabled affordance.
 */
export const BUTTON_BASE_CLASSES = [
  "inline-flex items-center justify-center gap-2 rounded-md text-center font-medium",
  "min-h-11",
  "transition-colors",
  "disabled:cursor-not-allowed disabled:opacity-60",
] as const;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent/90",
  secondary:
    "border border-border bg-surface text-text hover:bg-surface-muted",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 text-sm",
  md: "px-5 text-base",
  lg: "px-6 text-lg",
};

/** Options accepted by {@link buttonStyles}. */
export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Extra class names, appended last so they can override the defaults. */
  className?: string;
};

/**
 * Builds the class list of an interactive surface (anchor or button).
 *
 * The landing screen uses real anchors for navigation (the design spec forbids
 * buttons that do not navigate), so the design-system styles are exposed as a
 * pure function instead of a component.
 *
 * @param options - Variant, size and extra class names.
 * @returns The joined Tailwind class list.
 * @complexity O(1) — a constant number of class lookups.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    ...BUTTON_BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}
