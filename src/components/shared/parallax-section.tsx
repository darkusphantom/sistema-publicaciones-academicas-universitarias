import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ParallaxPlane, type ParallaxPlaneProps } from "./parallax-plane";

/** Background plane of a {@link ParallaxSection}, identified by a stable key. */
export type ParallaxSectionPlane = ParallaxPlaneProps & {
  /** Stable key of the plane. */
  id: string;
};

/** Props of {@link ParallaxSection}. */
export type ParallaxSectionProps = {
  /** Optional id of the section. */
  id?: string;
  /** Accessible name of the region, in Spanish. */
  label?: string;
  /** Id of the heading that names the region. */
  labelledBy?: string;
  /** Class names of the section. */
  className?: string;
  /** Class names of the content wrapper, in front of the planes. */
  contentClassName?: string;
  /** Class names of the background layer that holds the planes. */
  layerClassName?: string;
  /** Full-bleed decorative planes rendered behind the content. */
  planes?: readonly ParallaxSectionPlane[];
  /** Readable content. */
  children: ReactNode;
};

/**
 * Section wrapper of the editorial parallax narrative ("hojas de una gaceta").
 *
 * The component itself is layout-only: it creates the stacking context that
 * keeps the decorative layer behind the content, renders that layer and lets
 * every plane drift with CSS. It is a Server Component and ships no JavaScript.
 *
 * @param props - Section props.
 * @returns The section element.
 */
export function ParallaxSection({
  id,
  label,
  labelledBy,
  className,
  contentClassName,
  layerClassName,
  planes = [],
  children,
}: ParallaxSectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      aria-labelledby={labelledBy}
      data-parallax-section=""
      className={cn("relative isolate", className)}
    >
      {planes.length > 0 && (
        <div
          data-parallax-layer=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 grid overflow-hidden",
            layerClassName,
          )}
        >
          {planes.map(({ id: planeId, ...plane }) => (
            <ParallaxPlane key={planeId} {...plane} />
          ))}
        </div>
      )}
      <div data-parallax-content="" className={cn("relative", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
