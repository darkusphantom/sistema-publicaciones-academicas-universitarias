import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ONBOARDING_SEEN_VALUE, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { default: LandingPage } = await import("./page");

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("LandingPage", () => {
  it("renders the three landmarks of the screen", () => {
    render(<LandingPage />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("keeps a single h1 as the anchor of the editorial hierarchy", () => {
    render(<LandingPage />);

    expect(
      screen.getAllByRole("heading", { level: 1 }),
    ).toHaveLength(1);
  });

  it("publishes the three editorial blocks as h2 without skipping levels", () => {
    render(<LandingPage />);

    const headings = screen
      .getAllByRole("heading")
      .map((heading) => heading.tagName);

    expect(headings).toEqual(["H1", "H2", "H2", "H2"]);
  });

  it("renders the final copy of the 'what it offers' section", () => {
    render(<LandingPage />);

    const section = screen.getByRole("region", { name: "Qué ofrece" });
    expect(
      within(section).getByRole("heading", { name: "Noticias y avisos" }),
    ).toBeInTheDocument();
    expect(
      within(section).getByText(
        "Comunicados oficiales y agenda en un solo lugar.",
      ),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", { name: "Académico" }),
    ).toBeInTheDocument();
    expect(
      within(section).getByText("Cursos, talleres y defensas, organizados."),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", { name: "Vida universitaria" }),
    ).toBeInTheDocument();
    expect(
      within(section).getByText(
        "Eventos y actividades para toda la comunidad.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the background numbers as decorative planes", () => {
    const { container } = render(<LandingPage />);

    const planes = container.querySelectorAll('[data-parallax-motion="drift"]');
    expect(planes).toHaveLength(5);
    planes.forEach((plane) => {
      expect(plane).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("renders the audience block", () => {
    render(<LandingPage />);

    const section = screen.getByRole("region", { name: "Roles" });
    expect(
      within(section).getByText(
        "Para profesores, estudiantes y administración.",
      ),
    ).toBeInTheDocument();
    expect(
      within(section).getByText("Estudiante · Profesor · Admin"),
    ).toBeInTheDocument();
  });

  it("closes with a single primary CTA and a ghost alternative", () => {
    render(<LandingPage />);

    const closing = screen.getByRole("region", { name: "Cierre" });
    const cta = within(closing).getByRole("link", { name: "Empezar" });
    expect(cta).toHaveAttribute("href", "/register");
    expect(cta).toHaveClass("bg-accent");
    expect(
      within(closing).getByRole("link", { name: "Ya tengo cuenta" }),
    ).toHaveAttribute("href", "/login");
  });

  it("uses the accent token exactly once in the whole screen", () => {
    const { container } = render(<LandingPage />);

    expect(container.querySelectorAll(".bg-accent")).toHaveLength(1);
  });

  it("paints the offering numbers and the masthead ghost as decorative planes", () => {
    const { container } = render(<LandingPage />);

    const drifting = Array.from(
      container.querySelectorAll('[data-parallax-motion="drift"]'),
    );
    expect(drifting.map((plane) => plane.textContent)).toEqual([
      "FaCyT · Est.",
      "01",
      "02",
      "03",
      "Red FaCyT",
    ]);
    for (const plane of drifting) {
      expect(plane).toHaveAttribute("aria-hidden", "true");
      expect(plane.textContent).not.toBe("");
    }
  });

  it("marks the introduction as seen when the primary CTA is used", () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("link", { name: "Empezar" }));

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe(
      ONBOARDING_SEEN_VALUE,
    );
  });

  it("does not mark the introduction when the login link is used", () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("link", { name: "Iniciar sesión" }));

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
  });

  it("sends recurrent visitors to the login", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);

    render(<LandingPage />);

    expect(replace).toHaveBeenCalledWith("/login");
  });
});
