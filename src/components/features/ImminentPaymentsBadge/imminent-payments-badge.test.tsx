/**
 * Tests for ImminentPaymentsBadge Component
 *
 * Story 4.7 Task 5.2: Unit tests for ARIA and Click handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImminentPaymentsBadge } from "./imminent-payments-badge";
import { formatImminentBadgeLabel } from "@/lib/i18n/notifications";

// Mock hooks
const mockImminentPayments = vi.fn(() => ({
  count: 0,
  payments: [] as unknown[],
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

      const { container } = render(<ImminentPaymentsBadge />);
      expect(container.firstChild).toBeNull();
    });

    it("should not render when count is 0", () => {
      mockImminentPayments.mockReturnValue({
        count: 0,
        payments: [],
        imminentDates: [],
        earliestDate: null,
        urgencyLevel: null,
      });

      const { container } = render(<ImminentPaymentsBadge />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when notifications are off and payments are imminent", () => {
      mockImminentPayments.mockReturnValue({
        count: 2,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "attention",
      });

      render(<ImminentPaymentsBadge />);
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

      render(<ImminentPaymentsBadge />);
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

      render(<ImminentPaymentsBadge />);
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

      render(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain("color-critical");
    });

    it("should apply urgent color for urgent urgency", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "urgent",
      });

      render(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain("color-urgent");
    });

    it("should apply attention color for attention urgency", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-26T00:00:00Z",
        urgencyLevel: "attention",
      });

      render(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain("color-attention");
    });
  });

  describe("Click Handler (AC5)", () => {
    it("should set dateFilter to earliest imminent date when clicked", async () => {
      const user = userEvent.setup();
      const earliestDate = "2025-12-24T00:00:00Z";
      mockImminentPayments.mockReturnValue({
        count: 2,
        payments: [],
        imminentDates: [earliestDate],
        earliestDate,
        urgencyLevel: "attention",
      });

      render(<ImminentPaymentsBadge />);
      const badge = screen.getByRole("status");
      await user.click(badge);

      expect(mockSetDateFilter).toHaveBeenCalledWith(earliestDate);
    });

    it("should be a clickable button", () => {
      mockImminentPayments.mockReturnValue({
        count: 1,
        payments: [],
        imminentDates: [],
        earliestDate: "2025-12-24T00:00:00Z",
        urgencyLevel: "attention",
      });

      render(<ImminentPaymentsBadge />);
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

      render(<ImminentPaymentsBadge className="custom-class" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("custom-class");
    });
  });
});
