import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParallaxPlane } from "./parallax-plane";

describe("ParallaxPlane", () => {
  it("renders its decorative content", () => {
    render(<ParallaxPlane>01</ParallaxPlane>);

    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("exposes the drift speed as a CSS custom property", () => {
    const { container } = render(<ParallaxPlane speed={12}>FaCyT</ParallaxPlane>);

    expect(container.firstElementChild).toHaveStyle({
      "--parallax-speed": "12%",
    });
  });

  it("defaults to no drift", () => {
    const { container } = render(<ParallaxPlane>FaCyT</ParallaxPlane>);

    expect(container.firstElementChild).toHaveStyle({
      "--parallax-speed": "0%",
    });
  });

  it("hides decorative planes from assistive technology by default", () => {
    const { container } = render(<ParallaxPlane>Red FaCyT</ParallaxPlane>);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("stays exposed when the plane is not decorative", () => {
    const { container } = render(
      <ParallaxPlane decorative={false}>Regla</ParallaxPlane>,
    );

    expect(container.firstElementChild).not.toHaveAttribute("aria-hidden");
  });

  it("uses the drift motion by default", () => {
    const { container } = render(<ParallaxPlane>FaCyT</ParallaxPlane>);

    expect(container.firstElementChild).toHaveAttribute(
      "data-parallax-motion",
      "drift",
    );
  });

  it("publishes the stretch motion and its starting scale", () => {
    const { container } = render(
      <ParallaxPlane motion="stretch" stretchFrom={0.45}>
        Regla
      </ParallaxPlane>,
    );

    const plane = container.firstElementChild;
    expect(plane).toHaveAttribute("data-parallax-motion", "stretch");
    expect(plane).toHaveStyle({ "--parallax-stretch-from": "0.45" });
  });

  it("never captures pointer events, so it cannot block the content", () => {
    const { container } = render(<ParallaxPlane>FaCyT</ParallaxPlane>);

    expect(container.firstElementChild).toHaveClass("pointer-events-none");
  });
});
