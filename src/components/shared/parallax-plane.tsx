import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Motion applied to a decorative plane while the section crosses the viewport.
 *
 * - `drift` moves the plane vertically (background depth).
 * - `stretch` scales the plane horizontally (rules that separate/stretch).
 */
export type ParallaxMotion = "drift" | "stretch";

/** Props of {@link ParallaxPlane}. */
export type ParallaxPlaneProps = {
  /**
   * Vertical drift of the plane, as a percentage of its own height. The design
   * spec caps the relative movement between planes at 15–18%
   * (`docs/design/welcome.md` §3), which the call sites honour.
   */
  speed?: number;
  /** Initial horizontal scale used by the `stretch` motion. */
  stretchFrom?: number;
  /** Motion to apply; defaults to `drift`. */
  motion?: ParallaxMotion;
  /**
   * Marks the plane as decorative. Decorative planes are `aria-hidden` and
   * never capture pointer events, so they cannot be read nor block the content
   * (`docs/design/welcome.md` §7).
   */
  decorative?: boolean;
  /** Class names that position and style the plane inside its section. */
  className?: string;
  /** Decorative content. */
  children?: ReactNode;
};

type PlaneStyle = CSSProperties & {
  "--parallax-speed"?: string;
  "--parallax-stretch-from"?: string;
};

/**
 * Decorative plane of the editorial parallax narrative.
 *
 * The motion is pure CSS scroll-driven animation (`animation-timeline: view()`):
 * no scroll listener, no JavaScript, no layout thrash. Browsers without
 * scroll-driven animation support, and users who ask for reduced motion, simply
 * keep the static composition defined by `docs/design/welcome.md` §3.
 *
 * This is a Server Component: it renders no interactivity and ships no JS.
 *
 * @param props - Plane props.
 * @returns The plane wrapper element.
 */
export function ParallaxPlane({
  speed = 0,
  stretchFrom = 0.6,
  motion = "drift",
  decorative = true,
  className,
  children,
}: ParallaxPlaneProps) {
  const style: PlaneStyle = {
    "--parallax-speed": `${speed}%`,
    "--parallax-stretch-from": String(stretchFrom),
  };

  return (
    <div
      data-parallax-motion={motion}
      style={style}
      aria-hidden={decorative ? true : undefined}
      className={cn("pointer-events-none select-none", className)}
    >
      {children}
    </div>
  );
}
