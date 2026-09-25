import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ONBOARDING_SEEN_VALUE, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { LandingTopBar } = await import("./landing-top-bar");

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("LandingTopBar", () => {
  it("shows the brand without a dead self-link", () => {
    render(<LandingTopBar />);

    const brand = screen.getByText("FaCyT");
    expect(brand).toBeInTheDocument();
    expect(brand.tagName).not.toBe("A");
  });

  it("offers the theme toggle", () => {
    render(<LandingTopBar />);

    expect(
      screen.getByRole("button", { name: "Cambiar a modo oscuro" }),
    ).toBeInTheDocument();
  });

  it("skips the introduction to the login and records the flag", () => {
    render(<LandingTopBar />);

    const skip = screen.getByRole("link", { name: /Omitir introducción/ });
    expect(skip).toHaveAttribute("href", "/login");

    fireEvent.click(skip);

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe(
      ONBOARDING_SEEN_VALUE,
    );
  });

  it("keeps the skip link neutral, so the accent stays exclusive to the CTA", () => {
    const { container } = render(<LandingTopBar />);

    expect(container.querySelector(".bg-accent")).toBeNull();
  });
});
