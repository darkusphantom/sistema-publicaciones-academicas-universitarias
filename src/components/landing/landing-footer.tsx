import { cn } from "@/lib/cn";

export interface LandingFooterProps {
  /** Optional custom container class name */
  className?: string;
}

/**
 * LandingFooter Component
 *
 * Lightweight public footer for the landing page introducing the institutional copyright.
 */
export function LandingFooter({ className }: LandingFooterProps) {
  return (
    <footer
      className={cn(
        "w-full border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-400 px-4",
        className
      )}
    >
      <div className="mx-auto max-w-5xl flex flex-col items-center justify-center gap-2">
        <p className="font-medium text-slate-300">
          © {new Date().getFullYear()} Facultad Experimental de Ciencias y Tecnología (FaCyT)
        </p>
        <p className="text-slate-400">
          Plataforma Institucional y Gaceta Digital de Publicaciones Académicas
        </p>
      </div>
    </footer>
  );
}
