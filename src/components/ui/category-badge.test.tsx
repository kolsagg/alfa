import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBadge } from "./category-badge";

describe("CategoryBadge", () => {
  it("should render icon and label for entertainment category", () => {
    render(<CategoryBadge categoryId="entertainment" />);
    expect(screen.getByText("Eğlence")).toBeInTheDocument();
  });

  it("should render icon and label for productivity category", () => {
    render(<CategoryBadge categoryId="productivity" />);
    expect(screen.getByText("İş")).toBeInTheDocument();
  });

  it("should render other category for undefined categoryId", () => {
    render(<CategoryBadge categoryId={undefined} />);
    expect(screen.getByText("Diğer")).toBeInTheDocument();
  });

  it("should apply colorClass for styling", () => {
    const { container } = render(<CategoryBadge categoryId="health" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-emerald-500/10");
  });

  it("should apply sm size variant", () => {
    const { container } = render(
      <CategoryBadge categoryId="tools" size="sm" />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("px-2");
  });

  it("should apply default size variant", () => {
    const { container } = render(
      <CategoryBadge categoryId="tools" size="default" />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass("text-sm");
    expect(badge).toHaveClass("px-2.5");
  });

  it("should hide label when iconOnly is true", () => {
    render(<CategoryBadge categoryId="education" iconOnly />);
    expect(screen.queryByText("Eğitim")).not.toBeInTheDocument();
  });

  it("should accept custom className", () => {
    const { container } = render(
      <CategoryBadge categoryId="other" className="custom-class" />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass("custom-class");
  });

  it("should render all 6 category types correctly", () => {
    const categories = [
      { id: "entertainment" as const, label: "Eğlence" },
      { id: "productivity" as const, label: "İş" },
      { id: "tools" as const, label: "Araçlar" },
      { id: "education" as const, label: "Eğitim" },
      { id: "health" as const, label: "Sağlık" },
      { id: "other" as const, label: "Diğer" },
    ];

    categories.forEach(({ id, label }) => {
      const { unmount } = render(<CategoryBadge categoryId={id} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
