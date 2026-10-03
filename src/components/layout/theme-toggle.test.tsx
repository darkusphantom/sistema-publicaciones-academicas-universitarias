import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { THEME_STORAGE_KEY, applyTheme } from "@/lib/theme";
import { ThemeToggle } from "./theme-toggle";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  it("is an icon-only button with an accessible label", () => {
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAccessibleName("Cambiar a modo oscuro");
    expect(toggle).toHaveTextContent("");
  });

  it("is at least 44px tall so the touch target passes WCAG 2.5.8", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toHaveClass("min-h-11", "min-w-11");
  });

  it("exposes the dark state through aria-pressed", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("renders decorative SVG icons that are hidden from assistive tech", () => {
    const { container } = render(<ThemeToggle />);

    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((icon) => {
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("focusable", "false");
    });
  });

  it("switches to the dark theme, persists it and updates its label", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));

    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAccessibleName("Cambiar a modo claro");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("switches back to the light theme", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button");

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(toggle).toHaveAccessibleName("Cambiar a modo oscuro");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("starts in dark mode when the preference was persisted and applied before hydration", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    applyTheme("dark");

    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toHaveAccessibleName(
      "Cambiar a modo claro",
    );
  });

  it("syncs with a dark theme applied before hydration", () => {
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toHaveAccessibleName(
      "Cambiar a modo claro",
    );
  });
});
