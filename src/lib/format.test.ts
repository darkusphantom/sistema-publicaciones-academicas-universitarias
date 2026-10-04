import { describe, expect, it } from "vitest";
import { formatDate, truncateText, extractKeywords } from "./format";

describe("formatDate", () => {
  it("formats a valid ISO date in Spanish by default", () => {
    expect(formatDate("2026-03-12")).toBe("12 mar 2026");
  });

  it("formats a date with a custom locale", () => {
    expect(formatDate("2026-03-12", "en-US")).toBe("Mar 12, 2026");
  });

  it("returns 'Invalid date' for an unparseable input", () => {
    expect(formatDate("not-a-date")).toBe("Invalid date");
  });
});

describe("truncateText", () => {
  it("returns the text unchanged when it fits within the limit", () => {
    expect(truncateText("short text")).toBe("short text");
  });

  it("truncates long text and appends an ellipsis", () => {
    expect(truncateText("a".repeat(200), 160)).toBe(`${"a".repeat(160)}…`);
  });

  it("trims trailing whitespace before appending the ellipsis", () => {
    expect(truncateText("hello  world", 7)).toBe("hello…");
  });
});

describe("extractKeywords", () => {
  it("extracts hashtags with their pound sign", () => {
    expect(extractKeywords("This is a #test of #hashtags")).toEqual(["#test", "#hashtags"]);
  });

  it("normalizes to lowercase and removes accents", () => {
    expect(extractKeywords("#Área #Público #Investigación")).toEqual(["#area", "#publico", "#investigacion"]);
  });

  it("returns unique hashtags", () => {
    expect(extractKeywords("#test #test #Test")).toEqual(["#test"]);
  });

  it("returns an empty array when there are no hashtags", () => {
    expect(extractKeywords("No hashtags here")).toEqual([]);
  });
});