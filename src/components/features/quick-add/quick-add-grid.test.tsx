import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickAddGrid } from "./quick-add-grid";
import { QUICK_ADD_SERVICES } from "@/config/quick-add-services";

describe("QuickAddGrid", () => {
  it("renders all 8 quick-add services", () => {
    render(<QuickAddGrid onSelect={vi.fn()} />);

    // All 8 services should be rendered
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByText("iCloud")).toBeInTheDocument();
    expect(screen.getByText("Adobe Creative Cloud")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT Plus")).toBeInTheDocument();
    expect(screen.getByText("GitHub Pro")).toBeInTheDocument();
    expect(screen.getByText("YouTube Premium")).toBeInTheDocument();
    expect(screen.getByText("Amazon Prime")).toBeInTheDocument();
  });

  it("calls onSelect with correct service when tile is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<QuickAddGrid onSelect={onSelect} />);

    await user.click(screen.getByText("Netflix"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "netflix",
        name: "Netflix",
        categoryId: "entertainment",
      })
    );
  });

  it("renders custom subscription button when onCustomClick is provided", () => {
    render(<QuickAddGrid onSelect={vi.fn()} onCustomClick={vi.fn()} />);

    expect(screen.getByText(/özel abonelik ekle/i)).toBeInTheDocument();
  });

  it("does not render custom button when onCustomClick is not provided", () => {
    render(<QuickAddGrid onSelect={vi.fn()} />);

    expect(screen.queryByText(/özel abonelik ekle/i)).not.toBeInTheDocument();
  });

  it("calls onCustomClick when custom button is clicked", async () => {
    const user = userEvent.setup();
    const onCustomClick = vi.fn();

    render(<QuickAddGrid onSelect={vi.fn()} onCustomClick={onCustomClick} />);

    await user.click(screen.getByText(/özel abonelik ekle/i));

    expect(onCustomClick).toHaveBeenCalledTimes(1);
  });

  it("has responsive grid layout classes", () => {
    const { container } = render(<QuickAddGrid onSelect={vi.fn()} />);

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-2");
    expect(grid).toHaveClass("sm:grid-cols-3");
    expect(grid).toHaveClass("lg:grid-cols-4");
  });

  it("disables all tiles when disabled is true", () => {
    render(
      <QuickAddGrid onSelect={vi.fn()} onCustomClick={vi.fn()} disabled />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("all tiles are focusable via keyboard", async () => {
    const user = userEvent.setup();
    render(<QuickAddGrid onSelect={vi.fn()} />);

    // Tab through all tiles
    for (let i = 0; i < QUICK_ADD_SERVICES.length; i++) {
      await user.tab();
      expect(document.activeElement).toHaveRole("button");
    }
  });

  it("renders correct number of tiles", () => {
    render(<QuickAddGrid onSelect={vi.fn()} />);

    // 8 service tiles
    const tiles = screen.getAllByRole("button", { name: /aboneliği ekle/i });
    expect(tiles).toHaveLength(8);
  });
});
