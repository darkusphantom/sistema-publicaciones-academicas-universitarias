"use client";

import { useEffect, useRef } from "react";
import { Dialog } from "./dialog";
import { buttonStyles } from "./button";
import { AlertTriangleIcon } from "./icons";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  isPending?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  isPending,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Focus the cancel button when opened to prevent accidental deletion
      cancelRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="confirm-dialog-title"
      width="md"
      footer={
        <>
          <button
            ref={cancelRef}
            className={buttonStyles({ variant: "secondary" })}
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            className={buttonStyles({ variant: "danger" })}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center pt-4">
        <AlertTriangleIcon className="h-12 w-12 text-danger mb-4" aria-hidden="true" />
        <h2 id="confirm-dialog-title" className="text-xl font-semibold mb-2">
          <span className="sr-only">Advertencia:</span>
          {title}
        </h2>
        <div className="text-base text-text-muted">
          {body}
        </div>
      </div>
    </Dialog>
  );
}
