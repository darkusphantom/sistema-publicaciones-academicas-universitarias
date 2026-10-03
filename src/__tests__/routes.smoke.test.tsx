import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import LandingPage from "@/app/(landing)/page";
import RootLayout from "@/app/layout";
import FeedPage from "@/app/(main)/feed/page";
import ProfilePage from "@/app/(main)/profile/[username]/page";

/**
 * The welcome screen redirects recurrent visitors with the App Router client
 * navigation, which is not available outside the router runtime.
 */
const { replace, push } = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  usePathname: () => "/feed",
}));

vi.mock("@/lib/session/session-provider", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({
    status: "authenticated",
    session: { user: { id: "u-3", username: "m.rivas", role: "estudiante" }, expiresAt: "2099-01-01T00:00:00Z" },
    signOut: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

/**
 * `next/font` is resolved by the Next.js compiler, which does not run under
 * Vitest: the stub below keeps the root layout importable.
 */
vi.mock("next/font/google", () => ({
  Source_Serif_4: () => ({ variable: "--font-facyt-serif", className: "" }),
}));

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

/**
 * Smoke tests that render every route of the scaffold.
 * These guarantee the App Router mounts without errors.
 */
describe("route smoke tests", () => {
  it("renders the root layout with its children", () => {
    render(
      <RootLayout params={Promise.resolve({})}>
        <p>layout child</p>
      </RootLayout>,
    );

    expect(screen.getByText("layout child")).toBeInTheDocument();
  });

  it("renders the landing page", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Red FaCyT/i }),
    ).toBeInTheDocument();
  });

  it("renders the login page", async () => {
    render(<LoginPage />);

    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("renders the register page", async () => {
    render(<RegisterPage />);

    expect(
      await screen.findByRole("heading", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
  });

  it("renders the feed page", async () => {
    render(await FeedPage({ searchParams: Promise.resolve({}) }));

    expect(await screen.findByRole("heading", { name: "Publicaciones" })).toBeInTheDocument();
  });

  it("renders the profile page", () => {
    render(<ProfilePage />);

    expect(
      screen.getByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
  });
});
