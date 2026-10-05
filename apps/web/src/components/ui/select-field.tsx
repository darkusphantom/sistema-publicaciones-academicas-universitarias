"use client";

import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Props accepted by {@link SelectField}. */
export type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id"
> & {
  /** Visible label text (required — placeholder is never the label). */
  label: string;
  /** Help text shown below the select. */
  hint?: string;
  /** Validation error message. */
  error?: string;
  /** Option elements rendered inside the `<select>`. */
  children: ReactNode;
};

/**
 * Accessible native `<select>` with a visible label and optional hint/error.
 *
 * A separate component from `Field` is necessary because `Field` is typed over
 * `InputHTMLAttributes<HTMLInputElement>`, and extending it to accept a
 * `<select>` would require loosening that type constraint
 * (`docs/design/wireframes_feed.md` §6.9).
 *
 * Accessibility notes:
 * - Real `<label>` with `htmlFor` — no `aria-label` substitutes.
 * - `aria-describedby` wires the `<select>` to its hint and error nodes.
 * - `aria-invalid` is set when an error is present.
 * - The border uses `--text-muted` (same as `Field`) to identify the control
 *   boundary, matching `docs/design/auth.md` §8.3.
 * - `min-h-11` ensures the 44px touch target (WCAG 2.5.8).
 *
 * @param props - Select field props.
 * @returns The label + select + hint/error fieldset.
 */
export function SelectField({
  label,
  hint,
  error,
  children,
  className,
  ...selectProps
}: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>

      <select
        {...selectProps}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-11 w-full rounded-md border border-text-muted bg-surface px-3 text-base text-text",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-danger",
          className,
        )}
      >
        {children}
      </select>

      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
