import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterBar } from "./filter-bar";
import { DEFAULT_POST_FILTERS } from "@/lib/types";

describe("FilterBar", () => {
  it("renders all selects for filters and correctly hides status filter", () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={DEFAULT_POST_FILTERS}
        authors={[]}
        onChange={onChange}
        showStatusFilter={true}
        dateRangeError=""
        onClear={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Buscar/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de publicación/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Área de investigación/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Autor/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Desde/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasta/)).toBeInTheDocument();
  });

  it("hides status filter when showStatusFilter is false", () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={DEFAULT_POST_FILTERS}
        authors={[]}
        onChange={onChange}
        showStatusFilter={false}
        dateRangeError=""
        onClear={vi.fn()}
      />
    );

    expect(screen.queryByLabelText(/Estado/)).not.toBeInTheDocument();
  });
});
