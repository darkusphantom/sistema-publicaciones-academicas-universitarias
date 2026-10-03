import Image from "next/image";
import { cn } from "@/lib/cn";
import { SlideData } from "@/components/landing/landing-slides-data";

export interface SlideCardProps {
  /** Slide content object */
  slide: SlideData;
  /** Whether this slide is currently active in the carousel */
  isActive: boolean;
  /** Index of this slide (0-based) */
  slideIndex: number;
  /** Total slides in the carousel */
  totalSlides: number;
  /** Optional custom container class name */
  className?: string;
}

/**
 * SlideCard Component
 *
 * Renders an individual carousel slide card formatted for both mobile single-column
 * and desktop 2-column layouts. Uses charcoal background surfaces with institutional
 * blue badges and gold accents.
 */
export function SlideCard({
  slide,
  isActive,
  slideIndex,
  totalSlides,
  className,
}: SlideCardProps) {
  return (
    <article
      role="group"
      aria-roledescription="diapositiva"
      aria-label={`Diapositiva ${slideIndex + 1} de ${totalSlides}: ${slide.title}`}
      aria-hidden={!isActive}
      className={cn(
        "w-full flex-shrink-0 transition-opacity duration-300 ease-out",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none select-none",
        className
      )}
    >
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md sm:p-8 md:p-10">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
          {/* Content Column */}
          <div className="flex flex-col items-start text-left">
            <span className="mb-3 inline-flex items-center rounded-full border border-blue-800/60 bg-blue-950/80 px-3 py-1 text-xs font-semibold tracking-wider text-blue-400">
              {slide.badge}
            </span>

            <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-slate-100 sm:text-3xl lg:text-4xl">
              {slide.title}
            </h1>

            <p className="mb-4 text-sm leading-relaxed text-slate-300 sm:text-base md:mb-6">
              {slide.subtitle}
            </p>
          </div>

          {/* Visual Asset Column */}
          <div className="relative flex min-h-[200px] w-full items-center justify-center rounded-xl bg-slate-950/60 p-4 border border-slate-800/50 sm:min-h-[260px] md:min-h-[300px]">
            <Image
              src={slide.imageSrc}
              alt={slide.imageAlt}
              width={340}
              height={340}
              priority={slideIndex === 0}
              className="h-auto max-h-[240px] w-auto max-w-full object-contain drop-shadow-md sm:max-h-[280px]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
