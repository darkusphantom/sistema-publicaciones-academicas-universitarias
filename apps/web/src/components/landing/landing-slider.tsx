"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";
import { LANDING_SLIDES, SlideData } from "./landing-slides-data";
import { SlideCard } from "./slide-card";
import { SlideIndicators } from "./slide-indicators";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

export interface LandingSliderProps {
  /** Optional array of slides. Defaults to LANDING_SLIDES */
  slides?: SlideData[];
  /** Callback fired when onboarding is completed (e.g. clicking Empezar or Login) */
  onFinishOnboarding?: (target: "register" | "login") => void;
  /** Optional custom container class name */
  className?: string;
}

/**
 * LandingSlider Component
 *
 * Interactive, mobile-first carousel component for the landing welcome view.
 * Supports touch swipes, keyboard arrow keys, screen-reader live regions,
 * and high-contrast charcoal/gold visual theme.
 */
export function LandingSlider({
  slides = LANDING_SLIDES,
  onFinishOnboarding,
  className,
}: LandingSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;
  const isFirstSlide = currentSlide === 0;

  const nextSlide = useCallback(() => {
    if (isLastSlide) {
      onFinishOnboarding?.("register");
    } else {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  }, [isLastSlide, onFinishOnboarding, totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Touch swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Ensure swipe was primarily horizontal (deltaX > deltaY)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <section
      role="region"
      aria-roledescription="carrusel"
      aria-label="Presentación de características de Red FaCyT"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative flex w-full flex-col items-center justify-between px-4 py-6 sm:px-6 md:px-8",
        className
      )}
    >
      {/* Screen Reader Live Region for Slide Change Notifications */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Diapositiva {currentSlide + 1} de {totalSlides}: {slides[currentSlide].title}
      </div>

      {/* Main Slide Display & Desktop Navigation Arrows */}
      <div className="relative w-full max-w-4xl">
        {/* Desktop Prev Arrow */}
        <button
          type="button"
          onClick={prevSlide}
          disabled={isFirstSlide}
          aria-label="Diapositiva anterior"
          className={cn(
            "absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-200 shadow-lg transition-all hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-40 md:flex",
            isFirstSlide && "pointer-events-none"
          )}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        {/* Desktop Next Arrow */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label={isLastSlide ? "Ir al registro" : "Siguiente diapositiva"}
          className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-200 shadow-lg transition-all hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 md:flex"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>

        {/* Slide Content */}
        <SlideCard
          slide={slides[currentSlide]}
          isActive={true}
          slideIndex={currentSlide}
          totalSlides={totalSlides}
        />
      </div>

      {/* Indicators and Action Controls */}
      <div className="mt-6 flex w-full max-w-md flex-col items-center gap-4">
        {/* Carousel Slide Indicators */}
        <SlideIndicators
          totalSlides={totalSlides}
          currentSlide={currentSlide}
          onSelectSlide={(index) => setCurrentSlide(index)}
        />

        {/* Action Buttons Stack */}
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={nextSlide}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-500 px-6 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
          >
            {isLastSlide ? "Empezar ahora" : "Siguiente ➔"}
          </button>

          <button
            type="button"
            onClick={() => onFinishOnboarding?.("login")}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 px-6 font-semibold text-slate-200 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </section>
  );
}
