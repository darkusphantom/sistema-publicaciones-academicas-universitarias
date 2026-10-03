import { ReactNode } from "react";

/**
 * Layout specifically for the landing page route group.
 * As per design specs, this layout is completely independent from the main app layout.
 * It does not include the AppNavbar, AppSidebar, or BottomNav.
 * 
 * @param props - Component props.
 * @param props.children - The page content.
 * @returns The layout for the landing page.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      {children}
    </div>
  );
}
