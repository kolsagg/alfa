import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CategoryIcon } from "./category-icon";

describe("CategoryIcon", () => {
  it("should render icon for entertainment category", () => {
    const { container } = render(<CategoryIcon categoryId="entertainment" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render icon for productivity category", () => {
    const { container } = render(<CategoryIcon categoryId="productivity" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render other icon for undefined categoryId", () => {
    const { container } = render(<CategoryIcon categoryId={undefined} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply custom size", () => {
    const { container } = render(
      <CategoryIcon categoryId="health" size={24} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("should apply default size of 16", () => {
    const { container } = render(<CategoryIcon categoryId="tools" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CategoryIcon categoryId="education" className="text-red-500" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
  });

  it("should have shrink-0 class by default", () => {
    const { container } = render(<CategoryIcon categoryId="other" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("shrink-0");
  });

  it("should have aria-hidden attribute", () => {
    const { container } = render(<CategoryIcon categoryId="entertainment" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render correct icon for each category", () => {
    const categories = [
      "entertainment",
      "productivity",
      "tools",
      "education",
      "health",
      "other",
    ] as const;

    categories.forEach((categoryId) => {
      const { container, unmount } = render(
        <CategoryIcon categoryId={categoryId} />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      unmount();
    });
  });
});
