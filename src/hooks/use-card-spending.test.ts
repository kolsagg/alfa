import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useCardSpending,
  useUnassignedSpending,
  useAllCardSpending,
} from "./use-card-spending";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useCardStore } from "@/stores/card-store";
import type { Subscription } from "@/types/subscription";
import type { Card } from "@/types/card";
import type { SubscriptionState } from "@/stores/subscription-store";
import type { CardsState } from "@/stores/card-store";

/**
 * useCardSpending Hook Tests
 *
 * Story 6.4: Task 2.2
 */

// Mock stores
vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: vi.fn(),
}));

vi.mock("@/stores/card-store", () => ({
  useCardStore: vi.fn(),
}));

// Helper to create test data
function createSubscription(
  id: string,
  amount: number,
  currency: "TRY" | "USD" | "EUR" = "TRY",
  cardId?: string
): Subscription {
  const now = new Date().toISOString();
  return {
    id,
    name: `Sub ${id}`,
    amount,
    currency,
    billingCycle: "monthly",
    nextPaymentDate: now,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    cardId,
  };
}

function createCard(id: string, name: string): Card {
  const now = new Date().toISOString();
  return {
    id,
    name,
    type: "credit",
    lastFourDigits: "1234",
    cutoffDate: 15,
    createdAt: now,
    updatedAt: now,
  };
}

describe("useCardSpending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns spending for specified card", () => {
    const subscriptions = [
      createSubscription("sub-1", 100, "TRY", "card-1"),
      createSubscription("sub-2", 200, "TRY", "card-1"),
    ];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );

    const { result } = renderHook(() => useCardSpending("card-1"));

    expect(result.current.totalMonthly).toBe(300);
    expect(result.current.subscriptionCount).toBe(2);
    expect(result.current.currency).toBe("TRY");
  });

  it("returns zero for card with no subscriptions", () => {
    const subscriptions = [createSubscription("sub-1", 100, "TRY", "card-2")];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );

    const { result } = renderHook(() => useCardSpending("card-1"));

    expect(result.current.totalMonthly).toBe(0);
    expect(result.current.subscriptionCount).toBe(0);
  });

  it("handles mixed currencies", () => {
    const subscriptions = [
      createSubscription("sub-1", 1000, "TRY", "card-1"),
      createSubscription("sub-2", 50, "USD", "card-1"),
    ];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );

    const { result } = renderHook(() => useCardSpending("card-1"));

    expect(result.current.hasMultipleCurrencies).toBe(true);
    expect(result.current.currency).toBe("MIXED");
    expect(result.current.byCurrency).toEqual({ TRY: 1000, USD: 50 });
  });
});

describe("useUnassignedSpending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns spending for unassigned subscriptions", () => {
    const subscriptions = [
      createSubscription("sub-1", 100, "TRY", undefined),
      createSubscription("sub-2", 50, "TRY", "card-1"),
    ];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );

    const { result } = renderHook(() => useUnassignedSpending());

    expect(result.current.totalMonthly).toBe(100);
    expect(result.current.subscriptionCount).toBe(1);
  });

  it("returns zero when all subscriptions have cards", () => {
    const subscriptions = [
      createSubscription("sub-1", 100, "TRY", "card-1"),
      createSubscription("sub-2", 50, "TRY", "card-2"),
    ];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );

    const { result } = renderHook(() => useUnassignedSpending());

    expect(result.current.totalMonthly).toBe(0);
  });
});

describe("useAllCardSpending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns spending for all cards and unassigned", () => {
    const subscriptions = [
      createSubscription("sub-1", 100, "TRY", "card-1"),
      createSubscription("sub-2", 200, "TRY", "card-2"),
      createSubscription("sub-3", 50, "TRY", undefined),
    ];
    const cards = [
      createCard("card-1", "Card 1"),
      createCard("card-2", "Card 2"),
    ];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );
    vi.mocked(useCardStore).mockImplementation(
      <T>(selector: (state: CardsState) => T) =>
        selector({ cards } as CardsState)
    );

    const { result } = renderHook(() => useAllCardSpending());

    expect(result.current.cardSpending).toHaveLength(2);
    expect(result.current.cardSpending[0].card.id).toBe("card-1");
    expect(result.current.cardSpending[0].spending.totalMonthly).toBe(100);
    expect(result.current.cardSpending[1].spending.totalMonthly).toBe(200);
    expect(result.current.unassignedSpending.totalMonthly).toBe(50);
    expect(result.current.hasUnassigned).toBe(true);
  });

  it("sets hasUnassigned false when no unassigned subscriptions", () => {
    const subscriptions = [createSubscription("sub-1", 100, "TRY", "card-1")];
    const cards = [createCard("card-1", "Card 1")];

    vi.mocked(useSubscriptionStore).mockImplementation(
      <T>(selector: (state: SubscriptionState) => T) =>
        selector({ subscriptions } as SubscriptionState)
    );
    vi.mocked(useCardStore).mockImplementation(
      <T>(selector: (state: CardsState) => T) =>
        selector({ cards } as CardsState)
    );

    const { result } = renderHook(() => useAllCardSpending());

    expect(result.current.hasUnassigned).toBe(false);
  });
});
