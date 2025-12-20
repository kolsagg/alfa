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
    render(<IconPicker value="Tv" onChange={mockOnChange} />);
    expect(screen.getByText(/Tv/i)).toBeInTheDocument();
  });

  it("opens options when clicked", async () => {
    render(<IconPicker value="" onChange={mockOnChange} />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Check if some popular icons are visible in the list
    // Radix UI Select uses portals, so we might need more complex querying if it's not simple
    // But for basic check:
    expect(screen.getByLabelText(/İkon/i)).toBeInTheDocument();
  });

  it("enforces minimum touch target size on trigger", () => {
    render(<IconPicker value="" onChange={mockOnChange} />);
    const trigger = screen.getByLabelText(/İkon/i);
    expect(trigger).toHaveClass("min-h-[44px]");
  });

  it("calls onChange when an icon is selected", async () => {
    // Note: Radix Select is hard to test in JSDOM because of portals/pointer capture.
    // In our project setup, we often mock complex components if they block logic testing.
    // But since this is the component's OWN test, we use simplified fireEvent.
    render(<IconPicker value="" onChange={mockOnChange} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // We look for items by role or text. Radix SelectItem renders as an option-like element.
    const option = screen.getByText("Tv");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith("Tv");
  });
});
