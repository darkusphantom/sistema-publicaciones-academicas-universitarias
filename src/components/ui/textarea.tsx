import { forwardRef, TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";
import { AlertTriangleIcon } from "./icons";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  /** The text label for the field. */
  label: string;
  /** Optional help text displayed below the field. */
  helpText?: string;
  /** Error message displayed when validation fails. */
  error?: string;
  /** Optional current character count. */
  characterCount?: number;
  /** Whether to show the character count. */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helpText, error, className, characterCount, showCount, maxLength, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const id = useId();
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;

    const describedBy = [
      error ? errorId : undefined,
      helpText ? helpId : undefined,
      ariaDescribedBy
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="flex justify-between items-baseline">
          <label htmlFor={id} className="text-base font-medium text-text">
            {label}
          </label>
          {showCount && maxLength !== undefined && (
            <span className="text-sm text-text-muted">
              {characterCount ?? 0} / {maxLength}
            </span>
          )}
        </div>
        
        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          maxLength={maxLength}
          className={cn(
            "min-h-11 rounded-md border bg-surface px-3 py-2 text-base text-text transition-colors",
            "placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            error ? "border-danger" : "border-text-muted",
          )}
          {...props}
        />

        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-sm text-danger">
            <AlertTriangleIcon className="shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {helpText && !error && (
          <p id={helpId} className="text-sm text-text-muted">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
