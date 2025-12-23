import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotificationScheduleSync } from "./use-notification-schedule-sync";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import type { Subscription } from "@/types/subscription";

// Helper to create a valid subscription
function createMockSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Netflix",
    amount: 99.99,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: "2025-01-15T00:00:00.000Z",
    categoryId: "entertainment",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useNotificationScheduleSync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T08:00:00.000Z"));

    // Reset all stores
    useSubscriptionStore.setState({
      subscriptions: [],
    });

    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationPermission: "granted",
      notificationDaysBefore: 3,
      notificationTime: "09:00",
    });

    useNotificationScheduleStore.setState({
      schedule: [],
      lastCalculatedAt: undefined,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate schedule on mount", () => {
    // Setup: Add a subscription
    useSubscriptionStore.setState({
      subscriptions: [createMockSubscription()],
    });

    renderHook(() => useNotificationScheduleSync());

    // Should calculate immediately on mount
    const { schedule } = useNotificationScheduleStore.getState();
    expect(schedule).toHaveLength(1);
  });

  it("should recalculate when subscriptions change", () => {
    renderHook(() => useNotificationScheduleSync({ debounceMs: 100 }));

    // Initial state - no subscriptions
    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(0);

    // Add a subscription
    act(() => {
      useSubscriptionStore.setState({
        subscriptions: [createMockSubscription()],
      });
    });

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Check schedule updated
    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(1);
  });

  it("should recalculate when settings change", () => {
    // Setup: Add a subscription
    useSubscriptionStore.setState({
      subscriptions: [createMockSubscription()],
    });

    renderHook(() => useNotificationScheduleSync({ debounceMs: 100 }));

    // Get initial schedule
    const initialSchedule = useNotificationScheduleStore.getState().schedule;
    expect(initialSchedule).toHaveLength(1);
    const initialScheduledFor = initialSchedule[0].scheduledFor;

    // Change notificationDaysBefore
    act(() => {
      useSettingsStore.setState({
        notificationDaysBefore: 5,
      });
    });

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Check schedule changed
    const newSchedule = useNotificationScheduleStore.getState().schedule;
    expect(newSchedule[0].scheduledFor).not.toBe(initialScheduledFor);
  });

  it("should debounce rapid changes", () => {
    const updateScheduleSpy = vi.fn();

    // Mock updateSchedule to track calls
    const originalUpdateSchedule =
      useNotificationScheduleStore.getState().updateSchedule;
    useNotificationScheduleStore.setState({
      updateSchedule: (entries) => {
        updateScheduleSpy(entries);
        originalUpdateSchedule(entries);
      },
    });

    // Setup: Add a subscription
    useSubscriptionStore.setState({
      subscriptions: [createMockSubscription()],
    });

    renderHook(() => useNotificationScheduleSync({ debounceMs: 500 }));

    // Initial call
    expect(updateScheduleSpy).toHaveBeenCalledTimes(1);

    // Rapid changes
    act(() => {
      useSettingsStore.setState({ notificationDaysBefore: 2 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      useSettingsStore.setState({ notificationDaysBefore: 3 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      useSettingsStore.setState({ notificationDaysBefore: 4 });
    });

    // At this point, no additional calls should have been made
    expect(updateScheduleSpy).toHaveBeenCalledTimes(1);

    // Wait for debounce to complete
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have exactly 2 calls: initial + 1 debounced
    expect(updateScheduleSpy).toHaveBeenCalledTimes(2);
  });

  it("should clear schedule when notifications disabled", () => {
    // Setup: Add subscription and enable notifications
    useSubscriptionStore.setState({
      subscriptions: [createMockSubscription()],
    });

    renderHook(() => useNotificationScheduleSync({ debounceMs: 100 }));

    // Verify initial schedule exists
    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(1);

    // Disable notifications
    act(() => {
      useSettingsStore.setState({ notificationsEnabled: false });
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Check schedule cleared
    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(0);
  });

  it("should clear schedule when permission denied", () => {
    // Setup: Add subscription with granted permission
    useSubscriptionStore.setState({
      subscriptions: [createMockSubscription()],
    });

    renderHook(() => useNotificationScheduleSync({ debounceMs: 100 }));

    // Verify initial schedule exists
    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(1);

    // Deny permission
    act(() => {
      useSettingsStore.setState({ notificationPermission: "denied" });
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Check schedule cleared
    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(0);
  });

  it("should handle empty subscriptions", () => {
    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationPermission: "granted",
    });

    renderHook(() => useNotificationScheduleSync());

    expect(useNotificationScheduleStore.getState().schedule).toHaveLength(0);
  });

  it("should filter inactive subscriptions", () => {
    useSubscriptionStore.setState({
      subscriptions: [
        createMockSubscription({
          id: "550e8400-e29b-41d4-a716-446655440001",
          isActive: true,
        }),
        createMockSubscription({
          id: "550e8400-e29b-41d4-a716-446655440002",
          isActive: false,
        }),
      ],
    });

    renderHook(() => useNotificationScheduleSync());

    const { schedule } = useNotificationScheduleStore.getState();
    expect(schedule).toHaveLength(1);
    expect(schedule[0].subscriptionId).toBe(
      "550e8400-e29b-41d4-a716-446655440001"
    );
  });
});
