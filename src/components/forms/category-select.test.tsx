import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategorySelect } from "./category-select";

describe("CategorySelect", () => {
  it("should render with placeholder", () => {
    render(<CategorySelect onValueChange={vi.fn()} />);
    expect(screen.getByText("Kategori seç...")).toBeInTheDocument();
  });

  it("should render with custom placeholder", () => {
    render(
      <CategorySelect
        onValueChange={vi.fn()}
        placeholder="Bir kategori seçin"
      />
    );
    expect(screen.getByText("Bir kategori seçin")).toBeInTheDocument();
  });

  it("should display selected value", () => {
    render(<CategorySelect value="entertainment" onValueChange={vi.fn()} />);
    expect(screen.getByText("Eğlence")).toBeInTheDocument();
  });

  it("should render label when provided", () => {
    render(<CategorySelect onValueChange={vi.fn()} label="Kategori" />);
    expect(screen.getByText("Kategori")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<CategorySelect onValueChange={vi.fn()} disabled />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  // Note: Radix Select interactions don't work well in jsdom due to pointer capture API
  // These would be better tested with Playwright E2E tests
  it.skip("should call onValueChange when option is selected", async () => {
    // Skipped: jsdom doesn't support hasPointerCapture for Radix Select
  });

  it.skip("should list all 6 category options when opened", async () => {
    // Skipped: jsdom doesn't support hasPointerCapture for Radix Select
  });

  it("should accept custom className", () => {
    const { container } = render(
      <CategorySelect onValueChange={vi.fn()} className="custom-class" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should show correct label for each category value", () => {
    // Test that the component renders correctly for each value
    const categories = [
      { value: "entertainment" as const, label: "Eğlence" },
      { value: "productivity" as const, label: "İş" },
      { value: "tools" as const, label: "Araçlar" },
      { value: "education" as const, label: "Eğitim" },
      { value: "health" as const, label: "Sağlık" },
      { value: "other" as const, label: "Diğer" },
    ];

    categories.forEach(({ value, label }) => {
      const { unmount } = render(
        <CategorySelect value={value} onValueChange={vi.fn()} />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
