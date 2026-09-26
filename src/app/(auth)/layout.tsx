import { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Footer } from "@/components/layout/footer";
import { buttonStyles } from "@/components/ui/button";

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
          
          <div className="mt-6 flex justify-center">
            <Link 
              href="/" 
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Volver a la bienvenida
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
