import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LandingHeader } from "@/components/landing/landing-header";

describe("LandingHeader", () => {
  it("renders FaCyT logo brand, theme toggle, and skip onboarding link", () => {
    const onSkip = vi.fn();
    render(<LandingHeader onSkip={onSkip} />);

    expect(screen.getByText(/FaCyT/i)).toBeInTheDocument();
    expect(screen.getByText("Omitir")).toBeInTheDocument();
  });

  it("triggers onSkip when clicking skip button", () => {
    const onSkip = vi.fn();
    render(<LandingHeader onSkip={onSkip} />);

    const skipBtn = screen.getByText("Omitir");
    fireEvent.click(skipBtn);

    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
