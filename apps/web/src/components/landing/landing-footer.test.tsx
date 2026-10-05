import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingFooter } from "@/components/landing/landing-footer";

describe("LandingFooter", () => {
  it("renders faculty attribution and copyright notice", () => {
    render(<LandingFooter />);

    expect(
      screen.getByText(/Facultad Experimental de Ciencias y Tecnología/i)
    ).toBeInTheDocument();
  });
});
