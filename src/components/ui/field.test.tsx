import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./field";

describe("Field", () => {
  it("renders label and input with linked id", () => {
    render(<Field label="Usuario" name="username" />);
    const input = screen.getByLabelText("Usuario");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "username");
  });

  it("renders help text and links it via aria-describedby", () => {
    render(<Field label="Contraseña" helpText="Mínimo 8 caracteres." />);
    const input = screen.getByLabelText("Contraseña");
    const help = screen.getByText("Mínimo 8 caracteres.");
    expect(help).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-describedby", help.id);
  });

  it("renders error state with aria-invalid and icon", () => {
    render(<Field label="Correo" error="Escribe un correo válido." />);
    const input = screen.getByLabelText("Correo");
    const error = screen.getByText("Escribe un correo válido.");
    
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.parentElement!.id);
    expect(error).toBeInTheDocument();
    // Icon presence can be checked by the layout (it's inside the same paragraph)
    expect(error.parentElement?.querySelector("svg")).toBeInTheDocument();
  });
});
