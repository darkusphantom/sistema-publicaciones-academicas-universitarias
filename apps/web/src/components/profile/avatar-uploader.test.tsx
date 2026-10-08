import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AvatarUploader } from "./avatar-uploader";

describe("AvatarUploader", () => {
  const user = {
    givenName: "Juan",
    familyName: "Pérez",
    avatarUrl: null,
  };

  it("renders correctly", () => {
    render(<AvatarUploader user={user} />);
    expect(screen.getByLabelText("Cambiar foto")).toBeDefined();
    expect(screen.queryByRole("button", { name: /Quitar foto/i })).toBeNull();
  });

  it("shows remove button if there is a preview url", () => {
    const userWithPhoto = { ...user, avatarUrl: "data:image/png;base64,123" };
    render(<AvatarUploader user={userWithPhoto} />);
    expect(screen.getByRole("button", { name: /Quitar foto/i })).toBeDefined();
  });

  it("removes preview url when clicking remove", () => {
    const userWithPhoto = { ...user, avatarUrl: "data:image/png;base64,123" };
    render(<AvatarUploader user={userWithPhoto} />);

    const removeBtn = screen.getByRole("button", { name: /Quitar foto/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByRole("button", { name: /Quitar foto/i })).toBeNull();
    // Hidden input should be empty
    const hiddenInput = document.querySelector('input[name="avatarUrl"]') as HTMLInputElement;
    expect(hiddenInput.value).toBe("");
  });
});
