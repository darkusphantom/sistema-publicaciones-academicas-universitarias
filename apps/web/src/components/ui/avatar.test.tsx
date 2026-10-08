import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  const userBase = {
    givenName: "Juan",
    familyName: "Pérez",
    avatarUrl: null,
  };

  it("renders initials when there is no avatarUrl", () => {
    render(<Avatar user={userBase} />);
    const span = screen.getByText("JP");
    expect(span).toBeDefined();
    expect(span.getAttribute("aria-hidden")).toBe("true");

    // No img should be rendered
    const img = screen.queryByRole("img");
    expect(img).toBeNull();
  });

  it("renders image when avatarUrl is present", () => {
    const userWithPhoto = { ...userBase, avatarUrl: "https://example.com/photo.png" };
    render(<Avatar user={userWithPhoto} />);

    // Initials are still there behind the image
    expect(screen.getByText("JP")).toBeDefined();

    // Image is present with decorative alt
    const img = document.querySelector("img") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://example.com/photo.png");
    expect(img.getAttribute("alt")).toBe("");
  });

  it("applies size classes correctly", () => {
    const { container } = render(<Avatar user={userBase} size="xl" />);
    expect(container.firstChild).toHaveProperty("className");
    expect((container.firstChild as HTMLElement).className).toContain("w-20");
  });
});
