import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileForm } from "./profile-form";
import type { User } from "@/lib/types";

// Mock the action
vi.mock("@/app/(main)/profile/actions", () => ({
  updateProfileAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ProfileForm", () => {
  const user: User = {
    id: "1",
    username: "jperez",
    email: "j@correo.com",
    givenName: "Juan",
    familyName: "Pérez",
    role: "estudiante",
    createdAt: "2026",
    bio: "Bio original",
  };

  it("renders with user data", () => {
    const onCancel = vi.fn();
    const onSuccess = vi.fn();
    render(<ProfileForm user={user} onCancel={onCancel} onSuccess={onSuccess} />);
    
    expect((screen.getByLabelText("Nombre *") as HTMLInputElement).value).toBe("Juan");
    expect((screen.getByLabelText("Apellido *") as HTMLInputElement).value).toBe("Pérez");
    expect((screen.getByLabelText("Correo *") as HTMLInputElement).value).toBe("j@correo.com");
    expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe("Bio original");
    expect(screen.getByText("@jperez")).toBeDefined();
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<ProfileForm user={user} onCancel={onCancel} onSuccess={vi.fn()} />);
    
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalled();
  });
});
