import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { LandingHero } = await import("./landing-hero");

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("LandingHero", () => {
  it("renders the institutional masthead copy", () => {
    render(<LandingHero />);

    expect(
      screen.getByRole("heading", { level: 1, name: "FaCyT" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Facultad Experimental de Ciencias y Tecnología"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "La gaceta digital de la facultad: noticias, avisos y vida universitaria.",
      ),
    ).toBeInTheDocument();
  });

  it("sets the display typography with the serif editorial face", () => {
    render(<LandingHero />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("font-display");
  });

  it("offers the two ghost entry points to the public routes", () => {
    render(<LandingHero />);

    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Registrar" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("does not use the accent token, reserved for the single primary CTA", () => {
    const { container } = render(<LandingHero />);

    expect(container.querySelector(".bg-accent")).toBeNull();
  });

  it("renders the typographic vignette as a decorative drifting plane", () => {
    const { container } = render(<LandingHero />);

    const vignette = container.querySelector('[data-parallax-motion="drift"]');
    expect(vignette).toHaveAttribute("aria-hidden", "true");
    expect(vignette).toHaveStyle({ "--parallax-speed": "18%" });
    expect(vignette).toHaveTextContent("FaCyT · Est.");
  });

  it("renders the divider as a stretching rule that separates on scroll", () => {
    const { container } = render(<LandingHero />);

    const divider = container.querySelector('[data-parallax-motion="stretch"]');
    expect(divider).toHaveAttribute("aria-hidden", "true");
    expect(divider).toHaveClass("bg-border");
  });
});
