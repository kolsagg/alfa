import { describe, it, expect } from "vitest";
import {
  calculateMonthlyEquivalent,
  calculateTotalMonthly,
  calculateTotalYearly,
} from "./spending-calculations";
import type { Subscription } from "@/types/subscription";

describe("Spending Calculations", () => {
  const mockRates = {
    TRY: 1,
    USD: 30, // 1 USD = 30 TRY
    EUR: 32, // 1 EUR = 32 TRY
  };

  const mockSubscriptions: Subscription[] = [
    {
      id: "1",
      name: "Netflix",
      amount: 10,
      currency: "USD",
      billingCycle: "monthly",
      nextPaymentDate: new Date().toISOString(),
      isActive: true,
      categoryId: "entertainment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Spotify",
      amount: 40,
      currency: "TRY",
      billingCycle: "monthly",
      nextPaymentDate: new Date().toISOString(),
      isActive: true,
      categoryId: "entertainment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Weekly News",
      amount: 5,
      currency: "TRY",
      billingCycle: "weekly",
      nextPaymentDate: new Date().toISOString(),
      isActive: true,
      categoryId: "other",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("calculates monthly equivalent correctly for different cycles and currencies", () => {
    // 10 USD monthly @ 30 rate = 300 TRY
    expect(calculateMonthlyEquivalent(mockSubscriptions[0], mockRates)).toBe(
      300
    );

    // 40 TRY monthly @ 1 rate = 40 TRY
    expect(calculateMonthlyEquivalent(mockSubscriptions[1], mockRates)).toBe(
      40
    );

    // 5 TRY weekly @ 4.33 factor = 21.65 TRY
    expect(
      calculateMonthlyEquivalent(mockSubscriptions[2], mockRates)
    ).toBeCloseTo(21.65, 2);
  });

  it("calculates total monthly spending across all subscriptions in TRY", () => {
    // 300 + 40 + 21.65 = 361.65
    expect(calculateTotalMonthly(mockSubscriptions, mockRates)).toBeCloseTo(
      361.65,
      2
    );
  });

  it("calculates total yearly spending based on monthly total", () => {
    const monthlyTotal = 361.65;
    expect(calculateTotalYearly(mockSubscriptions, mockRates)).toBeCloseTo(
      monthlyTotal * 12,
      2
    );
  });

  it("handles custom billing cycles correctly", () => {
    const customSub: Subscription = {
      ...mockSubscriptions[1],
      billingCycle: "custom",
      customDays: 10, // Every 10 days = 3 times a month
      amount: 100,
    };
    // 100 * (30/10) = 300
    expect(calculateMonthlyEquivalent(customSub, mockRates)).toBe(300);
  });
});
