/// <reference types="@testing-library/jest-dom" />
import { beforeAll, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IconPicker } from "./icon-picker";

describe("IconPicker", () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const mockOnChange = vi.fn();

  it("renders with a placeholder or selected icon", () => {
    render(<IconPicker value="" onChange={mockOnChange} />);
    expect(screen.getByText(/İkon seç/i)).toBeInTheDocument();
  });

  it("shows the selected icon name", () => {
    // Icon value is PascalCase (matching lucide-react icons), label is Turkish
    render(<IconPicker value="Tv" onChange={mockOnChange} />);
    expect(screen.getByText(/Televizyon/i)).toBeInTheDocument();
  });

  it("opens options when clicked", async () => {
    render(<IconPicker value="" onChange={mockOnChange} />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Check if some popular icons are visible in the list (Radix Popover is used now)
    expect(screen.getByTitle("Televizyon")).toBeInTheDocument();
  });

  it("enforces minimum touch target size on trigger", () => {
    render(<IconPicker value="" onChange={mockOnChange} />);
    const trigger = screen.getByRole("combobox");
    // h-11 = 2.75rem = 44px - meets touch target requirements
    expect(trigger).toHaveClass("h-11");
  });

  it("calls onChange when an icon is selected", async () => {
    render(<IconPicker value="" onChange={mockOnChange} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Icons now use title attribute with Turkish label
    const option = screen.getByTitle("Televizyon");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith("Tv");
  });
});
