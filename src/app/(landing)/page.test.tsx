import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ONBOARDING_SEEN_VALUE, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";

const { push, replace } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

const { default: LandingPage } = await import("./page");

beforeEach(() => {
  push.mockClear();
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

  it("renders the interactive carousel region", () => {
    render(<LandingPage />);

    const carousels = screen.getAllByRole("region", {
      name: "Presentación de características de Red FaCyT",
    });
    expect(carousels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the first slide heading and content", () => {
    render(<LandingPage />);

    expect(
      screen.getByText("Red FaCyT: La plataforma de nuestra facultad")
    ).toBeInTheDocument();
  });

  it("marks onboarding as seen and redirects to /login when clicking Omitir", () => {
    render(<LandingPage />);

    const skipBtn = screen.getByRole("button", { name: "Omitir" });
    fireEvent.click(skipBtn);

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe(
      ONBOARDING_SEEN_VALUE
    );
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("navigates carousel slides and completes onboarding on last slide", () => {
    render(<LandingPage />);

    const nextBtn = screen.getByRole("button", { name: "Siguiente ➔" });

    // Advance through slides
    fireEvent.click(nextBtn); // slide 2
    fireEvent.click(nextBtn); // slide 3
    fireEvent.click(nextBtn); // slide 4 (last slide)

    expect(
      screen.getByText("Un espacio para todos los perfiles")
    ).toBeInTheDocument();

    const finishBtn = screen.getByRole("button", { name: "Empezar ahora" });
    fireEvent.click(finishBtn);

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe(
      ONBOARDING_SEEN_VALUE
    );
    expect(push).toHaveBeenCalledWith("/register");
  });

  it("redirects to /login without marking onboarding when clicking Ya tengo cuenta", () => {
    render(<LandingPage />);

    const loginBtn = screen.getByRole("button", { name: "Ya tengo cuenta" });
    fireEvent.click(loginBtn);

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("sends recurrent visitors to /login via WelcomeGate", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);

    render(<LandingPage />);

    expect(replace).toHaveBeenCalledWith("/login");
  });
});
