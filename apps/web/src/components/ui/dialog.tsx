"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { XIcon } from "./icons";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;   // id del h2
  describedBy?: string; // id del subtítulo o del cuerpo
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "xl";  // max-w-md | max-w-xl
};

export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  footer,
  width = "xl",
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      
      const dialogNode = dialogRef.current;
      if (dialogNode) {
        // Simple focus trap initialization by focusing the first focusable element
        // or the dialog itself.
        dialogNode.focus();
      }
    } else {
      document.body.style.overflow = "";
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      // Basic focus trap
      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-bg/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          "relative flex flex-col bg-surface rounded-lg shadow-lg border border-border w-full max-h-[90dvh] outline-none",
          width === "xl" ? "max-w-xl" : "max-w-md"
        )}
      >
        <div className="flex items-start justify-between shrink-0 p-6 pb-4">
          <div className="flex flex-col gap-1 pr-6" id="dialog-header-content">
            {/* The caller should render the h2 and p inside children, but wireframe says cabecera is part of the layout. Wait, the props only have children and footer. So cabecera is rendered inside children? Ah, wireframe says: 
              ├─ cabecera        shrink-0
              │   h2  text-2xl font-semibold
              │   p   text-sm text-text-muted
              │   ✕  botón icono 44×44, esquina sup. d.
              Wait, the props don't pass title and description, only labelledBy. This implies title is part of children, or maybe we should add an X button absolutely positioned. Let's place the X button top right absolute.
             */}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-bg transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          <div className="flex flex-col gap-4">
            {children}
          </div>
        </div>

        {footer && (
          <div className="shrink-0 border-t border-border p-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
