import { describe, expect, it } from "vitest";
import { BUTTON_BASE_CLASSES, buttonStyles } from "./button";

describe("buttonStyles", () => {
  it("always applies the shared base classes", () => {
    const className = buttonStyles({});

    for (const baseClass of BUTTON_BASE_CLASSES) {
      expect(className).toContain(baseClass);
    }
  });

  it("uses the accent token for the primary variant", () => {
    expect(buttonStyles({ variant: "primary" })).toContain("bg-accent");
  });

  it("keeps the secondary variant on the surface and border tokens", () => {
    const className = buttonStyles({ variant: "secondary" });

    expect(className).toContain("bg-surface");
    expect(className).toContain("border-border");
    expect(className).not.toContain("bg-accent");
  });

  it("keeps the ghost variant borderless and neutral", () => {
    const className = buttonStyles({ variant: "ghost" });

    expect(className).toContain("bg-transparent");
    expect(className).not.toContain("bg-accent");
    expect(className).not.toContain("border-border");
  });

  it("defaults to the primary variant and the medium size", () => {
    expect(buttonStyles({})).toBe(
      buttonStyles({ variant: "primary", size: "md" }),
    );
  });

  it("keeps a touch target of at least 44px in every size", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      expect(buttonStyles({ size })).toContain("min-h-11");
    }
  });

  it("appends the caller class name last so it can win over the defaults", () => {
    const className = buttonStyles({ className: "w-full" });

    expect(className.endsWith("w-full")).toBe(true);
  });
});
