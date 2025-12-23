/**
 * Tests for src/hooks/use-imminent-payments.ts
 *
 * Story 4.7 Task 5.1: Unit tests for useImminentPayments hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useImminentPayments } from "./use-imminent-payments";
import { useSubscriptionStore } from "@/stores/subscription-store";
import type { Subscription } from "@/types/subscription";

// Mock the subscription store
vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: vi.fn(),
}));

const mockedUseSubscriptionStore = vi.mocked(useSubscriptionStore);

// Helper to create mock subscriptions
function createMockSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  return {
    id: "test-id-" + Math.random().toString(36).substr(2, 9),
    name: "Test Subscription",
    amount: 9.99,
    currency: "TRY",
    billingCycle: "monthly",
    categoryId: "entertainment",
    nextPaymentDate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("useImminentPayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Set a fixed date for consistent tests
    vi.setSystemTime(new Date("2025-12-23T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns empty result when no subscriptions", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({ subscriptions: [] })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(0);
    expect(result.current.payments).toEqual([]);
    expect(result.current.earliestDate).toBeNull();
    expect(result.current.urgencyLevel).toBeNull();
  });

  it("returns subscriptions due today as critical", () => {
    const todaySubscription = createMockSubscription({
      name: "Today Payment",
      nextPaymentDate: "2025-12-23T00:00:00Z",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [todaySubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(1);
    expect(result.current.urgencyLevel).toBe("critical");
    expect(result.current.payments[0].daysUntil).toBe(0);
  });

  it("returns subscriptions due in 1-2 days as urgent", () => {
    const tomorrowSubscription = createMockSubscription({
      name: "Tomorrow Payment",
      nextPaymentDate: "2025-12-24T00:00:00Z",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [tomorrowSubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(1);
    expect(result.current.urgencyLevel).toBe("urgent");
    expect(result.current.payments[0].daysUntil).toBe(1);
  });

  it("returns subscriptions due in 3 days as attention", () => {
    const threeDaysSubscription = createMockSubscription({
      name: "Three Days Payment",
      nextPaymentDate: "2025-12-26T00:00:00Z",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [threeDaysSubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(1);
    expect(result.current.urgencyLevel).toBe("attention");
    expect(result.current.payments[0].daysUntil).toBe(3);
  });

  it("excludes subscriptions beyond threshold", () => {
    const farSubscription = createMockSubscription({
      name: "Far Payment",
      nextPaymentDate: "2025-12-30T00:00:00Z", // 7 days away
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [farSubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(0);
    expect(result.current.payments).toEqual([]);
  });

  it("excludes past subscriptions", () => {
    const pastSubscription = createMockSubscription({
      name: "Past Payment",
      nextPaymentDate: "2025-12-20T00:00:00Z", // 3 days ago
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [pastSubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(0);
  });

  it("sorts payments by date (earliest first)", () => {
    const laterSubscription = createMockSubscription({
      id: "later",
      name: "Later Payment",
      nextPaymentDate: "2025-12-25T00:00:00Z", // 2 days
    });
    const earlierSubscription = createMockSubscription({
      id: "earlier",
      name: "Earlier Payment",
      nextPaymentDate: "2025-12-24T00:00:00Z", // 1 day
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [laterSubscription, earlierSubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(2);
    expect(result.current.payments[0].id).toBe("earlier");
    expect(result.current.payments[1].id).toBe("later");
    expect(result.current.earliestDate).toBe("2025-12-24T00:00:00Z");
  });

  it("uses most urgent level from multiple payments", () => {
    const criticalSubscription = createMockSubscription({
      name: "Critical",
      nextPaymentDate: "2025-12-23T00:00:00Z", // today
    });
    const attentionSubscription = createMockSubscription({
      name: "Attention",
      nextPaymentDate: "2025-12-26T00:00:00Z", // 3 days
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseSubscriptionStore.mockImplementation((selector: any) =>
      selector({
        subscriptions: [attentionSubscription, criticalSubscription],
      })
    );

    const { result } = renderHook(() => useImminentPayments());

    expect(result.current.count).toBe(2);
    expect(result.current.urgencyLevel).toBe("critical");
  });
});
