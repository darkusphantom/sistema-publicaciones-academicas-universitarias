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
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
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

  it("renders the login page", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("renders the register page", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: "Register" }),
    ).toBeInTheDocument();
  });

  it("renders the feed page", () => {
    render(<FeedPage />);

    expect(screen.getByRole("heading", { name: "Feed" })).toBeInTheDocument();
  });

  it("renders the profile page", () => {
    render(<ProfilePage />);

    expect(
      screen.getByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
  });
});
