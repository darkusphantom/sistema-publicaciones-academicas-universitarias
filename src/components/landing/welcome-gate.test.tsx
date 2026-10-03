import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ONBOARDING_SEEN_VALUE, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { WelcomeGate } = await import("./welcome-gate");

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("WelcomeGate", () => {
  it("renders the introduction on a first visit", () => {
    render(
      <WelcomeGate>
        <p>Introducción</p>
      </WelcomeGate>,
    );

    expect(screen.getByText("Introducción")).toBeInTheDocument();
  });

  it("does not redirect when no flag is stored", () => {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);

    render(
      <WelcomeGate>
        <p>Introducción</p>
      </WelcomeGate>,
    );

    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects exactly once to the login when the introduction was already seen", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);

    render(
      <WelcomeGate>
        <p>Introducción</p>
      </WelcomeGate>,
    );

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("keeps rendering the introduction for recurrent visitors, so the server HTML stays indexable", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);

    render(
      <WelcomeGate>
        <p>Introducción</p>
      </WelcomeGate>,
    );

    expect(screen.getByText("Introducción")).toBeInTheDocument();
  });

  it("ignores a flag with an unknown value", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "pendiente");

    render(
      <WelcomeGate>
        <p>Introducción</p>
      </WelcomeGate>,
    );

    expect(replace).not.toHaveBeenCalled();
  });
});
