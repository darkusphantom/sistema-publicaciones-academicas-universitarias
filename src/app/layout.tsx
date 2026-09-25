import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
