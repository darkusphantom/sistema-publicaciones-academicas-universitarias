import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "./post-card";
import type { Post, AuthorOption } from "@/lib/types";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p-1",
    title: "Cartelera de defensas de grado",
    content: "El cronograma de las próximas defensas con #defensa.",
    authorId: "u-1",
    category: "computacion",
    researchArea: "inteligencia-artificial",
    type: "defensas",
    visibility: "publicado",
    publishedAt: "2026-03-12T10:00:00Z",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
    imageUrl: null,
    ...overrides,
  };
}

const author: AuthorOption = {
  id: "u-1",
  username: "m.rivas",
  fullName: "María Rivas",
};

describe("PostCard", () => {
  it("renders the post title as a link to /posts/:id", () => {
    render(<PostCard post={makePost()} author={author} />);
    const link = screen.getByRole("link", { name: /cartelera de defensas/i });
    expect(link).toHaveAttribute("href", "/posts/p-1");
  });

  it("renders type badge, extracted hashtags and taxonomy line", () => {
    render(<PostCard post={makePost()} author={author} />);
    expect(screen.getByText("Defensas")).toBeInTheDocument(); // type badge
    expect(screen.getByText("#defensa")).toBeInTheDocument(); // hashtag
    expect(screen.getByText("Computación · Inteligencia Artificial")).toBeInTheDocument(); // taxonomy
  });

  it("does NOT render a visibility badge for publicado posts", () => {
    render(<PostCard post={makePost({ visibility: "publicado" })} author={author} />);
    expect(screen.queryByText("Publicado")).not.toBeInTheDocument();
  });

  it("renders a Borrador badge and note for draft posts", () => {
    render(<PostCard post={makePost({ visibility: "borrador" })} author={author} />);
    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByText("Solo tú ves esta publicación.")).toBeInTheDocument();
  });

  it("renders an Oculto badge and note for hidden posts", () => {
    render(<PostCard post={makePost({ visibility: "oculto" })} author={author} />);
    expect(screen.getByText("Oculto")).toBeInTheDocument();
    expect(screen.getByText("Oculta por un administrador.")).toBeInTheDocument();
  });

  it("renders author name and date", () => {
    render(<PostCard post={makePost()} author={author} />);
    expect(screen.getByText(/María Rivas/)).toBeInTheDocument();
  });

  it("degrades gracefully when author is null (shows only date)", () => {
    render(<PostCard post={makePost()} author={null} />);
    // Title should still be visible
    expect(screen.getByText("Cartelera de defensas de grado")).toBeInTheDocument();
    // No author name
    expect(screen.queryByText(/María Rivas/)).not.toBeInTheDocument();
  });

  it("truncates long content to an excerpt", () => {
    const longContent = "a".repeat(300);
    render(<PostCard post={makePost({ content: longContent })} author={author} />);
    const excerpt = screen.getByText(/^a+…$/);
    expect(excerpt.textContent!.length).toBeLessThanOrEqual(185); // 180 + ellipsis
  });
});
