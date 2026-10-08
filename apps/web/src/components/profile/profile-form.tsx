"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormAlert } from "@/components/ui/form-alert";
import { buttonStyles } from "@/components/ui/button";
import { CopyIcon } from "@/components/ui/icons";
import { AvatarUploader } from "./avatar-uploader";
import { updateProfileAction } from "@/app/(main)/profile/actions";
import type { User } from "@/lib/types";

type ProfileFormProps = {
  user: User;
  onCancel: () => void;
  onSuccess: () => void;
};

export function ProfileForm({ user, onCancel, onSuccess }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>();
  const [bioLength, setBioLength] = useState(user.bio?.length || 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});
    setGlobalError(undefined);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);

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

  const copyUsername = () => {
    navigator.clipboard.writeText(`@${user.username}`);
    const status = document.getElementById("profile-status");
    if (status) {
      status.textContent = "Usuario copiado.";
      setTimeout(() => { if (status.textContent === "Usuario copiado.") status.textContent = ""; }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isPending} className="space-y-6">
      <AvatarUploader user={user} />

      <div className="space-y-4 pt-4 border-t border-border">
        <Field
          label="Nombre *"
          name="givenName"
          defaultValue={user.givenName}
          required
          autoComplete="given-name"
          error={errors.givenName}
        />
        <Field
          label="Apellido *"
          name="familyName"
          defaultValue={user.familyName}
          required
          autoComplete="family-name"
          error={errors.familyName}
        />
        <Field
          label="Correo *"
          name="email"
          type="email"
          defaultValue={user.email}
          required
          autoComplete="email"
          error={errors.email}
        />

        <Textarea
          label="Bio"
          name="bio"
          defaultValue={user.bio || ""}
          maxLength={160}
          rows={3}
          onChange={(e) => setBioLength(e.target.value.length)}
          helpText="Cuéntale a la comunidad quién eres (máx. 160 caracteres)."
          error={errors.bio}
          showCount
          characterCount={bioLength}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium">Usuario</label>
          <div className="flex items-center gap-2">
            <span className="flex-1 px-3 py-2 bg-surface-muted text-text-muted border border-border rounded-md text-sm cursor-not-allowed" aria-readonly="true">
              @{user.username}
            </span>
            <button type="button" onClick={copyUsername} title="Copiar usuario" className={buttonStyles({ variant: "secondary" })}>
              <CopyIcon className="w-4 h-4 mr-2" />
              Copiar
            </button>
          </div>
        </div>
      </div>

      <FormAlert errors={errors} globalError={globalError} />

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button type="submit" disabled={isPending} className={buttonStyles({ variant: "primary" })}>
          Guardar cambios
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className={buttonStyles({ variant: "secondary" })}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
