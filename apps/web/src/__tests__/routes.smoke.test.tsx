import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import LandingPage from "@/app/(landing)/page";
import FeedPage from "@/app/(main)/feed/page";
import PostDetailPage from "@/app/(main)/posts/[id]/page";
import NewPostPage from "@/app/(main)/posts/new/page";
import EditPostPage from "@/app/(main)/posts/[id]/edit/page";
import DeletePostPage from "@/app/(main)/posts/[id]/delete/page";
import ProfilePage from "@/app/(main)/profile/[username]/page";
import AdminPage from "@/app/(main)/admin/page";

const { replace, push, back } = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push, back }),
  usePathname: () => "/feed",
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/lib/session/session-provider", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({
    status: "authenticated",
    session: { user: { id: "u-1", username: "admin", role: "admin" }, expiresAt: "2099-01-01T00:00:00Z" },
    signOut: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/font/google", () => ({
  Source_Serif_4: () => ({ variable: "--font-facyt-serif", className: "" }),
}));

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

/**
 * Smoke tests that render every route of the scaffold.
 * Guarantee that all App Router pages mount without errors.
 */
describe("route smoke tests", () => {
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

  it("renders the post detail page", async () => {
    render(await PostDetailPage({ params: Promise.resolve({ id: "post-1" }) }));
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the new post page", () => {
    render(<NewPostPage />);
    expect(screen.getByRole("heading", { name: "Crear publicación" })).toBeInTheDocument();
  });

  it("renders the edit post page", async () => {
    render(await EditPostPage({ params: Promise.resolve({ id: "post-1" }) }));
    expect(screen.getByRole("heading", { name: "Editar publicación" })).toBeInTheDocument();
  });

  it("renders the delete post page", async () => {
    render(await DeletePostPage({ params: Promise.resolve({ id: "post-1" }) }));
    expect(screen.getByRole("heading", { name: /¿Eliminar esta publicación\?/i })).toBeInTheDocument();
  });

  it("renders the profile page", async () => {
    render(await ProfilePage({ params: Promise.resolve({ username: "m.rivas" }) }));
    expect(
      await screen.findByRole("heading", { name: /Publicaciones/i }),
    ).toBeInTheDocument();
  });

  it("renders the admin page", () => {
    render(<AdminPage />);
    expect(
      screen.getByRole("heading", { name: "Panel de Administración" }),
    ).toBeInTheDocument();
  });
});
