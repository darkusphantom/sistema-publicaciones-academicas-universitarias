/**
 * Inline SVG icon set.
 *
 * The design system forbids emoji as iconography (`docs/design/components.md`
 * §5), and `lucide-react` / `shadcn/ui` are still pending installation, so the
 * few icons the welcome screen needs are kept here as dependency-free SVG.
 * Every icon is decorative: it inherits `currentColor` and is always hidden from
 * assistive technology, because the surrounding control carries the label.
 */

/** Props shared by every icon of the set. */
export type IconProps = {
  /** Class names applied to the `<svg>` element (size, visibility, spacing). */
  className?: string;
};

const ICON_BASE_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/**
 * Sun icon: the affordance that switches to the dark theme.
 *
 * @param props - Icon props.
 * @returns The SVG element.
 */
export function SunIcon({ className }: IconProps) {
  return (
    <svg {...ICON_BASE_PROPS} width={20} height={20} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

/**
 * Moon icon: the affordance that switches back to the light theme.
 *
 * @param props - Icon props.
 * @returns The SVG element.
 */
export function MoonIcon({ className }: IconProps) {
  return (
    <svg {...ICON_BASE_PROPS} width={20} height={20} className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

/**
 * Right arrow icon: marks the skip action as a forward navigation.
 *
 * @param props - Icon props.
 * @returns The SVG element.
 */
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...ICON_BASE_PROPS} width={16} height={16} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
