import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParallaxSection } from "./parallax-section";

const PLANES = [
  { id: "watermark", speed: 15, children: "Red FaCyT" },
  { id: "rule", motion: "stretch" as const, children: "Regla" },
];

describe("ParallaxSection", () => {
  it("renders its content", () => {
    render(
      <ParallaxSection>
        <p>Contenido</p>
      </ParallaxSection>,
    );

    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("exposes an accessible region when a label is provided", () => {
    render(
      <ParallaxSection label="Qué ofrece">
        <p>Contenido</p>
      </ParallaxSection>,
    );

    expect(
      screen.getByRole("region", { name: "Qué ofrece" }),
    ).toBeInTheDocument();
  });

  it("supports being labelled by its own heading", () => {
    render(
      <ParallaxSection labelledBy="roles-title">
        <h2 id="roles-title">Roles</h2>
      </ParallaxSection>,
    );

    expect(screen.getByRole("region", { name: "Roles" })).toBeInTheDocument();
  });

  it("applies the requested id", () => {
    render(
      <ParallaxSection id="cierre">
        <p>Contenido</p>
      </ParallaxSection>,
    );

    expect(document.getElementById("cierre")).not.toBeNull();
  });

  it("renders every background plane inside a decorative layer", () => {
    const { container } = render(
      <ParallaxSection planes={PLANES}>
        <p>Contenido</p>
      </ParallaxSection>,
    );

    const layer = container.querySelector("[data-parallax-layer]");
    expect(layer).not.toBeNull();
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer?.querySelectorAll("[data-parallax-motion]")).toHaveLength(2);
  });

  it("keeps the background layer behind the content", () => {
    const { container } = render(
      <ParallaxSection planes={PLANES}>
        <p>Contenido</p>
      </ParallaxSection>,
    );

    const layer = container.querySelector("[data-parallax-layer]");
    expect(layer).toHaveClass("pointer-events-none");
    expect(container.querySelector("[data-parallax-content]")).toBeInTheDocument();
  });

  it("omits the background layer when there are no planes", () => {
    const { container } = render(
      <ParallaxSection>
        <p>Contenido</p>
      </ParallaxSection>,
    );

    expect(container.querySelector("[data-parallax-layer]")).toBeNull();
  });
});
