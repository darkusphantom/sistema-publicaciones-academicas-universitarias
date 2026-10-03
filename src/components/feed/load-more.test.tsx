import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadMore } from "./load-more";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

describe("LoadMore", () => {
  it("renders the button when shown < total", () => {
    render(<LoadMore shown={6} total={12} pageSize={6} onLoadMore={vi.fn()} />);
    expect(screen.getByRole("button", { name: /cargar más/i })).toBeInTheDocument();
  });

  it("shows the next batch count in the label", () => {
    render(<LoadMore shown={6} total={12} pageSize={6} onLoadMore={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("Cargar más (6)");
  });

  it("shows partial batch when remaining < pageSize", () => {
    render(<LoadMore shown={10} total={12} pageSize={6} onLoadMore={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("Cargar más (2)");
  });

  it("returns null when shown >= total", () => {
    const { container } = render(
      <LoadMore shown={12} total={12} pageSize={6} onLoadMore={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls onLoadMore when clicked", async () => {
    const onLoadMore = vi.fn();
    render(<LoadMore shown={6} total={12} pageSize={6} onLoadMore={onLoadMore} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
