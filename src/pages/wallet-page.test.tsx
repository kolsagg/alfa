/**
 * WalletPage Tests
 *
 * Story 8.8: Task 4 - Quality & Testing
 * AC1: Enhanced Wallet Page Layout
 * AC2: Standardized Empty State
 * AC3: i18n Integration
 * AC4: Accessibility & SEO
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import WalletPage from "./wallet-page";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

// Render helper with router context
const renderWithRouter = (component: ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("WalletPage", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
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

    it("uses correct layout spacing class (AC1, H2)", () => {
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
      expect(header).toHaveClass("space-y-1");
    });
  });

  describe("AC2: Standardized Empty State", () => {
    it("renders WalletEmptyState component", () => {
      renderWithRouter(<WalletPage />);

      expect(screen.getByTestId("wallet-empty-state")).toBeInTheDocument();
    });

    it("displays Coming Soon badge", () => {
      renderWithRouter(<WalletPage />);

      expect(
        screen.getByTestId("wallet-coming-soon-badge")
      ).toBeInTheDocument();
    });
  });

  describe("AC3: i18n Integration", () => {
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
      expect(
        screen.getByText(WALLET_STRINGS.COMING_SOON_BADGE)
      ).toBeInTheDocument();
    });
  });

  describe("AC4: Accessibility & SEO", () => {
    it("updates document.title on navigation", () => {
      renderWithRouter(<WalletPage />);

      expect(document.title).toBe("Cüzdan | SubTracker");
    });

    it("restores original document.title on unmount (H1, M3 Fix)", () => {
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
  });
});
