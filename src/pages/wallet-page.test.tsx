/**
 * WalletPage Tests
 *
 * Story 8.8: Task 4 - Quality & Testing
 * Story 6.2: Card Management UI Integration
 * AC1: Enhanced Wallet Page Layout with Card List
 * AC2: Standardized Empty State with CTA
 * AC3: i18n Integration
 * AC4: Accessibility & SEO
 * AC5: Empty State Add Card CTA
 * AC6: Performance with Zustand selectors
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import WalletPage from "./wallet-page";
import { useCardStore } from "@/stores/card-store";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import type { Card } from "@/types/card";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Render helper with router context
const renderWithRouter = (component: ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Mock card for testing (credit card with cutoff date)
const mockCard: Card = {
  id: "test-card-id-1",
  name: "Test Kartı",
  type: "credit",
  lastFourDigits: "4567",
  cutoffDate: 15,
  color: "oklch(0.65 0.2 290)",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("WalletPage", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
    // Reset store before each test
    useCardStore.setState({ cards: [] });
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.title = originalTitle;
    vi.restoreAllMocks();
  });

  describe("AC1: Enhanced Wallet Page Layout", () => {
    it("renders page with correct data-testid", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.getByTestId("wallet-page")).toBeInTheDocument();
    });

    it("displays page title 'Cüzdan'", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.getByTestId("wallet-page-title")).toHaveTextContent(
        WALLET_STRINGS.WALLET_TITLE
      );
    });

    it("displays page description", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.getByTestId("wallet-page-description")).toHaveTextContent(
        WALLET_STRINGS.WALLET_DESCRIPTION
      );
    });

    it("uses correct layout spacing class", () => {
      renderWithRouter(<WalletPage />);

      const page = screen.getByTestId("wallet-page");
      expect(page).toHaveClass("space-y-6");
      expect(page).toHaveClass("px-4");
      expect(page).toHaveClass("pt-2");
    });

    it("renders header with proper structure", () => {
      renderWithRouter(<WalletPage />);

      const header = screen.getByTestId("wallet-header");
      expect(header).toBeInTheDocument();
    });
  });

  describe("AC2: Empty State (No Cards)", () => {
    it("renders WalletEmptyState when no cards exist", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.getByTestId("wallet-empty-state")).toBeInTheDocument();
    });

    it("does not render CardList when no cards exist", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.queryByTestId("card-list")).not.toBeInTheDocument();
    });

    it("does not render header Add button when no cards exist", () => {
      renderWithRouter(<WalletPage />);

      expect(
        screen.queryByTestId("wallet-header-add-button")
      ).not.toBeInTheDocument();
    });
  });

  describe("AC3: Card List (With Cards)", () => {
    beforeEach(() => {
      useCardStore.setState({ cards: [mockCard] });
    });

    it("renders CardList when cards exist", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.getByTestId("card-list")).toBeInTheDocument();
    });

    it("does not render empty state when cards exist", () => {
      renderWithRouter(<WalletPage />);

      expect(
        screen.queryByTestId("wallet-empty-state")
      ).not.toBeInTheDocument();
    });

    it("renders CardList component which provides add functionality", () => {
      renderWithRouter(<WalletPage />);

      // CardList component handles its own add button/flow now
      expect(screen.getByTestId("card-list")).toBeInTheDocument();
    });

    it("displays card visual in the list", () => {
      renderWithRouter(<WalletPage />);

      expect(
        screen.getByTestId(`card-visual-${mockCard.id}`)
      ).toBeInTheDocument();
    });
  });

  describe("AC5: Add Card Flow", () => {
    it("opens add dialog when empty state CTA clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter(<WalletPage />);

      await user.click(screen.getByTestId("wallet-empty-add-button"));

      await waitFor(() => {
        expect(screen.getByTestId("card-form-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("card-form-title")).toHaveTextContent(
          WALLET_STRINGS.ADD_CARD
        );
      });
    });

    it("dialog form shows add mode when opened from empty state", async () => {
      const user = userEvent.setup();
      renderWithRouter(<WalletPage />);

      await user.click(screen.getByTestId("wallet-empty-add-button"));

      await waitFor(() => {
        // Verify it's in add mode
        expect(screen.getByTestId("card-form-title")).toHaveTextContent(
          WALLET_STRINGS.ADD_CARD
        );
      });
    });
  });

  describe("AC6: NFR06 Privacy Note Visibility", () => {
    it("privacy note visible in empty state CTA flow", async () => {
      const user = userEvent.setup();
      renderWithRouter(<WalletPage />);

      await user.click(screen.getByTestId("wallet-empty-add-button"));

      await waitFor(() => {
        expect(screen.getByTestId("card-form-privacy-note")).toHaveTextContent(
          WALLET_STRINGS.PRIVACY_NOTE
        );
      });
    });

    it("cutoff date visible on credit card visual", () => {
      useCardStore.setState({ cards: [mockCard] });
      renderWithRouter(<WalletPage />);

      // Credit cards show cutoff date, not privacy note
      expect(screen.getByTestId("card-visual-cutoff")).toBeInTheDocument();
    });
  });

  describe("i18n Integration", () => {
    it("all text sourced from wallet.ts i18n file", () => {
      renderWithRouter(<WalletPage />);

      // Page header text
      expect(screen.getByText(WALLET_STRINGS.WALLET_TITLE)).toBeInTheDocument();
      expect(
        screen.getByText(WALLET_STRINGS.WALLET_DESCRIPTION)
      ).toBeInTheDocument();

      // Empty state text
      expect(screen.getByText(WALLET_STRINGS.EMPTY_TITLE)).toBeInTheDocument();
      expect(
        screen.getByText(WALLET_STRINGS.EMPTY_DESCRIPTION)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility & SEO", () => {
    it("updates document.title on navigation", () => {
      renderWithRouter(<WalletPage />);

      expect(document.title).toBe("Cüzdan | SubTracker");
    });

    it("restores original document.title on unmount", () => {
      const { unmount } = renderWithRouter(<WalletPage />);
      expect(document.title).toBe("Cüzdan | SubTracker");

      unmount();
      expect(document.title).toBe(originalTitle);
    });

    it("has correct heading hierarchy with h1", () => {
      renderWithRouter(<WalletPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(WALLET_STRINGS.WALLET_TITLE);
    });

    it("empty state has h2 heading (proper hierarchy)", () => {
      renderWithRouter(<WalletPage />);

      const headings = screen.getAllByRole("heading");
      const h1s = headings.filter((h) => h.tagName === "H1");
      const h2s = headings.filter((h) => h.tagName === "H2");

      expect(h1s).toHaveLength(1);
      expect(h2s).toHaveLength(1);
    });

    it("interactive elements have data-testid", () => {
      renderWithRouter(<WalletPage />);

      // All testable elements should be present
      expect(screen.getByTestId("wallet-page")).toBeInTheDocument();
      expect(screen.getByTestId("wallet-header")).toBeInTheDocument();
      expect(screen.getByTestId("wallet-page-title")).toBeInTheDocument();
      expect(screen.getByTestId("wallet-page-description")).toBeInTheDocument();
      expect(screen.getByTestId("wallet-empty-state")).toBeInTheDocument();
    });

    it("empty state Add Card button has accessible label", () => {
      renderWithRouter(<WalletPage />);

      // In new design, add is only via empty state when no cards
      const addButton = screen.getByTestId("wallet-empty-add-button");
      expect(addButton).toHaveAccessibleName(WALLET_STRINGS.ADD_FIRST_CARD);
    });
  });
});
