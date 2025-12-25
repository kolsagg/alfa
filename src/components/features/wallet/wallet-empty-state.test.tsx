/**
 * WalletEmptyState Component Tests
 *
 * Story 8.8: AC2, AC3, AC4 validation
 * Story 6.2: AC5 - Add Card CTA
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { WalletEmptyState } from "./wallet-empty-state";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

describe("WalletEmptyState", () => {
  describe("AC2: Standardized Empty State", () => {
    it("renders centered Wallet icon", () => {
      const { container } = render(<WalletEmptyState />);

      // Icon should be present (lucide-react Wallet)
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("displays empty state title from i18n", () => {
      render(<WalletEmptyState />);

      expect(screen.getByTestId("wallet-empty-title")).toHaveTextContent(
        WALLET_STRINGS.EMPTY_TITLE
      );
    });

    it("displays empty state description from i18n", () => {
      render(<WalletEmptyState />);

      expect(screen.getByTestId("wallet-empty-description")).toHaveTextContent(
        WALLET_STRINGS.EMPTY_DESCRIPTION
      );
    });

    it("uses project-standard styling with rounded containers", () => {
      render(<WalletEmptyState />);

      const section = screen.getByTestId("wallet-empty-state");
      expect(section).toHaveClass("rounded-2xl");
      expect(section).toHaveClass("border");
      expect(section).toHaveClass("bg-muted/20");
    });
  });

  describe("AC5: Add Card CTA", () => {
    it("renders Add First Card button", () => {
      render(<WalletEmptyState />);

      const button = screen.getByTestId("wallet-empty-add-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(WALLET_STRINGS.ADD_FIRST_CARD);
    });

    it("calls onAddCard when button is clicked", () => {
      const handleAddCard = vi.fn();
      render(<WalletEmptyState onAddCard={handleAddCard} />);

      const button = screen.getByTestId("wallet-empty-add-button");
      fireEvent.click(button);

      expect(handleAddCard).toHaveBeenCalledTimes(1);
    });

    it("button has accessible label", () => {
      render(<WalletEmptyState />);

      const button = screen.getByTestId("wallet-empty-add-button");
      expect(button).toHaveAccessibleName(WALLET_STRINGS.ADD_FIRST_CARD);
    });

    it("button has min-height for touch targets", () => {
      render(<WalletEmptyState />);

      const button = screen.getByTestId("wallet-empty-add-button");
      expect(button).toHaveClass("min-h-[44px]");
    });
  });

  describe("AC4: Accessibility", () => {
    it("has proper aria attributes", () => {
      render(<WalletEmptyState />);

      const section = screen.getByTestId("wallet-empty-state");
      expect(section).toHaveAttribute("role", "status");
      expect(section).toHaveAttribute("aria-live", "polite");
      expect(section).toHaveAttribute("aria-label", WALLET_STRINGS.EMPTY_TITLE);
    });

    it("has data-testid for all interactive elements", () => {
      render(<WalletEmptyState />);

      expect(screen.getByTestId("wallet-empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("wallet-empty-title")).toBeInTheDocument();
      expect(
        screen.getByTestId("wallet-empty-description")
      ).toBeInTheDocument();
      expect(screen.getByTestId("wallet-empty-add-button")).toBeInTheDocument();
    });

    it("has h2 heading for title", () => {
      render(<WalletEmptyState />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent(WALLET_STRINGS.EMPTY_TITLE);
    });
  });
});
