"use client";

import { useRef, useState } from "react";
import { CameraIcon, TrashIcon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { FormAlert } from "@/components/ui/form-alert";
import { avatarFileSchema } from "@redfacyt/shared";
import type { User } from "@/lib/types";

type AvatarUploaderProps = {
  user: Pick<User, "givenName" | "familyName" | "avatarUrl">;
};

export function AvatarUploader({ user }: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setError(null);
    const result = avatarFileSchema.safeParse(file);
    if (!result.success) {
      const msg = result.error.issues[0]?.message;
      if (msg === "invalid_type") setError("La foto debe ser un archivo PNG o JPG.");
      else if (msg === "too_large") setError("La foto no puede superar los 5 MB.");
      else setError("La foto debe ser un archivo PNG o JPG.");

      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <Avatar user={{ ...user, avatarUrl: previewUrl }} size="xl" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <label
            htmlFor="avatar-upload"
            className="inline-flex h-11 items-center justify-center rounded-md bg-surface-muted px-4 text-sm font-medium hover:brightness-95 border border-[var(--border)] cursor-pointer focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1 peer-focus-visible"
          >
            <CameraIcon className="mr-2 opacity-70" />
            Cambiar foto
            <input
              id="avatar-upload"
              name="avatarFile"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              ref={inputRef}
              onChange={handleFileChange}
              aria-describedby={error ? "avatar-error" : "avatar-help"}
              aria-invalid={Boolean(error)}
            />
          </label>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-danger hover:bg-[var(--danger)]/10"
            >
              <TrashIcon className="mr-2" />
              Quitar foto
            </button>
          )}
        </div>

        {/* Input oculto que el formulario principal recogerá (UpdateProfileSchema espera avatarUrl string nulo) */}
        <input type="hidden" name="avatarUrl" value={previewUrl || ""} />

        {error ? (
          <div id="avatar-error" className="mt-1">
            <FormAlert errors={{}} globalError={error} />
          </div>
        ) : (
          <p id="avatar-help" className="text-sm text-text-muted mt-1">
            PNG o JPG, máximo 5 MB.
          </p>
        )}
      </div>
    </div>
  );
}
