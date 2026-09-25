import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import LandingPage from "@/app/(landing)/page";
import RootLayout from "@/app/layout";
import FeedPage from "@/app/(main)/feed/page";
import ProfilePage from "@/app/(main)/profile/[username]/page";

/**
 * Smoke tests that render every route placeholder of the scaffold.
 * These guarantee the App Router skeleton mounts without errors.
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
      screen.getByRole("heading", { name: "Landing page" }),
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