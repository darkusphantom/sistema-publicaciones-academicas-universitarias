import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins every truthy class name in order", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores null, undefined and false values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });

  it("ignores empty strings", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("returns an empty string when no value is provided", () => {
    expect(cn()).toBe("");
  });
});
