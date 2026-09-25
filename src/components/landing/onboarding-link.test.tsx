import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ONBOARDING_SEEN_VALUE, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";
import { OnboardingLink } from "./onboarding-link";

afterEach(() => {
  window.localStorage.clear();
});

describe("OnboardingLink", () => {
  it("renders a real anchor so the route is navigable", () => {
    render(<OnboardingLink href="/login">Omitir introducción</OnboardingLink>);

    const link = screen.getByRole("link", { name: "Omitir introducción" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("marks the introduction as seen before navigating", () => {
    render(<OnboardingLink href="/login">Omitir introducción</OnboardingLink>);

    fireEvent.click(screen.getByRole("link"));

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe(
      ONBOARDING_SEEN_VALUE,
    );
  });

  it("keeps a touch target of at least 44px", () => {
    render(<OnboardingLink href="/register">Empezar</OnboardingLink>);

    expect(screen.getByRole("link")).toHaveClass("min-h-11");
  });

  it("renders the primary variant by default and accepts an override", () => {
    const { rerender } = render(
      <OnboardingLink href="/register">Empezar</OnboardingLink>,
    );
    expect(screen.getByRole("link")).toHaveClass("bg-accent");

    rerender(
      <OnboardingLink href="/login" variant="ghost">
        Omitir introducción
      </OnboardingLink>,
    );
    expect(screen.getByRole("link")).not.toHaveClass("bg-accent");
  });

  it("forwards extra anchor attributes such as aria-label", () => {
    render(
      <OnboardingLink href="/register" aria-label="Empezar a publicar">
        Empezar
      </OnboardingLink>,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "aria-label",
      "Empezar a publicar",
    );
  });

  it("appends extra class names", () => {
    render(
      <OnboardingLink href="/register" className="w-full">
        Empezar
      </OnboardingLink>,
    );

    expect(screen.getByRole("link")).toHaveClass("w-full");
  });
});
