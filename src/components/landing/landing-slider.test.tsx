import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LandingSlider } from "@/components/landing/landing-slider";
import { LANDING_SLIDES } from "@/components/landing/landing-slides-data";

describe("LandingSlider", () => {
  it("renders the first slide by default", () => {
    render(<LandingSlider slides={LANDING_SLIDES} />);

    expect(screen.getByText(LANDING_SLIDES[0].title)).toBeInTheDocument();
    expect(screen.getByText("Siguiente ➔")).toBeInTheDocument();
  });

  it("advances slides when clicking Siguiente button and triggers onboarding on last slide", () => {
    const onFinish = vi.fn();
    render(<LandingSlider slides={LANDING_SLIDES} onFinishOnboarding={onFinish} />);

    const nextBtn = screen.getByText("Siguiente ➔");

    // Advance to slide 2
    fireEvent.click(nextBtn);
    expect(screen.getByText(LANDING_SLIDES[1].title)).toBeInTheDocument();

    // Advance to slide 3
    fireEvent.click(nextBtn);
    expect(screen.getByText(LANDING_SLIDES[2].title)).toBeInTheDocument();

    // Advance to slide 4 (last slide)
    fireEvent.click(nextBtn);
    expect(screen.getByText(LANDING_SLIDES[3].title)).toBeInTheDocument();

    // On last slide, button label becomes "Empezar ahora"
    const finishBtn = screen.getByText("Empezar ahora");
    fireEvent.click(finishBtn);

    expect(onFinish).toHaveBeenCalledWith("register");
  });

  it("navigates backwards when clicking Anterior arrow button", () => {
    render(<LandingSlider slides={LANDING_SLIDES} />);

    const nextBtn = screen.getByText("Siguiente ➔");
    fireEvent.click(nextBtn); // To slide 2
    expect(screen.getByText(LANDING_SLIDES[1].title)).toBeInTheDocument();

    const prevArrow = screen.getByRole("button", { name: "Diapositiva anterior" });
    fireEvent.click(prevArrow);
    expect(screen.getByText(LANDING_SLIDES[0].title)).toBeInTheDocument();
  });

  it("handles touch swipe left and right gestures", () => {
    render(<LandingSlider slides={LANDING_SLIDES} />);

    const region = screen.getByRole("region", { name: "Presentación de características de Red FaCyT" });

    // Swipe left (next)
    fireEvent.touchStart(region, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchEnd(region, { changedTouches: [{ clientX: 100, clientY: 100 }] });

    expect(screen.getByText(LANDING_SLIDES[1].title)).toBeInTheDocument();

    // Swipe right (prev)
    fireEvent.touchStart(region, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(region, { changedTouches: [{ clientX: 300, clientY: 100 }] });

    expect(screen.getByText(LANDING_SLIDES[0].title)).toBeInTheDocument();
  });

  it("triggers login redirect when clicking Ya tengo cuenta button", () => {
    const onFinish = vi.fn();
    render(<LandingSlider slides={LANDING_SLIDES} onFinishOnboarding={onFinish} />);

    const loginBtn = screen.getByText("Ya tengo cuenta");
    fireEvent.click(loginBtn);

    expect(onFinish).toHaveBeenCalledWith("login");
  });
});
