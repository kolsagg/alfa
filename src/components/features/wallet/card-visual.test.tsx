import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardVisual } from "./card-visual";
import type { Card } from "@/types/card";
import type { SpendingInfo } from "@/lib/spending-calculator";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * CardVisual Tests
 *
 * Story 6.2: AC2 - Visual Card Representation
 * Story 6.2b: AC4 - Enhanced with type badge, bank name, conditional cutoff
 * Story 6.4: AC1, AC2, AC4 - Per-card spending display
 * - Glassmorphism styling with OKLCH color
 * - Card Name, Masked digits (**** 1234), formatted Cut-off date
 * - Type badge (Kredi/Banka)
 * - Bank name display
 * - Spending display with multi-currency support
 * - Privacy Note visibility (NFR06)
 * - Click handler functionality
 */

const mockCreditCard: Card = {
  id: "test-uuid-123",
  name: "Test Kredi Kartı",
  type: "credit",
  lastFourDigits: "4567",
  cutoffDate: 15,
  color: "oklch(0.65 0.2 290)",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDebitCard: Card = {
  id: "test-uuid-debit",
  name: "Test Banka Kartı",
  type: "debit",
  lastFourDigits: "8901",
  bankName: "Garanti",
  color: "oklch(0.5 0.15 150)",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockCardNoColor: Card = {
  ...mockCreditCard,
  id: "test-uuid-456",
  color: undefined,
};

const mockSpendingSingleCurrency: SpendingInfo = {
  totalMonthly: 1500,
  currency: "TRY",
  subscriptionCount: 3,
  hasMultipleCurrencies: false,
  byCurrency: { TRY: 1500 },
};

const mockSpendingMixedCurrency: SpendingInfo = {
  totalMonthly: 0,
  currency: "MIXED",
  subscriptionCount: 2,
  hasMultipleCurrencies: true,
  byCurrency: { TRY: 1200, USD: 40 },
};

const mockSpendingEmpty: SpendingInfo = {
  totalMonthly: 0,
  currency: "TRY",
  subscriptionCount: 0,
  hasMultipleCurrencies: false,
  byCurrency: {},
};

describe("CardVisual", () => {
  it("renders card name correctly", () => {
    render(<CardVisual card={mockCreditCard} />);

    expect(screen.getByTestId("card-visual-name")).toHaveTextContent(
      "Test Kredi Kartı"
    );
  });

  it("renders masked card number with last 4 digits", () => {
    render(<CardVisual card={mockCreditCard} />);

    const numberElement = screen.getByTestId("card-visual-number");
    expect(numberElement).toHaveTextContent("•••• •••• •••• 4567");
  });

  it("renders cutoff day for credit cards (Story 6.4: AC4)", () => {
    render(<CardVisual card={mockCreditCard} />);

    const cutoffElement = screen.getByTestId("card-visual-cutoff");
    expect(cutoffElement).toHaveTextContent(`${WALLET_STRINGS.CUTOFF_DAY}: 15`);
  });

  it("renders privacy note instead of cutoff for debit cards (NFR06)", () => {
    render(<CardVisual card={mockDebitCard} />);

    const privacyNote = screen.getByTestId("card-visual-privacy");
    expect(privacyNote).toHaveTextContent(WALLET_STRINGS.PRIVACY_NOTE);
    expect(screen.queryByTestId("card-visual-cutoff")).not.toBeInTheDocument();
  });

  it("renders card type badge for credit cards", () => {
    render(<CardVisual card={mockCreditCard} />);

    const badge = screen.getByTestId("card-visual-badge");
    expect(badge).toHaveTextContent(WALLET_STRINGS.CARD_BADGE_CREDIT);
  });

  it("renders card type badge for debit cards", () => {
    render(<CardVisual card={mockDebitCard} />);

    const badge = screen.getByTestId("card-visual-badge");
    expect(badge).toHaveTextContent(WALLET_STRINGS.CARD_BADGE_DEBIT);
  });

  it("renders bank name when provided", () => {
    render(<CardVisual card={mockDebitCard} />);

    const bankName = screen.getByTestId("card-visual-bank");
    expect(bankName).toHaveTextContent("Garanti");
  });

  it("does not render bank name when not provided", () => {
    render(<CardVisual card={mockCreditCard} />);

    expect(screen.queryByTestId("card-visual-bank")).not.toBeInTheDocument();
  });

  it("applies custom color to background layer", () => {
    render(<CardVisual card={mockCreditCard} />);

    const colorLayer = screen.getByTestId("card-visual-color-layer");
    expect(colorLayer).toHaveStyle({
      backgroundColor: "oklch(0.65 0.2 290)",
    });
  });

  it("applies default color when card has no color", () => {
    render(<CardVisual card={mockCardNoColor} />);

    const colorLayer = screen.getByTestId("card-visual-color-layer");
    // Default is blue from preset: "oklch(0.6 0.2 250)"
    expect(colorLayer).toHaveStyle({
      backgroundColor: "oklch(0.6 0.2 250)",
    });
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<CardVisual card={mockCreditCard} onClick={handleClick} />);

    const cardButton = screen.getByTestId(`card-visual-${mockCreditCard.id}`);
    fireEvent.click(cardButton);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("has accessible aria-label with card name and last 4 digits", () => {
    render(<CardVisual card={mockCreditCard} />);

    const cardButton = screen.getByRole("button");
    expect(cardButton).toHaveAccessibleName("Test Kredi Kartı - **** 4567");
  });

  it("applies custom className when provided", () => {
    render(<CardVisual card={mockCreditCard} className="custom-class" />);

    const cardButton = screen.getByTestId(`card-visual-${mockCreditCard.id}`);
    expect(cardButton).toHaveClass("custom-class");
  });

  it("has correct aspect ratio class for credit card dimensions", () => {
    render(<CardVisual card={mockCreditCard} />);

    const cardButton = screen.getByTestId(`card-visual-${mockCreditCard.id}`);
    expect(cardButton).toHaveClass("aspect-[1.586]");
  });

  describe("Spending Display (Story 6.4)", () => {
    it("renders spending section when spending prop is provided", () => {
      render(
        <CardVisual
          card={mockCreditCard}
          spending={mockSpendingSingleCurrency}
        />
      );

      expect(screen.getByTestId("card-visual-spending")).toBeInTheDocument();
    });

    it("does not render spending section when spending prop is not provided", () => {
      render(<CardVisual card={mockCreditCard} />);

      expect(
        screen.queryByTestId("card-visual-spending")
      ).not.toBeInTheDocument();
    });

    it("displays single currency spending formatted correctly (AC1)", () => {
      render(
        <CardVisual
          card={mockCreditCard}
          spending={mockSpendingSingleCurrency}
        />
      );

      const spendingEl = screen.getByTestId("card-visual-spending");
      // ₺1.500 (Turkish formatting with dot separator)
      expect(spendingEl).toHaveTextContent("₺1.500");
    });

    it("displays mixed currency spending with + separator (AC2)", () => {
      render(
        <CardVisual
          card={mockCreditCard}
          spending={mockSpendingMixedCurrency}
        />
      );

      const spendingEl = screen.getByTestId("card-visual-spending");
      // "₺1.200 + $40"
      expect(spendingEl).toHaveTextContent("₺1.200");
      expect(spendingEl).toHaveTextContent(
        WALLET_STRINGS.SPENDING_MIXED_CURRENCY
      );
      expect(spendingEl).toHaveTextContent("$40");
    });

    it("displays 'Abonelik yok' when no subscriptions (AC5)", () => {
      render(<CardVisual card={mockCreditCard} spending={mockSpendingEmpty} />);

      const spendingEl = screen.getByTestId("card-visual-spending");
      expect(spendingEl).toHaveTextContent(WALLET_STRINGS.NO_SUBSCRIPTIONS);
    });
  });
});
