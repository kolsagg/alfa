import { describe, it, expect } from "vitest";
import { calculateCategoryBreakdown } from "./category-breakdown-utils";
import type { Subscription } from "@/types/subscription";
import type { Category } from "@/types/common";

const createSubscription = (
  overrides: Partial<Subscription> & {
    categoryId: Category;
    amount: number;
    currency: "TRY" | "USD" | "EUR";
  }
): Subscription => ({
  id: crypto.randomUUID(),
  name: "Test Sub",
  billingCycle: "monthly",
  nextPaymentDate: new Date().toISOString(),
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("calculateCategoryBreakdown", () => {
  it("should return empty object for empty subscriptions", () => {
    const result = calculateCategoryBreakdown([]);
    expect(result).toEqual({});
  });

  it("should group subscriptions by currency", () => {
    const subs: Subscription[] = [
      createSubscription({
        categoryId: "entertainment",
        amount: 100,
        currency: "TRY",
      }),
      createSubscription({ categoryId: "tools", amount: 50, currency: "TRY" }),
      createSubscription({
        categoryId: "entertainment",
        amount: 10,
        currency: "USD",
      }),
    ];

    const result = calculateCategoryBreakdown(subs);

    expect(result).toHaveProperty("TRY");
    expect(result).toHaveProperty("USD");
    expect(result.TRY.length).toBe(2);
    expect(result.USD.length).toBe(1);
  });

  it("should calculate correct totals per category within each currency", () => {
    const subs: Subscription[] = [
      createSubscription({
        categoryId: "entertainment",
        amount: 100,
        currency: "TRY",
      }),
      createSubscription({
        categoryId: "entertainment",
        amount: 50,
        currency: "TRY",
      }),
      createSubscription({ categoryId: "tools", amount: 50, currency: "TRY" }),
    ];

    const result = calculateCategoryBreakdown(subs);
    const entertainment = result.TRY.find(
      (c) => c.categoryId === "entertainment"
    );
    const tools = result.TRY.find((c) => c.categoryId === "tools");

    expect(entertainment?.total).toBe(150);
    expect(tools?.total).toBe(50);
  });

  it("should calculate correct percentages within each currency group", () => {
    const subs: Subscription[] = [
      createSubscription({
        categoryId: "entertainment",
        amount: 75,
        currency: "TRY",
      }),
      createSubscription({ categoryId: "tools", amount: 25, currency: "TRY" }),
    ];

    const result = calculateCategoryBreakdown(subs);
    const entertainment = result.TRY.find(
      (c) => c.categoryId === "entertainment"
    );
    const tools = result.TRY.find((c) => c.categoryId === "tools");

    expect(entertainment?.percentage).toBe(75);
    expect(tools?.percentage).toBe(25);
  });

  it("should sort categories by percentage descending", () => {
    const subs: Subscription[] = [
      createSubscription({ categoryId: "tools", amount: 10, currency: "TRY" }),
      createSubscription({
        categoryId: "entertainment",
        amount: 50,
        currency: "TRY",
      }),
      createSubscription({ categoryId: "health", amount: 30, currency: "TRY" }),
    ];

    const result = calculateCategoryBreakdown(subs);

    expect(result.TRY[0].categoryId).toBe("entertainment");
    expect(result.TRY[1].categoryId).toBe("health");
    expect(result.TRY[2].categoryId).toBe("tools");
  });

  it("should handle zero amounts gracefully", () => {
    const subs: Subscription[] = [
      createSubscription({
        categoryId: "entertainment",
        amount: 0,
        currency: "TRY",
      }),
      createSubscription({ categoryId: "tools", amount: 100, currency: "TRY" }),
    ];

    const result = calculateCategoryBreakdown(subs);
    const entertainment = result.TRY.find(
      (c) => c.categoryId === "entertainment"
    );

    expect(entertainment?.percentage).toBe(0);
    expect(entertainment?.total).toBe(0);
  });

  it("should handle single category (100%)", () => {
    const subs: Subscription[] = [
      createSubscription({
        categoryId: "entertainment",
        amount: 100,
        currency: "TRY",
      }),
      createSubscription({
        categoryId: "entertainment",
        amount: 200,
        currency: "TRY",
      }),
    ];

    const result = calculateCategoryBreakdown(subs);

    expect(result.TRY.length).toBe(1);
    expect(result.TRY[0].percentage).toBe(100);
  });

  it("should handle subscriptions without categoryId (default to 'other')", () => {
    // Create subscription directly without helper to test undefined categoryId
    const subWithoutCategory: Subscription = {
      id: crypto.randomUUID(),
      name: "No Category Sub",
      amount: 100,
      currency: "TRY",
      billingCycle: "monthly",
      nextPaymentDate: new Date().toISOString(),
      isActive: true,
      // categoryId intentionally omitted
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateCategoryBreakdown([subWithoutCategory]);

    expect(result.TRY.length).toBe(1);
    expect(result.TRY[0].categoryId).toBe("other");
  });
});
