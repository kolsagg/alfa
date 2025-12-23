import { renderHook, act } from "@testing-library/react";
import {
  useMissedNotificationsRecovery,
  getMissedNotifications,
  getStaleEntries,
} from "./use-missed-notifications-recovery";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import { addDays, subDays, startOfToday, formatISO } from "date-fns";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { NotificationScheduleEntry } from "@/types/notification-schedule";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

vi.mock("@/services/notification-dispatcher", () => ({
  logReliabilityBatch: vi.fn(),
  checkAndDispatchNotifications: vi.fn(),
  syncNotificationPermissions: vi.fn(),
}));

describe("useMissedNotificationsRecovery helpers", () => {
  const today = startOfToday();
  const now = new Date();
  const validId1 = "550e8400-e29b-41d4-a716-446655440000";
  const validId2 = "550e8400-e29b-41d4-a716-446655440001";

  describe("getMissedNotifications", () => {
    it("should return entries where scheduledFor < now and !notifiedAt", () => {
      const schedule: NotificationScheduleEntry[] = [
        {
          subscriptionId: validId1,
          scheduledFor: formatISO(subDays(now, 1)), // Passed
          paymentDueAt: formatISO(addDays(today, 1)), // Future
          notifiedAt: undefined,
        },
        {
          subscriptionId: validId2,
          scheduledFor: formatISO(addDays(now, 1)), // Future
          paymentDueAt: formatISO(addDays(today, 2)),
          notifiedAt: undefined,
        },
      ];

      const missed = getMissedNotifications(schedule);
      expect(missed).toHaveLength(1);
      expect(missed[0].subscriptionId).toBe(validId1);
    });

    it("should exclude entries where paymentDueAt is in the past (stale)", () => {
      const schedule: NotificationScheduleEntry[] = [
        {
          subscriptionId: validId1,
          scheduledFor: formatISO(subDays(now, 2)),
          paymentDueAt: formatISO(subDays(today, 1)), // Stale
          notifiedAt: undefined,
        },
      ];

      const missed = getMissedNotifications(schedule);
      expect(missed).toHaveLength(0);
    });

    it("should allow entries where paymentDueAt is today (not stale yet)", () => {
      const schedule: NotificationScheduleEntry[] = [
        {
          subscriptionId: validId1,
          scheduledFor: formatISO(subDays(now, 1)),
          paymentDueAt: formatISO(today), // Today
          notifiedAt: undefined,
        },
      ];

      const missed = getMissedNotifications(schedule);
      expect(missed).toHaveLength(1);
    });

    it("should return empty array if all entries are notified", () => {
      const schedule: NotificationScheduleEntry[] = [
        {
          subscriptionId: validId1,
          scheduledFor: formatISO(subDays(now, 1)),
          paymentDueAt: formatISO(addDays(today, 1)),
          notifiedAt: formatISO(subDays(now, 1)),
        },
      ];

      const missed = getMissedNotifications(schedule);
      expect(missed).toHaveLength(0);
    });
  });

  describe("getStaleEntries", () => {
    it("should return entries where paymentDueAt < startOfToday", () => {
      const schedule: Partial<NotificationScheduleEntry>[] = [
        {
          subscriptionId: validId1,
          paymentDueAt: formatISO(subDays(today, 1)), // Stale
        },
        {
          subscriptionId: validId2,
          paymentDueAt: formatISO(today), // Not stale
        },
      ];

      const stale = getStaleEntries(schedule as NotificationScheduleEntry[]);
      expect(stale).toHaveLength(1);
      expect(stale[0].subscriptionId).toBe(validId1);
    });
  });
});

describe("useMissedNotificationsRecovery Hook", () => {
  const validId1 = "550e8400-e29b-41d4-a716-446655440000";
  const validId2 = "550e8400-e29b-41d4-a716-446655440001";

  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationScheduleStore.getState().clearSchedule();
    useSettingsStore.getState().setLastNotificationCheck(undefined);
    useUIStore.getState().clearDateFilter();
  });

  it("should show toast and mark as notified when missed notifications exist", async () => {
    const now = new Date();
    const today = startOfToday();
    const schedule: NotificationScheduleEntry[] = [
      {
        subscriptionId: validId1,
        scheduledFor: subDays(now, 1).toISOString(),
        paymentDueAt: today.toISOString(),
        notifiedAt: undefined,
      },
    ];

    useNotificationScheduleStore.getState().updateSchedule(schedule);

    const { result } = renderHook(() => useMissedNotificationsRecovery());

    await act(async () => {
      result.current.handleMissedNotifications();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining("1 ödeme hatırlatmasını kaçırdınız"),
      expect.any(Object)
    );

    // Check if marked as notified
    const updatedSchedule = useNotificationScheduleStore.getState().schedule;
    expect(updatedSchedule[0].notifiedAt).toBeDefined();

    // Check lastNotificationCheck update
    expect(useSettingsStore.getState().lastNotificationCheck).toBeDefined();
  });

  it("should update lastNotificationCheck even if no missed notifications", async () => {
    const { result } = renderHook(() => useMissedNotificationsRecovery());

    await act(async () => {
      result.current.handleMissedNotifications();
    });

    expect(toast).not.toHaveBeenCalled();
    expect(useSettingsStore.getState().lastNotificationCheck).toBeDefined();
  });

  it("should cleanup stale entries", async () => {
    const today = startOfToday();
    const schedule: NotificationScheduleEntry[] = [
      {
        subscriptionId: validId1,
        scheduledFor: subDays(today, 2).toISOString(),
        paymentDueAt: subDays(today, 1).toISOString(), // Stale
      },
      {
        subscriptionId: validId2,
        scheduledFor: today.toISOString(),
        paymentDueAt: addDays(today, 1).toISOString(), // Fresh
      },
    ];

    useNotificationScheduleStore.getState().updateSchedule(schedule);

    const { result } = renderHook(() => useMissedNotificationsRecovery());

    await act(async () => {
      result.current.cleanupStaleEntries();
    });

    const updatedSchedule = useNotificationScheduleStore.getState().schedule;
    expect(updatedSchedule).toHaveLength(1);
    expect(updatedSchedule[0].subscriptionId).toBe(validId2);
  });

  it("should set date filter when toast action is clicked", async () => {
    const now = new Date();
    const today = startOfToday();
    const dueDate = today.toISOString().split("T")[0];

    const schedule: NotificationScheduleEntry[] = [
      {
        subscriptionId: validId1,
        scheduledFor: subDays(now, 1).toISOString(),
        paymentDueAt: today.toISOString(),
        notifiedAt: undefined,
      },
    ];

    useNotificationScheduleStore.getState().updateSchedule(schedule);

    const { result } = renderHook(() => useMissedNotificationsRecovery());

    await act(async () => {
      result.current.handleMissedNotifications();
    });

    // Find the onClick handler from the toast call
    const toastCall = vi.mocked(toast).mock.calls[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = toastCall[1] as any;

    if (options && options.action) {
      await act(async () => {
        options.action.onClick({ preventDefault: vi.fn() });
      });
    }

    expect(useUIStore.getState().dateFilter).toBe(dueDate);
  });
});
