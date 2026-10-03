"use client";

import { cn } from "@/lib/cn";

export interface SlideIndicatorsProps {
  /** Total number of slides in the carousel */
  totalSlides: number;
  /** Index of the currently active slide (0-based) */
  currentSlide: number;
  /** Callback fired when a slide indicator button is clicked */
  onSelectSlide: (index: number) => void;
  /** Optional custom container class name */
  className?: string;
}

/**
 * SlideIndicators Component
 *
 * Renders interactive indicator pills for the landing carousel.
 * Each button provides a minimum 44x44px touch hit area for mobile accessibility
 * (WCAG 2.2 AA) while visually rendering compact indicator pills.
 */
export function SlideIndicators({
  totalSlides,
  currentSlide,
  onSelectSlide,
  className,
}: SlideIndicatorsProps) {
  return (
    <div
      role="group"
      aria-label="Controles de diapositivas"
      className={cn("flex items-center justify-center gap-1 py-2", className)}
    >
      {Array.from({ length: totalSlides }).map((_, index) => {
        const isActive = index === currentSlide;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectSlide(index)}
            aria-label={`Ir a diapositiva ${index + 1}`}
            aria-current={isActive ? "true" : "false"}
            className="group relative flex h-11 w-11 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-full transition-all"
          >
            <span
              className={cn(
                "h-2.5 rounded-full transition-all duration-300 ease-out",
                isActive
                  ? "w-8 bg-amber-500 shadow-sm shadow-amber-500/50"
                  : "w-2.5 bg-slate-600 group-hover:bg-slate-400 opacity-60"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
