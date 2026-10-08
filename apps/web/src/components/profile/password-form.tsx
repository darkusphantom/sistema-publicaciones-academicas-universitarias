"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { buttonStyles } from "@/components/ui/button";
import { changePasswordAction } from "@/app/(main)/profile/actions";

type PasswordFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

export function PasswordForm({ onCancel, onSuccess }: PasswordFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});
    setGlobalError(undefined);

    const formData = new FormData(e.currentTarget);
    const result = await changePasswordAction(formData);

    if (!result.success) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setErrors(result.fieldErrors);
      }
      if (result.error) {
        setGlobalError(result.error);
      }
      setIsPending(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isPending} className="space-y-4 max-w-md mt-6">
      <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">
        Cambiar Contraseña
      </h3>

      <Field
        label="Contraseña actual *"
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
        error={errors.currentPassword}
      />
      <Field
        label="Nueva contraseña *"
        name="newPassword"
        type="password"
        required
        autoComplete="new-password"
        helpText="Debe tener al menos 8 caracteres."
        error={errors.newPassword}
      />
      <Field
        label="Confirmar nueva contraseña *"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <FormAlert errors={errors} globalError={globalError} />

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isPending} className={buttonStyles({ variant: "primary" })}>
          Cambiar contraseña
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className={buttonStyles({ variant: "secondary" })}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
