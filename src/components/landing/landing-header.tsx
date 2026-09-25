"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/cn";

export interface LandingHeaderProps {
  /** Callback to skip onboarding and navigate directly to login */
  onSkip?: () => void;
  /** Optional custom container class name */
  className?: string;
}

/**
 * LandingHeader Component
 *
 * Lightweight public header for the landing page. Features FaCyT branding,
 * theme toggle, and a quick skip button to bypass onboarding.
 */
export function LandingHeader({ onSkip, className }: LandingHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6 md:px-8",
        className
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Brand Logo & Masthead */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-serif text-lg font-bold text-white shadow-md shadow-blue-600/30">
            F
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif text-base font-bold leading-none tracking-tight text-slate-100">
              Red FaCyT
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Gaceta Digital
            </span>
          </div>
        </Link>

        {/* Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="text-slate-300 hover:bg-slate-800 hover:text-slate-100" />

          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Omitir
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
