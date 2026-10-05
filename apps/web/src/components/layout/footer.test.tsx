import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

describe("Footer", () => {
  it("is exposed as the contentinfo landmark", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("identifies the institution", () => {
    render(<Footer />);

    expect(
      screen.getByText("Facultad Experimental de Ciencias y Tecnología"),
    ).toBeInTheDocument();
  });

  it("shows the current year", () => {
    render(<Footer />);

    expect(
      screen.getByText(`© ${new Date().getFullYear()} Red FaCyT`),
    ).toBeInTheDocument();
  });

  it("accepts a fixed year so the footer can be rendered statically", () => {
    render(<Footer year={2030} />);

    expect(screen.getByText("© 2030 Red FaCyT")).toBeInTheDocument();
  });
});
