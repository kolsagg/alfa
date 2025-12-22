import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryBreakdown } from "./category-breakdown";
import type { Subscription } from "@/types/subscription";

// Fix for Radix UI Select in JSDOM
beforeEach(() => {
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
  if (!window.Element.prototype.hasPointerCapture) {
    window.Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
  if (!window.Element.prototype.setPointerCapture) {
    window.Element.prototype.setPointerCapture = vi.fn();
  }
  if (!window.Element.prototype.releasePointerCapture) {
    window.Element.prototype.releasePointerCapture = vi.fn();
  }
});

const createSubscription = (
  categoryId: string,
  amount: number,
  currency: "TRY" | "USD" | "EUR" = "TRY"
): Subscription => ({
  id: crypto.randomUUID(),
  name: `${categoryId} Sub`,
  amount,
  currency,
  billingCycle: "monthly",
  nextPaymentDate: new Date().toISOString(),
  isActive: true,
  categoryId: categoryId as Subscription["categoryId"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("CategoryBreakdown", () => {
  it("should not render if only 1 category exists (AC3)", () => {
    const subscriptions = [
      createSubscription("entertainment", 100),
      createSubscription("entertainment", 50),
    ];

    const { container } = render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
      />
    );

    // Should render nothing (null)
    expect(container.firstChild).toBeNull();
  });

  it("should render breakdown for multiple categories", () => {
    const subscriptions = [
      createSubscription("entertainment", 100),
      createSubscription("tools", 50),
    ];

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
      />
    );

    expect(screen.getByText("Eğlence")).toBeInTheDocument();
    expect(screen.getByText("Araçlar")).toBeInTheDocument();
  });

  it("should display correct percentages", () => {
    const subscriptions = [
      createSubscription("entertainment", 75),
      createSubscription("tools", 25),
    ];

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
      />
    );

    expect(screen.getByText("%75")).toBeInTheDocument();
    expect(screen.getByText("%25")).toBeInTheDocument();
  });

  it("should have proper ARIA attributes on progress bars (AC4)", () => {
    const subscriptions = [
      createSubscription("entertainment", 75),
      createSubscription("tools", 25),
    ];

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
      />
    );

    const progressbars = screen.getAllByRole("progressbar");
    expect(progressbars.length).toBe(2);

    // Check ARIA attributes
    const entertainmentBar = progressbars.find(
      (bar) => bar.getAttribute("aria-valuenow") === "75"
    );
    expect(entertainmentBar).toBeDefined();
    expect(entertainmentBar?.getAttribute("aria-valuemin")).toBe("0");
    expect(entertainmentBar?.getAttribute("aria-valuemax")).toBe("100");
  });

  it("should call onCategorySelect when a category is clicked", async () => {
    const subscriptions = [
      createSubscription("entertainment", 75),
      createSubscription("tools", 25),
    ];
    const mockOnSelect = vi.fn();

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={mockOnSelect}
      />
    );

    const entertainmentButton = screen.getByRole("button", {
      name: /Eğlence/,
    });
    await userEvent.click(entertainmentButton);

    expect(mockOnSelect).toHaveBeenCalledWith("entertainment");
  });

  it("should deselect category when clicking already selected category", async () => {
    const subscriptions = [
      createSubscription("entertainment", 75),
      createSubscription("tools", 25),
    ];
    const mockOnSelect = vi.fn();

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory="entertainment"
        onCategorySelect={mockOnSelect}
      />
    );

    // Click the already selected category
    const entertainmentButton = screen.getByRole("button", {
      name: /Eğlence/,
    });
    await userEvent.click(entertainmentButton);

    // Should call with null to deselect
    expect(mockOnSelect).toHaveBeenCalledWith(null);
  });

  it("should highlight selected category with aria-pressed", () => {
    const subscriptions = [
      createSubscription("entertainment", 75),
      createSubscription("tools", 25),
    ];

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory="entertainment"
        onCategorySelect={vi.fn()}
      />
    );

    const entertainmentButton = screen.getByRole("button", {
      name: /Eğlence/,
    });
    const toolsButton = screen.getByRole("button", { name: /Araçlar/ });

    expect(entertainmentButton).toHaveAttribute("aria-pressed", "true");
    expect(toolsButton).toHaveAttribute("aria-pressed", "false");
  });

  it("should support keyboard navigation", async () => {
    const subscriptions = [
      createSubscription("entertainment", 75),
      createSubscription("tools", 25),
    ];
    const mockOnSelect = vi.fn();

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={mockOnSelect}
      />
    );

    const entertainmentButton = screen.getByRole("button", {
      name: /Eğlence/,
    });

    // Focus and press Enter
    entertainmentButton.focus();
    await userEvent.keyboard("{Enter}");

    expect(mockOnSelect).toHaveBeenCalledWith("entertainment");
  });

  it("should show separate sections for multiple currencies (AC5)", () => {
    const subscriptions = [
      createSubscription("entertainment", 100, "TRY"),
      createSubscription("tools", 50, "TRY"),
      createSubscription("entertainment", 10, "USD"),
    ];

    render(
      <CategoryBreakdown
        subscriptions={subscriptions}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
      />
    );

    // Should show currency headers
    expect(screen.getByText("TRY Kategorileri")).toBeInTheDocument();
    expect(screen.getByText("USD Kategorileri")).toBeInTheDocument();
  });

  it("should not render for empty subscriptions", () => {
    const { container } = render(
      <CategoryBreakdown
        subscriptions={[]}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
