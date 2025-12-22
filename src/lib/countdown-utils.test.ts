import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTimeRemaining,
  getCountdownUrgency,
  getNextPayment,
  formatCountdown,
  getIntervalMs,
} from "./countdown-utils";
import type { Subscription } from "@/types/subscription";

// Mock current date for consistent testing
const MOCK_NOW = new Date("2025-01-15T12:00:00.000Z");

describe("countdown-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getTimeRemaining", () => {
    it("should calculate correct time remaining for future date", () => {
      const futureDate = new Date("2025-01-17T14:30:00.000Z");
      const result = getTimeRemaining(futureDate, MOCK_NOW);

      expect(result.days).toBe(2);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(0);
      expect(result.isPast).toBe(false);
    });

    it("should return isPast=true for past dates", () => {
      const pastDate = new Date("2025-01-10T00:00:00.000Z");
      const result = getTimeRemaining(pastDate, MOCK_NOW);

      expect(result.isPast).toBe(true);
      expect(result.totalMs).toBe(0);
      expect(result.days).toBe(0);
    });

    it("should handle ISO string input", () => {
      const result = getTimeRemaining("2025-01-16T12:00:00.000Z", MOCK_NOW);
      expect(result.days).toBe(1);
      expect(result.isPast).toBe(false);
    });

    it("should calculate seconds correctly for <1 hour", () => {
      const soon = new Date("2025-01-15T12:45:30.000Z");
      const result = getTimeRemaining(soon, MOCK_NOW);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(45);
      expect(result.seconds).toBe(30);
    });

    it("should return totalMs correctly", () => {
      const oneHourLater = new Date("2025-01-15T13:00:00.000Z");
      const result = getTimeRemaining(oneHourLater, MOCK_NOW);

      expect(result.totalMs).toBe(60 * 60 * 1000);
    });
  });

  describe("getCountdownUrgency", () => {
    it("should return 'critical' for past/zero time", () => {
      expect(getCountdownUrgency(0)).toBe("critical");
      expect(getCountdownUrgency(-1000)).toBe("critical");
    });

    it("should return 'critical' for <1 hour", () => {
      expect(getCountdownUrgency(30 * 60 * 1000)).toBe("critical"); // 30 min
    });

    it("should return 'urgent' for <24 hours but >1 hour", () => {
      expect(getCountdownUrgency(2 * 60 * 60 * 1000)).toBe("urgent"); // 2 hours
      expect(getCountdownUrgency(23 * 60 * 60 * 1000)).toBe("urgent"); // 23 hours
    });

    it("should return 'attention' for <7 days but >24 hours", () => {
      expect(getCountdownUrgency(2 * 24 * 60 * 60 * 1000)).toBe("attention"); // 2 days
      expect(getCountdownUrgency(6 * 24 * 60 * 60 * 1000)).toBe("attention"); // 6 days
    });

    it("should return 'subtle' for 7+ days", () => {
      expect(getCountdownUrgency(8 * 24 * 60 * 60 * 1000)).toBe("subtle"); // 8 days
      expect(getCountdownUrgency(30 * 24 * 60 * 60 * 1000)).toBe("subtle"); // 30 days
    });
  });

  describe("getNextPayment", () => {
    const createSubscription = (
      id: string,
      nextPaymentDate: string,
      isActive = true,
      amount = 100
    ): Subscription => ({
      id,
      name: `Sub ${id}`,
      amount,
      currency: "TRY",
      billingCycle: "monthly",
      nextPaymentDate,
      isActive,
      categoryId: "entertainment",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    it("should return the soonest upcoming payment", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-20T00:00:00.000Z"),
        createSubscription("2", "2025-01-17T00:00:00.000Z"),
        createSubscription("3", "2025-01-25T00:00:00.000Z"),
      ];

      const result = getNextPayment(subscriptions, MOCK_NOW);
      expect(result?.id).toBe("2"); // Jan 17 is soonest
    });

    it("should filter out inactive subscriptions", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-17T00:00:00.000Z", false),
        createSubscription("2", "2025-01-20T00:00:00.000Z", true),
      ];

      const result = getNextPayment(subscriptions, MOCK_NOW);
      expect(result?.id).toBe("2"); // Active one is picked
    });

    it("should filter out past payment dates", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-10T00:00:00.000Z"), // Past
        createSubscription("2", "2025-01-20T00:00:00.000Z"), // Future
      ];

      const result = getNextPayment(subscriptions, MOCK_NOW);
      expect(result?.id).toBe("2");
    });

    it("should use amount as tie-breaker (higher amount first)", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-20T00:00:00.000Z", true, 50),
        createSubscription("2", "2025-01-20T00:00:00.000Z", true, 200),
        createSubscription("3", "2025-01-20T00:00:00.000Z", true, 100),
      ];

      const result = getNextPayment(subscriptions, MOCK_NOW);
      expect(result?.id).toBe("2"); // 200 TL is highest
    });

    it("should return null for empty subscriptions", () => {
      const result = getNextPayment([], MOCK_NOW);
      expect(result).toBeNull();
    });

    it("should return null if all subscriptions are inactive", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-20T00:00:00.000Z", false),
        createSubscription("2", "2025-01-25T00:00:00.000Z", false),
      ];

      const result = getNextPayment(subscriptions, MOCK_NOW);
      expect(result).toBeNull();
    });

    it("should return null if all subscriptions are past due", () => {
      const subscriptions = [
        createSubscription("1", "2025-01-10T00:00:00.000Z"),
        createSubscription("2", "2025-01-05T00:00:00.000Z"),
      ];

      const result = getNextPayment(subscriptions, MOCK_NOW);
      expect(result).toBeNull();
    });
  });

  describe("formatCountdown", () => {
    it("should return 'Bugün!' for past dates", () => {
      const time = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isPast: true,
      };
      expect(formatCountdown(time, "subtle")).toBe("Bugün!");
    });

    it("should format critical (<1h) with HH:MM:SS", () => {
      const time = {
        days: 0,
        hours: 0,
        minutes: 45,
        seconds: 30,
        totalMs: 45 * 60 * 1000,
        isPast: false,
      };
      expect(formatCountdown(time, "critical")).toBe("00:45:30");
    });

    it("should format days and hours for non-critical", () => {
      const time = {
        days: 3,
        hours: 12,
        minutes: 30,
        seconds: 0,
        totalMs: 3.5 * 24 * 60 * 60 * 1000,
        isPast: false,
      };
      expect(formatCountdown(time, "attention")).toBe("3g 12s");
    });

    it("should format hours and minutes when days=0", () => {
      const time = {
        days: 0,
        hours: 5,
        minutes: 30,
        seconds: 0,
        totalMs: 5.5 * 60 * 60 * 1000,
        isPast: false,
      };
      expect(formatCountdown(time, "urgent")).toBe("5s 30d");
    });
  });

  describe("getIntervalMs", () => {
    it("should return 1000ms for critical urgency", () => {
      expect(getIntervalMs("critical")).toBe(1000);
    });

    it("should return 60000ms for other urgencies", () => {
      expect(getIntervalMs("urgent")).toBe(60000);
      expect(getIntervalMs("attention")).toBe(60000);
      expect(getIntervalMs("subtle")).toBe(60000);
    });
  });

  describe("Timezone Handling (AC4 equivalent)", () => {
    it("should handle Istanbul timezone correctly", () => {
      const istanbulNow = new Date("2025-01-15T09:00:00.000+03:00");
      const payment = "2025-01-15T12:00:00.000+03:00"; // 3 hours later
      const result = getTimeRemaining(payment, istanbulNow);

      expect(result.hours).toBe(3);
      expect(result.days).toBe(0);
    });

    it("should handle PST timezone correctly", () => {
      const pstNow = new Date("2025-01-14T20:00:00.000-08:00"); // PST
      const payment = "2025-01-15T08:00:00.000-08:00"; // 12 hours later
      const result = getTimeRemaining(payment, pstNow);

      expect(result.hours).toBe(12);
      expect(result.days).toBe(0);
    });

    it("should handle UTC correctly", () => {
      const utcNow = new Date("2025-01-15T00:00:00.000Z");
      const payment = "2025-01-16T00:00:00.000Z"; // 24 hours later
      const result = getTimeRemaining(payment, utcNow);

      expect(result.days).toBe(1);
      expect(result.hours).toBe(0);
    });
  });
});
