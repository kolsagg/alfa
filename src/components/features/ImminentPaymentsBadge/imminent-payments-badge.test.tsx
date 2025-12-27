/**
 * Tests for ImminentPaymentsBadge Component
 *
 * Story 4.7 Task 5.2: Unit tests for ARIA and Click handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ImminentPaymentsBadge } from "./imminent-payments-badge";
import { formatImminentBadgeLabel } from "@/lib/i18n/notifications";

// Mock hooks
const mockImminentPayments = vi.fn(() => ({
  count: 0,
  payments: [] as Array<{ id: string; name: string; daysUntil: number }>,
  imminentDates: [] as string[],
  earliestDate: null as string | null,
  urgencyLevel: null as "critical" | "urgent" | "attention" | null,
}));

vi.mock("@/hooks/use-imminent-payments", () => ({
  useImminentPayments: () => mockImminentPayments(),
}));

// Mock settings store
const mockSettings = vi.fn(() => ({
  notificationsEnabled: false,
  notificationPermission: "denied",
}));

vi.mock("@/stores/settings-store", () => ({
  useSettingsStore: () => mockSettings(),
}));

// Mock UI store
const mockSetDateFilter = vi.fn();
vi.mock("@/stores/ui-store", () => ({
  useUIStore: (
    selector: (s: { setDateFilter: typeof mockSetDateFilter }) => unknown
  ) => selector({ setDateFilter: mockSetDateFilter }),
}));

// Mock notification utils
vi.mock("@/lib/notification/utils", () => ({
  isPushNotificationActive: vi.fn(
    (enabled, permission) => enabled && permission === "granted"
  ),
}));

import { isPushNotificationActive } from "@/lib/notification/utils";

// Helper to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("ImminentPaymentsBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.mockReturnValue({
      notificationsEnabled: false,
      notificationPermission: "denied",
    });
    vi.mocked(isPushNotificationActive).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Visibility Rules", () => {
    it("should not render when push notifications are active", () => {
      vi.mocked(isPushNotificationActive).mockReturnValue(true);
      mockImminentPayments.mockReturnValue({
        count: 2,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "attention",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("should not render when count is 0", () => {
      mockImminentPayments.mockReturnValue({
        count: 0,
        payments: [],
        imminentDates: [],
        earliestDate: null,
        urgencyLevel: null,
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("should render when notifications are off and payments are imminent", () => {
      mockImminentPayments.mockReturnValue({
        count: 2,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "attention",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Accessibility (AC5)", () => {
    it("should have role=status for screen readers", () => {
      mockImminentPayments.mockReturnValue({
        count: 3,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "urgent",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    it("should have correct aria-label for screen readers", () => {
      mockImminentPayments.mockReturnValue({
        count: 3,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "urgent",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", formatImminentBadgeLabel(3));
    });
  });

  describe("Urgency Styling (AC5)", () => {
    it("should apply critical color for critical urgency", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-23T00:00:00Z",
        urgencyLevel: "critical",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      // New component uses bg-[var(--color-critical)] pattern
      expect(badge.className).toContain("--color-critical");
    });

    it("should apply urgent color for urgent urgency", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "urgent",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain("--color-urgent");
    });

    it("should apply attention color for attention urgency", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-26T00:00:00Z",
        urgencyLevel: "attention",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain("--color-attention");
    });
  });

  describe("Click Handler (AC5)", () => {
    it("should open popover when clicked", async () => {
      const user = userEvent.setup();
      const earliestDate = "2025-12-24T00:00:00Z";
      mockImminentPayments.mockReturnValue({
        count: 2,
        payments: [
          { id: "1", name: "Netflix", daysUntil: 1 },
          { id: "2", name: "Spotify", daysUntil: 2 },
        ],
        imminentDates: [earliestDate],
        earliestDate,
        urgencyLevel: "attention",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      await user.click(badge);

      // Popover should open and show content
      expect(screen.getByText("Yaklaşan Ödemeler")).toBeInTheDocument();
    });

    it("should be a clickable button", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "attention",
      });

      renderWithRouter(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge.tagName).toBe("BUTTON");
      expect(badge).toHaveAttribute("type", "button");
    });
  });

  describe("Custom className", () => {
    it("should accept custom className", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "attention",
      });

      renderWithRouter(<ImminentPaymentsBadge className="custom-class" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("custom-class");
    });
  });
});
