import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormAlert } from "./form-alert";

describe("FormAlert", () => {
  it("does not render when 0 errors", () => {
    const { container } = render(<FormAlert errors={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render when 1 field error and no global error", () => {
    const { container } = render(<FormAlert errors={{ username: "Error inline only" }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders when there is a global error", () => {
    render(<FormAlert errors={{}} globalError="Credenciales inválidas" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
  });

  it("renders when there are 2 or more field errors", () => {
    render(<FormAlert errors={{ a: "Error A", b: "Error B" }} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error A")).toBeInTheDocument();
    expect(screen.getByText("Error B")).toBeInTheDocument();
  });

  it("focuses alert on render", () => {
    render(<FormAlert errors={{ a: "Error A", b: "Error B" }} />);
    const alert = screen.getByRole("alert");
    expect(document.activeElement).toBe(alert);
  });

  it("moves focus to field on button click", () => {
    // Setup a dummy input in the document
    document.body.innerHTML = '<input name="test-field" />';
    const input = document.querySelector('[name="test-field"]') as HTMLInputElement;
    
    render(<FormAlert errors={{ "test-field": "Error here", "other": "Error B" }} />);
    
    const button = screen.getByRole("button", { name: "Error here" });
    fireEvent.click(button);
    
    expect(document.activeElement).toBe(input);
  });
});
