import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnassignedSpending } from "./unassigned-spending";
import type { SpendingInfo } from "@/lib/spending-calculator";
import type { Subscription } from "@/types/subscription";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * UnassignedSpending Tests
 *
 * Story 6.4: AC3
 */

const mockSpendingSingle: SpendingInfo = {
  totalMonthly: 500,
  currency: "TRY",
  subscriptionCount: 2,
  hasMultipleCurrencies: false,
  byCurrency: { TRY: 500 },
};

const mockSpendingMixed: SpendingInfo = {
  totalMonthly: 0,
  currency: "MIXED",
  subscriptionCount: 3,
  hasMultipleCurrencies: true,
  byCurrency: { TRY: 300, USD: 20 },
};

const mockSpendingEmpty: SpendingInfo = {
  totalMonthly: 0,
  currency: "TRY",
  subscriptionCount: 0,
  hasMultipleCurrencies: false,
  byCurrency: {},
};

const mockSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    name: "Netflix",
    amount: 300,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "#E50914",
  },
  {
    id: "sub-2",
    name: "Spotify",
    amount: 200,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "#1DB954",
  },
];

describe("UnassignedSpending", () => {
  it("renders when there are unassigned subscriptions", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    expect(screen.getByTestId("unassigned-spending")).toBeInTheDocument();
  });

  it("does not render when no unassigned subscriptions", () => {
    render(
      <UnassignedSpending spending={mockSpendingEmpty} subscriptions={[]} />
    );

    expect(screen.queryByTestId("unassigned-spending")).not.toBeInTheDocument();
  });

  it("displays correct title", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    expect(screen.getByTestId("unassigned-title")).toHaveTextContent(
      WALLET_STRINGS.UNASSIGNED_TITLE
    );
  });

  it("displays subscription count", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    expect(screen.getByText("2 abonelik")).toBeInTheDocument();
  });

  it("displays spending amount for single currency", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    expect(screen.getByTestId("unassigned-spending-amount")).toHaveTextContent(
      "₺500"
    );
  });

  it("displays spending amount for mixed currencies", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingMixed}
        subscriptions={mockSubscriptions}
      />
    );

    const amountEl = screen.getByTestId("unassigned-spending-amount");
    expect(amountEl).toHaveTextContent("₺300");
    expect(amountEl).toHaveTextContent("$20");
  });

  it("expands to show details when clicked", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    // Details should not be visible initially
    expect(
      screen.queryByTestId("unassigned-spending-details")
    ).not.toBeInTheDocument();

    // Click toggle
    fireEvent.click(screen.getByTestId("unassigned-spending-toggle"));

    // Details should now be visible
    expect(
      screen.getByTestId("unassigned-spending-details")
    ).toBeInTheDocument();
    expect(
      screen.getByText(WALLET_STRINGS.UNASSIGNED_DESCRIPTION)
    ).toBeInTheDocument();
  });

  it("collapses when clicked again", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    const toggle = screen.getByTestId("unassigned-spending-toggle");

    // Expand
    fireEvent.click(toggle);
    expect(
      screen.getByTestId("unassigned-spending-details")
    ).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggle);
    expect(
      screen.queryByTestId("unassigned-spending-details")
    ).not.toBeInTheDocument();
  });

  it("has accessible aria-label", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
      />
    );

    const toggle = screen.getByTestId("unassigned-spending-toggle");
    expect(toggle).toHaveAttribute(
      "aria-label",
      WALLET_STRINGS.UNASSIGNED_TITLE
    );
  });

  it("applies custom className", () => {
    render(
      <UnassignedSpending
        spending={mockSpendingSingle}
        subscriptions={mockSubscriptions}
        className="custom-class"
      />
    );

    expect(screen.getByTestId("unassigned-spending")).toHaveClass(
      "custom-class"
    );
  });
});
