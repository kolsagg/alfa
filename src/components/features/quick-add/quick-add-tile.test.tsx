import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickAddTile } from "./quick-add-tile";
import type { QuickAddService } from "@/config/quick-add-services";
import { Tv } from "lucide-react";

const mockService: QuickAddService = {
  id: "netflix",
  name: "Netflix",
  iconName: "Tv",
  Icon: Tv,
  categoryId: "entertainment",
};

describe("QuickAddTile", () => {
  it("renders service name and icon", () => {
    render(<QuickAddTile service={mockService} onSelect={vi.fn()} />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
  });

  it("calls onSelect with service when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<QuickAddTile service={mockService} onSelect={onSelect} />);

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(mockService);
  });

  it("has minimum 44px touch target", () => {
    render(<QuickAddTile service={mockService} onSelect={vi.fn()} />);

    const tile = screen.getByRole("button");

    // Check classes are applied (jsdom doesn't compute actual pixels)
    expect(tile.className).toContain("min-h-[44px]");
    expect(tile.className).toContain("min-w-[44px]");
  });

  it("is accessible with proper aria-label", () => {
    render(<QuickAddTile service={mockService} onSelect={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /netflix aboneliği ekle/i })
    ).toBeInTheDocument();
  });

  it("activates on Enter key", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<QuickAddTile service={mockService} onSelect={onSelect} />);

    const tile = screen.getByRole("button");
    tile.focus();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith(mockService);
  });

  it("activates on Space key", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<QuickAddTile service={mockService} onSelect={onSelect} />);

    const tile = screen.getByRole("button");
    tile.focus();
    await user.keyboard(" ");

    expect(onSelect).toHaveBeenCalledWith(mockService);
  });

  it("is disabled when disabled prop is true", () => {
    render(<QuickAddTile service={mockService} onSelect={vi.fn()} disabled />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
