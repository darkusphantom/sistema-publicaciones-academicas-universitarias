import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SlideIndicators } from "./slide-indicators";

describe("SlideIndicators", () => {
  it("renders a button for each slide with appropriate accessibility attributes", () => {
    render(
      <SlideIndicators
        totalSlides={4}
        currentSlide={0}
        onSelectSlide={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toHaveAttribute("aria-label", "Ir a diapositiva 1");
    expect(buttons[0]).toHaveAttribute("aria-current", "true");
    expect(buttons[1]).toHaveAttribute("aria-current", "false");
  });

  it("calls onSelectSlide when an indicator is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SlideIndicators
        totalSlides={4}
        currentSlide={1}
        onSelectSlide={onSelect}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);

    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
