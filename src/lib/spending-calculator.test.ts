import { describe, it, expect } from "vitest";
import {
  normalizeToMonthly,
  calculateCardSpending,
  calculateUnassignedSpending,
  type SpendingInfo,
} from "./spending-calculator";
import type { Subscription } from "@/types/subscription";

/**
 * Spending Calculator Tests
 *
 * Story 6.4: Task 1.2
 * - Tests all billing cycle normalization
 * - Tests mixed currency scenarios
 * - Tests unassigned subscription handling
 */

// Helper to create a test subscription
function createSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  const now = new Date().toISOString();
  return {
    id: overrides.id || "test-sub-1",
    name: overrides.name || "Test Sub",
    amount: overrides.amount ?? 100,
    currency: overrides.currency || "TRY",
    billingCycle: overrides.billingCycle || "monthly",
    nextPaymentDate: overrides.nextPaymentDate || now,
    isActive: overrides.isActive ?? true,
    createdAt: now,
    updatedAt: now,
    categoryId: overrides.categoryId,
    cardId: overrides.cardId,
    customDays: overrides.customDays,
    color: overrides.color,
    icon: overrides.icon,
  };
}

describe("normalizeToMonthly", () => {
  describe("monthly billing cycle", () => {
    it("returns amount unchanged for monthly subscriptions", () => {
      const sub = createSubscription({ amount: 100, billingCycle: "monthly" });
      expect(normalizeToMonthly(sub)).toBe(100);
    });

    it("handles decimal amounts", () => {
      const sub = createSubscription({
        amount: 99.99,
        billingCycle: "monthly",
      });
      expect(normalizeToMonthly(sub)).toBe(99.99);
    });
  });

  describe("yearly billing cycle", () => {
    it("divides yearly amount by 12", () => {
      const sub = createSubscription({ amount: 1200, billingCycle: "yearly" });
      expect(normalizeToMonthly(sub)).toBe(100);
    });

    it("handles non-divisible amounts", () => {
      const sub = createSubscription({ amount: 100, billingCycle: "yearly" });
      expect(normalizeToMonthly(sub)).toBeCloseTo(8.333, 2);
    });
  });

  describe("weekly billing cycle", () => {
    it("multiplies weekly by 4.348 factor", () => {
      const sub = createSubscription({ amount: 10, billingCycle: "weekly" });
      // 10 * (365.25 / 12 / 7) ≈ 43.48
      expect(normalizeToMonthly(sub)).toBeCloseTo(43.48, 1);
    });

    it("correctly calculates weekly to monthly conversion", () => {
      const sub = createSubscription({ amount: 25, billingCycle: "weekly" });
      // 25 * 4.348 ≈ 108.7
      expect(normalizeToMonthly(sub)).toBeCloseTo(108.7, 0);
    });
  });

  describe("custom billing cycle", () => {
    it("calculates monthly equivalent for 30-day cycle", () => {
      const sub = createSubscription({
        amount: 100,
        billingCycle: "custom",
        customDays: 30,
      });
      // 100 * (30 / 30) = 100
      expect(normalizeToMonthly(sub)).toBe(100);
    });

    it("calculates monthly equivalent for 15-day cycle", () => {
      const sub = createSubscription({
        amount: 50,
        billingCycle: "custom",
        customDays: 15,
      });
      // 50 * (30 / 15) = 100
      expect(normalizeToMonthly(sub)).toBe(100);
    });

    it("calculates monthly equivalent for 60-day cycle", () => {
      const sub = createSubscription({
        amount: 100,
        billingCycle: "custom",
        customDays: 60,
      });
      // 100 * (30 / 60) = 50
      expect(normalizeToMonthly(sub)).toBe(50);
    });

    it("falls back to amount if customDays is undefined", () => {
      const sub = createSubscription({
        amount: 100,
        billingCycle: "custom",
        customDays: undefined,
      });
      expect(normalizeToMonthly(sub)).toBe(100);
    });

    it("falls back to amount if customDays is 0", () => {
      const sub = createSubscription({
        amount: 100,
        billingCycle: "custom",
        customDays: 0,
      });
      expect(normalizeToMonthly(sub)).toBe(100);
    });
  });
});

describe("calculateCardSpending", () => {
  describe("single currency scenarios", () => {
    it("returns zero for card with no subscriptions", () => {
      const result = calculateCardSpending("card-1", []);
      expect(result).toEqual<SpendingInfo>({
        totalMonthly: 0,
        currency: "TRY",
        subscriptionCount: 0,
        hasMultipleCurrencies: false,
        byCurrency: {},
      });
    });

    it("calculates spending for card with single subscription", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 100,
          currency: "TRY",
          cardId: "card-1",
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.totalMonthly).toBe(100);
      expect(result.currency).toBe("TRY");
      expect(result.subscriptionCount).toBe(1);
      expect(result.hasMultipleCurrencies).toBe(false);
      expect(result.byCurrency).toEqual({ TRY: 100 });
    });

    it("sums multiple subscriptions with same currency", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 100,
          currency: "TRY",
          cardId: "card-1",
        }),
        createSubscription({
          id: "sub-2",
          amount: 200,
          currency: "TRY",
          cardId: "card-1",
        }),
        createSubscription({
          id: "sub-3",
          amount: 50,
          currency: "TRY",
          cardId: "card-2",
        }), // Different card
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.totalMonthly).toBe(300);
      expect(result.subscriptionCount).toBe(2);
    });

    it("excludes inactive subscriptions", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 100,
          currency: "TRY",
          cardId: "card-1",
          isActive: true,
        }),
        createSubscription({
          id: "sub-2",
          amount: 200,
          currency: "TRY",
          cardId: "card-1",
          isActive: false,
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.totalMonthly).toBe(100);
      expect(result.subscriptionCount).toBe(1);
    });
  });

  describe("mixed currency scenarios (AC2)", () => {
    it("detects multiple currencies and sets hasMultipleCurrencies", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 1000,
          currency: "TRY",
          cardId: "card-1",
        }),
        createSubscription({
          id: "sub-2",
          amount: 10,
          currency: "USD",
          cardId: "card-1",
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.hasMultipleCurrencies).toBe(true);
      expect(result.currency).toBe("MIXED");
      expect(result.byCurrency).toEqual({ TRY: 1000, USD: 10 });
    });

    it("provides per-currency breakdown for three currencies", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 1200,
          currency: "TRY",
          cardId: "card-1",
        }),
        createSubscription({
          id: "sub-2",
          amount: 40,
          currency: "USD",
          cardId: "card-1",
        }),
        createSubscription({
          id: "sub-3",
          amount: 15,
          currency: "EUR",
          cardId: "card-1",
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.hasMultipleCurrencies).toBe(true);
      expect(result.byCurrency).toEqual({ TRY: 1200, USD: 40, EUR: 15 });
      expect(result.subscriptionCount).toBe(3);
    });
  });

  describe("billing cycle normalization in spending", () => {
    it("normalizes yearly subscriptions to monthly", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 1200,
          billingCycle: "yearly",
          currency: "TRY",
          cardId: "card-1",
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.totalMonthly).toBe(100); // 1200 / 12
    });

    it("normalizes weekly subscriptions to monthly", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 10,
          billingCycle: "weekly",
          currency: "TRY",
          cardId: "card-1",
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.totalMonthly).toBeCloseTo(43.48, 1);
    });

    it("normalizes custom day subscriptions to monthly", () => {
      const subs = [
        createSubscription({
          id: "sub-1",
          amount: 50,
          billingCycle: "custom",
          customDays: 15,
          currency: "TRY",
          cardId: "card-1",
        }),
      ];
      const result = calculateCardSpending("card-1", subs);

      expect(result.totalMonthly).toBe(100); // 50 * (30/15)
    });
  });
});

describe("calculateUnassignedSpending (AC3)", () => {
  it("returns spending for subscriptions without cardId", () => {
    const subs = [
      createSubscription({ id: "sub-1", amount: 100, cardId: undefined }),
      createSubscription({ id: "sub-2", amount: 50, cardId: "card-1" }),
    ];
    const result = calculateUnassignedSpending(subs);

    expect(result.totalMonthly).toBe(100);
    expect(result.subscriptionCount).toBe(1);
  });

  it("returns empty result when all subscriptions have cards", () => {
    const subs = [
      createSubscription({ id: "sub-1", amount: 100, cardId: "card-1" }),
      createSubscription({ id: "sub-2", amount: 50, cardId: "card-2" }),
    ];
    const result = calculateUnassignedSpending(subs);

    expect(result.totalMonthly).toBe(0);
    expect(result.subscriptionCount).toBe(0);
    expect(result.byCurrency).toEqual({});
  });

  it("handles mixed currencies in unassigned subscriptions", () => {
    const subs = [
      createSubscription({
        id: "sub-1",
        amount: 500,
        currency: "TRY",
        cardId: undefined,
      }),
      createSubscription({
        id: "sub-2",
        amount: 20,
        currency: "USD",
        cardId: undefined,
      }),
    ];
    const result = calculateUnassignedSpending(subs);

    expect(result.hasMultipleCurrencies).toBe(true);
    expect(result.byCurrency).toEqual({ TRY: 500, USD: 20 });
  });

  it("excludes inactive unassigned subscriptions", () => {
    const subs = [
      createSubscription({
        id: "sub-1",
        amount: 100,
        cardId: undefined,
        isActive: true,
      }),
      createSubscription({
        id: "sub-2",
        amount: 200,
        cardId: undefined,
        isActive: false,
      }),
    ];
    const result = calculateUnassignedSpending(subs);

    expect(result.totalMonthly).toBe(100);
    expect(result.subscriptionCount).toBe(1);
  });
});
