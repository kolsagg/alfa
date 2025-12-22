import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionCard } from "./subscription-card";
import type { Subscription } from "@/types/subscription";

// Mock CategoryIcon
vi.mock("@/components/ui/category-badge", () => ({
  CategoryBadge: () => <div data-testid="category-badge" />,
}));

const mockSubscription: Subscription = {
  id: "test-id",
  name: "Netflix",
  amount: 199.99,
  currency: "TRY",
  billingCycle: "monthly",
  nextPaymentDate: "2024-01-01T00:00:00.000Z",
  isActive: true,
  categoryId: "entertainment",
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
};

describe("SubscriptionCard", () => {
  it("should render subscription details correctly", () => {
    render(<SubscriptionCard subscription={mockSubscription} />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    // Currency format depends on locale, using simpler match
    expect(screen.getByText(/199.99/)).toBeInTheDocument();
    expect(screen.getByText("Aylık")).toBeInTheDocument();
  });

  it("should handle custom billing cycle correctly", () => {
    const customSub = {
      ...mockSubscription,
      billingCycle: "custom" as const,
      customDays: 45,
    };

    render(<SubscriptionCard subscription={customSub} />);
    expect(screen.getByText("45 günde bir")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <SubscriptionCard subscription={mockSubscription} onClick={onClick} />
    );

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(mockSubscription);
  });

  it("should handle keyboard interaction", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <SubscriptionCard subscription={mockSubscription} onClick={onClick} />
    );

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledWith(mockSubscription);
  });

  it("should render correct icon and background color", () => {
    const iconSub: Subscription = {
      ...mockSubscription,
      icon: "Tv",
      color: "oklch(0.65 0.2 25)",
    };

    const { container } = render(<SubscriptionCard subscription={iconSub} />);

    // Check if the icon container has the correct background color
    const iconContainer = container.querySelector(
      'div[style*="background-color: oklch(0.65 0.2 25)"]'
    );
    expect(iconContainer).toBeInTheDocument();

    // Check if the Tv icon (part of lucide-react) is rendered
    // Lucide icons usually have a data-lucide attribute or specific classes
    const svg = iconContainer?.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
