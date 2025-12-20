/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  const mockOnChange = vi.fn();

  it("renders all preset colors", () => {
    render(<ColorPicker value="" onChange={mockOnChange} />);

    // 8 presets defined in requirements
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(8);
  });

  it("calls onChange when a color is clicked", () => {
    render(<ColorPicker value="" onChange={mockOnChange} />);

    const secondColor = screen.getAllByRole("button")[1];
    fireEvent.click(secondColor);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("highlights the selected color", () => {
    const selectedValue = "var(--color-primary)";
    render(<ColorPicker value={selectedValue} onChange={mockOnChange} />);

    const selectedButton = screen.getByLabelText(/Turkuaz/i);
    expect(selectedButton).toHaveClass("ring-2");
  });

  it("has accessible labels for all colors", () => {
    render(<ColorPicker value="" onChange={mockOnChange} />);

    expect(screen.getByLabelText(/^Turkuaz$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mercan$/i)).toBeInTheDocument();
  });

  it("enforces minimum touch target size", () => {
    render(<ColorPicker value="" onChange={mockOnChange} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("min-h-[44px]");
    });
  });
});
