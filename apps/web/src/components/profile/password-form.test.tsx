import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordForm } from "./password-form";

vi.mock("@/app/(main)/profile/actions", () => ({
  changePasswordAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("PasswordForm", () => {
  it("renders correctly", () => {
    const onCancel = vi.fn();
    const onSuccess = vi.fn();
    render(<PasswordForm onCancel={onCancel} onSuccess={onSuccess} />);
    
    expect(screen.getByLabelText("Contraseña actual *")).toBeDefined();
    expect(screen.getByLabelText("Nueva contraseña *")).toBeDefined();
    expect(screen.getByLabelText("Confirmar nueva contraseña *")).toBeDefined();
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<PasswordForm onCancel={onCancel} onSuccess={vi.fn()} />);
    
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalled();
  });
});
