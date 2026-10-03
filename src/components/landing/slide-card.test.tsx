import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlideCard } from "@/components/landing/slide-card";
import { LANDING_SLIDES } from "@/components/landing/landing-slides-data";

describe("SlideCard", () => {
  const sampleSlide = LANDING_SLIDES[0];

  it("renders slide badge, title, subtitle, and image", () => {
    render(
      <SlideCard
        slide={sampleSlide}
        isActive={true}
        slideIndex={0}
        totalSlides={4}
      />
    );

    expect(screen.getByText(sampleSlide.badge)).toBeInTheDocument();
    expect(screen.getByText(sampleSlide.title)).toBeInTheDocument();
    expect(screen.getByText(sampleSlide.subtitle)).toBeInTheDocument();

    const img = screen.getByAltText(sampleSlide.imageAlt);
    expect(img).toBeInTheDocument();
  });

  it("sets appropriate ARIA attributes for active vs inactive slide", () => {
    const { rerender } = render(
      <SlideCard
        slide={sampleSlide}
        isActive={true}
        slideIndex={0}
        totalSlides={4}
      />
    );

    const activeRegion = screen.getByRole("group");
    expect(activeRegion).toHaveAttribute(
      "aria-label",
      "Diapositiva 1 de 4: Red FaCyT: La plataforma de nuestra facultad"
    );
    expect(activeRegion).toHaveAttribute("aria-hidden", "false");

    rerender(
      <SlideCard
        slide={sampleSlide}
        isActive={false}
        slideIndex={0}
        totalSlides={4}
      />
    );

    const inactiveRegion = screen.getByRole("group", { hidden: true });
    expect(inactiveRegion).toHaveAttribute("aria-hidden", "true");
  });
});
