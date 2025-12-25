import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardVisual } from "./card-visual";
import type { Card } from "@/types/card";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * CardVisual Tests
 *
 * Story 6.2: AC2 - Visual Card Representation
 * Story 6.2b: AC4 - Enhanced with type badge, bank name, conditional cutoff
 * - Glassmorphism styling with OKLCH color
 * - Card Name, Masked digits (**** 1234), formatted Cut-off date
 * - Type badge (Kredi/Banka)
 * - Bank name display
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

  it("renders cut-off date with formatted label for credit cards", () => {
    render(<CardVisual card={mockCreditCard} />);

    const cutoffElement = screen.getByTestId("card-visual-cutoff");
    expect(cutoffElement).toHaveTextContent(
      `${WALLET_STRINGS.CUTOFF_DATE_LABEL}: 15. gün`
    );
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
});
