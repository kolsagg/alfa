import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startOfDay } from "date-fns";
import {
  getDaysUntilPayment,
  formatDaysRemaining,
  getUrgencyLevel,
  sortByPaymentDate,
  getUpcomingPayments,
} from "./timeline-utils";
import type { Subscription } from "@/types/subscription";

// Mock current date for consistent testing
const MOCK_TODAY = new Date("2025-01-15T12:00:00.000Z");

describe("timeline-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getDaysUntilPayment", () => {
    it("should return positive days for future payments", () => {
      const futureDate = new Date("2025-01-20T00:00:00.000Z");
      expect(getDaysUntilPayment(futureDate)).toBe(5);
    });

    it("should return negative days for past due payments", () => {
      const pastDate = new Date("2025-01-10T00:00:00.000Z");
      expect(getDaysUntilPayment(pastDate)).toBe(-5);
    });

    it("should return 0 for today", () => {
      const today = new Date("2025-01-15T00:00:00.000Z");
      expect(getDaysUntilPayment(today)).toBe(0);
    });

    it("should handle ISO string input", () => {
      expect(getDaysUntilPayment("2025-01-20T00:00:00.000Z")).toBe(5);
    });

    it("should use startOfDay for accurate day boundaries", () => {
      // Payment on Jan 17 should be 2 days from Jan 15 (startOfDay comparison)
      const futurePayment = new Date("2025-01-17T00:00:00.000Z");
      expect(getDaysUntilPayment(futurePayment)).toBe(2);
    });
  });

  describe("formatDaysRemaining", () => {
    it("should format past due days", () => {
      expect(formatDaysRemaining(-3)).toBe("3 gün gecikti");
    });

    it("should return 'Bugün' for 0 days", () => {
      expect(formatDaysRemaining(0)).toBe("Bugün");
    });

    it("should return 'Yarın' for 1 day", () => {
      expect(formatDaysRemaining(1)).toBe("Yarın");
    });

    it("should format future days", () => {
      expect(formatDaysRemaining(5)).toBe("5 gün sonra");
    });
  });

  describe("getUrgencyLevel", () => {
    it("should return 'critical' for past due", () => {
      expect(getUrgencyLevel(-1)).toBe("critical");
    });

    it("should return 'critical' for today", () => {
      expect(getUrgencyLevel(0)).toBe("critical");
    });

    it("should return 'urgent' for 1-2 days", () => {
      expect(getUrgencyLevel(1)).toBe("urgent");
      expect(getUrgencyLevel(2)).toBe("urgent");
    });

    it("should return 'attention' for 3-7 days", () => {
      expect(getUrgencyLevel(3)).toBe("attention");
      expect(getUrgencyLevel(5)).toBe("attention");
      expect(getUrgencyLevel(7)).toBe("attention");
    });

    it("should return 'subtle' for 8+ days", () => {
      expect(getUrgencyLevel(8)).toBe("subtle");
    });

    it("should return 'subtle' for 30+ days", () => {
      expect(getUrgencyLevel(30)).toBe("subtle");
    });
  });

  describe("sortByPaymentDate", () => {
    const createSubscription = (
      id: string,
      nextPaymentDate: string
    ): Subscription => ({
      id,
      name: `Sub ${id}`,
      amount: 100,
      currency: "TRY",
      billingCycle: "monthly",
      nextPaymentDate,
      isActive: true,
      categoryId: "entertainment",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    it("should separate past due and upcoming payments", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-10T00:00:00.000Z"), // Past due
        createSubscription("2", "2025-01-20T00:00:00.000Z"), // Upcoming
        createSubscription("3", "2025-01-05T00:00:00.000Z"), // Past due
      ];

      const result = sortByPaymentDate(subscriptions);

      expect(result.pastDue).toHaveLength(2);
      expect(result.upcoming).toHaveLength(1);
    });

    it("should sort past due chronologically (oldest first)", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-10T00:00:00.000Z"),
        createSubscription("2", "2025-01-05T00:00:00.000Z"),
      ];

      const result = sortByPaymentDate(subscriptions);

      expect(result.pastDue[0].id).toBe("2"); // Jan 5 first
      expect(result.pastDue[1].id).toBe("1"); // Jan 10 second
    });

    it("should sort upcoming chronologically (soonest first)", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-25T00:00:00.000Z"),
        createSubscription("2", "2025-01-20T00:00:00.000Z"),
      ];

      const result = sortByPaymentDate(subscriptions);

      expect(result.upcoming[0].id).toBe("2"); // Jan 20 first
      expect(result.upcoming[1].id).toBe("1"); // Jan 25 second
    });

    it("should handle today as upcoming (not past due)", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-15T00:00:00.000Z"), // Today
      ];

      const result = sortByPaymentDate(subscriptions);

      expect(result.pastDue).toHaveLength(0);
      expect(result.upcoming).toHaveLength(1);
    });
  });

  describe("getUpcomingPayments", () => {
    const createSubscription = (
      id: string,
      nextPaymentDate: string
    ): Subscription => ({
      id,
      name: `Sub ${id}`,
      amount: 100,
      currency: "TRY",
      billingCycle: "monthly",
      nextPaymentDate,
      isActive: true,
      categoryId: "entertainment",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    it("should enrich subscriptions with daysUntil and urgency", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-20T00:00:00.000Z"),
      ];

      const result = getUpcomingPayments(subscriptions);

      expect(result.upcoming[0].daysUntil).toBe(5);
      expect(result.upcoming[0].urgency).toBe("attention"); // 5 days is in attention range (3-7)
    });

    it("should correctly classify past due items", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-10T00:00:00.000Z"),
      ];

      const result = getUpcomingPayments(subscriptions);

      expect(result.pastDue[0].daysUntil).toBe(-5);
      expect(result.pastDue[0].urgency).toBe("critical");
    });

    it("should handle empty subscriptions", () => {
      const result = getUpcomingPayments([]);

      expect(result.pastDue).toHaveLength(0);
      expect(result.upcoming).toHaveLength(0);
    });
  });

  describe("AC4: Timezone Handling", () => {
    // Note: In a real environment, we'd use a library or specific TZ mocking.
    // Here we simulate different "current times" as if the system was in that TZ at the same moment.

    it("should handle payments correctly in Istanbul (UTC+3)", () => {
      // Istanbul morning: 2025-01-15 09:00:00 (UTC+3) -> UTC: 06:00
      const istanbulTime = new Date("2025-01-15T06:00:00.000Z");
      vi.setSystemTime(istanbulTime);

      const paymentDate = "2025-01-15T01:00:00.000Z"; // Payment happened earlier in UTC but same local day
      expect(getDaysUntilPayment(paymentDate)).toBe(0); // Should be "Today"
    });

    it("should handle payments correctly in PST (UTC-8)", () => {
      // PST evening: 2025-01-14 20:00:00 (UTC-8)
      // We simulate Jan 14 local by creating Jan 14 UTC startOfDay
      const pstTodayLocal = startOfDay(new Date("2025-01-14T00:00:00.000Z"));

      const paymentDate = "2025-01-15T08:00:00.000Z"; // This is Jan 15th
      expect(getDaysUntilPayment(paymentDate, pstTodayLocal)).toBe(1); // Difference is 1 day
    });

    it("should handle DST transitions (Simulated)", () => {
      // Mocking a date right before DST shift
      const beforeDST = new Date("2025-03-30T01:00:00.000Z");
      vi.setSystemTime(beforeDST);

      const afterDST = "2025-03-31T01:00:00.000Z";
      expect(getDaysUntilPayment(afterDST)).toBe(1);
    });
  });
});
