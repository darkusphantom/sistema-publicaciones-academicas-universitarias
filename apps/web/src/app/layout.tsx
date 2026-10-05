import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "./globals.css";

/**
 * Editorial serif used by the display headings of the design system
 * (`docs/design/brief.md` §4). `next/font` self-hosts the file, so there is no
 * render-blocking request to a third party and no layout shift.
 */
const facytSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-facyt-serif",
  display: "swap",
});

/**
 * Global metadata for the Red FaCyT application.
 */
export const metadata: Metadata = {
  title: {
    default: "Red FaCyT",
    template: "%s | Red FaCyT",
  },
  description:
    "Academic publishing platform for the Faculty of Experimental Sciences and Technology (FaCyT).",
};

/**
 * Root layout that wraps every route of the application.
 *
 * @param props - Component props.
 * @param props.children - The page content rendered inside the layout.
 * @returns The root HTML document with the application shell.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={facytSerif.variable} suppressHydrationWarning>
      <head>
        {/* Applies the stored (or system) theme before the first paint so dark
            mode never flashes white (`docs/design/accessibility.md` §5). */}
        <script
          id="facyt-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
