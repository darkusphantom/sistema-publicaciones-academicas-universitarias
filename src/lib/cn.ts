/**
 * Joins class names into a single `class` attribute value.
 *
 * Minimal, dependency-free alternative to `clsx`: it only filters out the empty
 * values that conditional class expressions produce (`cond && "class"`, ternary
 * branches returning `null`, …). It deliberately does not de-duplicate or merge
 * conflicting Tailwind utilities; callers are responsible for not passing both
 * a base class and its conflicting override in the same expression.
 *
 * @param values - Class names or empty values to be joined.
 * @returns The class names joined by a single space, without leading/trailing spaces.
 * @complexity O(n) — a single pass over `n` input values.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter((value) => typeof value === "string" && value !== "").join(" ");
}
