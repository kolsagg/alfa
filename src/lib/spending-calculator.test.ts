/**
 * Spending Calculator Tests
 *
 * Story 6.4: Normalized spending tests
 * Story 6.5: Statement calculation tests - Actual bill prediction
 */

import { describe, it, expect } from "vitest";
import {
  normalizeToMonthly,
  calculateCardSpending,
  calculateUnassignedSpending,
  formatCurrencyAmount,
  renderSpendingDisplay,
  getStatementBounds,
  calculateOccurrencesInPeriod,
  calculateActualStatementAmount,
  type SpendingInfo,
} from "./spending-calculator";
import type { Subscription } from "@/types/subscription";

// Test helpers
const createSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription => ({
  id: "test-sub-1",
  name: "Test Subscription",
  amount: 100,
  currency: "TRY",
  billingCycle: "monthly",
  nextPaymentDate: "2025-01-15T00:00:00.000Z",
  isActive: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

// ============================================
// Story 6.4: Normalization Tests
// ============================================
describe("normalizeToMonthly", () => {
  it("returns same amount for monthly subscriptions", () => {
    const sub = createSubscription({ amount: 100, billingCycle: "monthly" });
    expect(normalizeToMonthly(sub)).toBe(100);
  });

  it("divides yearly amount by 12", () => {
    const sub = createSubscription({ amount: 1200, billingCycle: "yearly" });
    expect(normalizeToMonthly(sub)).toBe(100);
  });

  it("multiplies weekly amount by 4.348 (365.25/12/7)", () => {
    const sub = createSubscription({ amount: 10, billingCycle: "weekly" });
    const expected = 10 * (365.25 / 12 / 7);
    expect(normalizeToMonthly(sub)).toBeCloseTo(expected);
  });

  it("calculates custom days correctly", () => {
    const sub = createSubscription({
      amount: 30,
      billingCycle: "custom",
      customDays: 15,
    });
    expect(normalizeToMonthly(sub)).toBe(60); // 30 * (30/15)
  });

  it("falls back to monthly for invalid custom days", () => {
    const sub = createSubscription({
      amount: 100,
      billingCycle: "custom",
      customDays: 0,
    });
    expect(normalizeToMonthly(sub)).toBe(100);
  });
});

describe("calculateCardSpending", () => {
  it("returns zero info for no subscriptions", () => {
    const result = calculateCardSpending("card-1", []);
    expect(result.subscriptionCount).toBe(0);
    expect(result.totalMonthly).toBe(0);
    expect(result.hasMultipleCurrencies).toBe(false);
  });

  it("filters by cardId correctly", () => {
    const subs = [
      createSubscription({ id: "1", cardId: "card-1", amount: 100 }),
      createSubscription({ id: "2", cardId: "card-2", amount: 200 }),
      createSubscription({ id: "3", cardId: "card-1", amount: 150 }),
    ];
    const result = calculateCardSpending("card-1", subs);
    expect(result.subscriptionCount).toBe(2);
    expect(result.totalMonthly).toBe(250);
  });

  it("excludes inactive subscriptions", () => {
    const subs = [
      createSubscription({ cardId: "card-1", amount: 100, isActive: true }),
      createSubscription({ cardId: "card-1", amount: 200, isActive: false }),
    ];
    const result = calculateCardSpending("card-1", subs);
    expect(result.subscriptionCount).toBe(1);
    expect(result.totalMonthly).toBe(100);
  });

  it("handles multiple currencies", () => {
    const subs = [
      createSubscription({ cardId: "card-1", amount: 100, currency: "TRY" }),
      createSubscription({ cardId: "card-1", amount: 50, currency: "USD" }),
    ];
    const result = calculateCardSpending("card-1", subs);
    expect(result.hasMultipleCurrencies).toBe(true);
    expect(result.currency).toBe("MIXED");
    expect(result.byCurrency.TRY).toBe(100);
    expect(result.byCurrency.USD).toBe(50);
  });
});

describe("calculateUnassignedSpending", () => {
  it("returns subscriptions without cardId", () => {
    const subs = [
      createSubscription({ id: "1", cardId: undefined, amount: 100 }),
      createSubscription({ id: "2", cardId: "card-1", amount: 200 }),
      createSubscription({ id: "3", cardId: undefined, amount: 50 }),
    ];
    const result = calculateUnassignedSpending(subs);
    expect(result.subscriptionCount).toBe(2);
    expect(result.totalMonthly).toBe(150);
  });
});

describe("formatCurrencyAmount", () => {
  it("formats TRY with symbol", () => {
    expect(formatCurrencyAmount(1200, "TRY")).toBe("₺1.200");
  });

  it("formats USD with symbol", () => {
    expect(formatCurrencyAmount(150, "USD")).toBe("$150");
  });

  it("formats EUR with symbol", () => {
    expect(formatCurrencyAmount(99, "EUR")).toBe("€99");
  });
});

describe("renderSpendingDisplay", () => {
  it("returns no subscriptions text when count is 0", () => {
    const spending: SpendingInfo = {
      totalMonthly: 0,
      currency: "TRY",
      subscriptionCount: 0,
      hasMultipleCurrencies: false,
      byCurrency: {},
    };
    expect(renderSpendingDisplay(spending, "Abonelik yok")).toBe(
      "Abonelik yok"
    );
  });

  it("renders single currency", () => {
    const spending: SpendingInfo = {
      totalMonthly: 500,
      currency: "TRY",
      subscriptionCount: 2,
      hasMultipleCurrencies: false,
      byCurrency: { TRY: 500 },
    };
    expect(renderSpendingDisplay(spending, "Abonelik yok")).toBe("₺500");
  });

  it("renders mixed currencies with separator", () => {
    const spending: SpendingInfo = {
      totalMonthly: 600,
      currency: "MIXED",
      subscriptionCount: 2,
      hasMultipleCurrencies: true,
      byCurrency: { TRY: 500, USD: 100 },
    };
    expect(renderSpendingDisplay(spending, "Abonelik yok")).toBe("₺500 + $100");
  });
});

// ============================================
// Story 6.5: Statement Calculation Tests
// ============================================
// Helper to format date in local timezone as YYYY-MM-DD
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

describe("getStatementBounds", () => {
  it("calculates correct bounds for mid-month cutoff", () => {
    // Cutoff 15, reference Jan 10 → Current: Dec 16 - Jan 15
    const result = getStatementBounds(15, new Date(2025, 0, 10)); // Jan 10, 2025
    expect(toLocalDateString(result.current.start)).toBe("2024-12-16");
    expect(toLocalDateString(result.current.end)).toBe("2025-01-15");
    expect(toLocalDateString(result.next.start)).toBe("2025-01-16");
    expect(toLocalDateString(result.next.end)).toBe("2025-02-15");
  });

  it("calculates correct bounds when reference is after cutoff", () => {
    // Cutoff 15, reference Jan 20 → Current: Jan 16 - Feb 15
    const result = getStatementBounds(15, new Date(2025, 0, 20)); // Jan 20, 2025
    expect(toLocalDateString(result.current.start)).toBe("2025-01-16");
    expect(toLocalDateString(result.current.end)).toBe("2025-02-15");
    expect(toLocalDateString(result.next.start)).toBe("2025-02-16");
    expect(toLocalDateString(result.next.end)).toBe("2025-03-15");
  });

  it("handles month-end cutoff (31) in February", () => {
    // Cutoff 31, reference Feb 15 → Should clamp to 28 for Feb end
    const result = getStatementBounds(31, new Date(2025, 1, 15)); // Feb 15, 2025
    // Current: Feb 1 - Feb 28 (since prev month Jan ended on 31)
    expect(toLocalDateString(result.current.start)).toBe("2025-02-01");
    expect(toLocalDateString(result.current.end)).toBe("2025-02-28");
  });

  it("handles leap year Feb 29", () => {
    // Cutoff 29, reference Feb 15 in leap year
    const result = getStatementBounds(29, new Date(2024, 1, 15)); // Feb 15, 2024
    expect(toLocalDateString(result.current.end)).toBe("2024-02-29");
  });

  it("calculates daysRemaining correctly", () => {
    const result = getStatementBounds(15, new Date(2025, 0, 10)); // Jan 10, 2025
    expect(result.daysRemaining).toBe(5); // Jan 10 to Jan 15
  });

  it("shows 0 days remaining on cutoff day", () => {
    const result = getStatementBounds(15, new Date(2025, 0, 15)); // Jan 15, 2025
    expect(result.daysRemaining).toBe(0);
  });
});

describe("calculateOccurrencesInPeriod", () => {
  it("finds single monthly occurrence in period", () => {
    const sub = createSubscription({
      amount: 100,
      billingCycle: "monthly",
      nextPaymentDate: "2025-01-10T00:00:00.000Z",
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]).toBe(100);
  });

  it("finds multiple weekly occurrences in 31-day period", () => {
    const sub = createSubscription({
      amount: 25,
      billingCycle: "weekly",
      nextPaymentDate: "2025-01-01T00:00:00.000Z", // First occurrence
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    // Jan 1, 8, 15, 22, 29 = 5 occurrences
    expect(occurrences).toHaveLength(5);
    expect(occurrences.reduce((a, b) => a + b, 0)).toBe(125);
  });

  it("returns empty array if no occurrence in period", () => {
    const sub = createSubscription({
      amount: 100,
      billingCycle: "monthly",
      nextPaymentDate: "2025-02-10T00:00:00.000Z",
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(0);
  });

  it("handles yearly subscriptions correctly", () => {
    const sub = createSubscription({
      amount: 1200,
      billingCycle: "yearly",
      nextPaymentDate: "2025-01-10T00:00:00.000Z",
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]).toBe(1200); // Full amount, not normalized
  });

  it("handles custom interval subscriptions", () => {
    const sub = createSubscription({
      amount: 50,
      billingCycle: "custom",
      customDays: 10,
      nextPaymentDate: "2025-01-05T00:00:00.000Z",
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    // Jan 5, 15, 25 = 3 occurrences
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(3);
  });

  it("includes occurrence on period boundary (start)", () => {
    const sub = createSubscription({
      amount: 100,
      billingCycle: "monthly",
      nextPaymentDate: "2025-01-01T00:00:00.000Z",
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(1);
  });

  it("includes occurrence on period boundary (end)", () => {
    const sub = createSubscription({
      amount: 100,
      billingCycle: "monthly",
      nextPaymentDate: "2025-01-31T00:00:00.000Z",
    });
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(1);
  });

  it("handles month-end drift (Jan 31 -> Feb 28 -> Mar 31) correctly", () => {
    const sub = createSubscription({
      amount: 100,
      billingCycle: "monthly",
      nextPaymentDate: "2025-01-31T00:00:00.000Z",
    });
    // Reference March: period from Mar 1 to Mar 31
    // Without fix: Jan 31 + 1 month = Feb 28, Feb 28 + 1 month = Mar 28. (WRONG)
    // With fix: Jan 31 + 2 months = Mar 31. (CORRECT)
    const start = new Date("2025-03-01");
    const end = new Date("2025-03-31");
    const occurrences = calculateOccurrencesInPeriod(sub, start, end);
    expect(occurrences).toHaveLength(1);
  });
});

describe("calculateActualStatementAmount", () => {
  // Helper to create date string in local time that will parse correctly
  const toISOLocalDate = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString();
  };

  it("calculates current and next statement totals", () => {
    const subs = [
      createSubscription({
        id: "1",
        cardId: "card-1",
        amount: 100,
        billingCycle: "monthly",
        nextPaymentDate: toISOLocalDate(2025, 0, 10), // Jan 10
      }),
      createSubscription({
        id: "2",
        cardId: "card-1",
        amount: 200,
        billingCycle: "monthly",
        nextPaymentDate: toISOLocalDate(2025, 1, 5), // Feb 5
      }),
    ];

    // Current: Dec 16 - Jan 15 (includes sub1: Jan 10)
    // Next: Jan 16 - Feb 15 (includes sub1: Feb 10, sub2: Feb 5)
    const result = calculateActualStatementAmount(
      "card-1",
      15,
      subs,
      new Date(2025, 0, 10) // Jan 10, 2025
    );

    expect(result.currentBill.totalMonthly).toBe(100);
    // Both subscriptions have payments in next period: sub1 cycles to Feb 10, sub2 Feb 5
    expect(result.nextBill.totalMonthly).toBe(300);
  });

  it("handles multiple occurrences for weekly subscriptions in statement", () => {
    const subs = [
      createSubscription({
        id: "1",
        cardId: "card-1",
        amount: 25,
        billingCycle: "weekly",
        nextPaymentDate: "2025-01-01T00:00:00.000Z",
      }),
    ];

    // Cutoff 31 (month end), reference Jan 15
    // Current: Jan 1 - Jan 31 → 5 occurrences (Jan 1, 8, 15, 22, 29)
    const result = calculateActualStatementAmount(
      "card-1",
      31,
      subs,
      new Date("2025-01-15")
    );

    expect(result.currentBill.totalMonthly).toBe(125); // 25 * 5
  });

  it("handles multi-currency subscriptions", () => {
    const subs = [
      createSubscription({
        id: "1",
        cardId: "card-1",
        amount: 100,
        currency: "TRY",
        nextPaymentDate: "2025-01-10T00:00:00.000Z",
      }),
      createSubscription({
        id: "2",
        cardId: "card-1",
        amount: 50,
        currency: "USD",
        nextPaymentDate: "2025-01-12T00:00:00.000Z",
      }),
    ];

    const result = calculateActualStatementAmount(
      "card-1",
      15,
      subs,
      new Date("2025-01-10")
    );

    expect(result.currentBill.hasMultipleCurrencies).toBe(true);
    expect(result.currentBill.byCurrency.TRY).toBe(100);
    expect(result.currentBill.byCurrency.USD).toBe(50);
  });

  it("excludes inactive subscriptions", () => {
    const subs = [
      createSubscription({
        id: "1",
        cardId: "card-1",
        amount: 100,
        isActive: true,
        nextPaymentDate: "2025-01-10T00:00:00.000Z",
      }),
      createSubscription({
        id: "2",
        cardId: "card-1",
        amount: 200,
        isActive: false,
        nextPaymentDate: "2025-01-12T00:00:00.000Z",
      }),
    ];

    const result = calculateActualStatementAmount(
      "card-1",
      15,
      subs,
      new Date("2025-01-10")
    );

    expect(result.currentBill.totalMonthly).toBe(100);
  });

  it("returns period bounds and days remaining", () => {
    const result = calculateActualStatementAmount(
      "card-1",
      15,
      [],
      new Date(2025, 0, 10) // Jan 10, 2025
    );

    expect(toLocalDateString(result.currentPeriod.start)).toBe("2024-12-16");
    expect(toLocalDateString(result.currentPeriod.end)).toBe("2025-01-15");
    expect(result.daysRemaining).toBe(5);
  });

  it("performs efficiently with 100+ subscriptions (AC6)", () => {
    // Create 120 subscriptions with mixed billing cycles
    const subs: ReturnType<typeof createSubscription>[] = [];
    for (let i = 0; i < 120; i++) {
      const cycle = i % 4 === 0 ? "weekly" : i % 3 === 0 ? "yearly" : "monthly";
      subs.push(
        createSubscription({
          id: `sub-${i}`,
          cardId: "card-1",
          amount: 10 + i,
          billingCycle: cycle,
          currency: i % 5 === 0 ? "USD" : "TRY",
          nextPaymentDate: toISOLocalDate(2025, 0, (i % 28) + 1),
        })
      );
    }

    const start = performance.now();
    const result = calculateActualStatementAmount(
      "card-1",
      15,
      subs,
      new Date(2025, 0, 10)
    );
    const duration = performance.now() - start;

    // Should complete in under 100ms for 60fps compatibility
    expect(duration).toBeLessThan(100);
    expect(result.currentBill.subscriptionCount).toBeGreaterThan(0);
    expect(result.nextBill.subscriptionCount).toBeGreaterThan(0);
  });
});
