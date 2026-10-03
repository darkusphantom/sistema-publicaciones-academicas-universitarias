import { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Footer } from "@/components/layout/footer";

/**
 * Layout for the authentication pages (/login, /register).
 * Provides a centered card container, a header with a theme toggle, 
 * and a footer. It isolates the auth UI from the main application shell.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <header className="flex items-center justify-between px-6 py-4 sm:px-8">
        <div className="font-display text-h3 text-primary">FaCyT</div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
