/**
 * Missed Notifications Recovery Hook
 *
 * Story 4.8: Detects missed notifications when app was closed/backgrounded
 * and shows recovery toast on app open or visibility change.
 *
 * AC1: Missed notification detection
 * AC2: Toast display with action
 * AC3: Clearing/marking as notified
 * AC4: lastNotificationCheck tracking
 */

import { useCallback } from "react";
import { startOfToday, isBefore, parseISO } from "date-fns";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useUIStore } from "@/stores/ui-store";
import { NOTIFICATION_STRINGS } from "@/lib/i18n/notifications";
import { logReliabilityBatch } from "@/services/notification-dispatcher";
import type { NotificationScheduleEntry } from "@/types/notification-schedule";

const MISSED_TOAST_DURATION = 8000; // 8 seconds for actionable toast

/**
 * Get missed notifications - entries where:
 * - scheduledFor < now (scheduled time has passed)
 * - !notifiedAt (never shown)
 * - paymentDueAt >= startOfToday (payment hasn't occurred yet - not stale)
 */
export function getMissedNotifications(
  schedule: NotificationScheduleEntry[]
): NotificationScheduleEntry[] {
  const now = new Date();
  const todayStart = startOfToday();

  return schedule.filter((entry) => {
    // Must not be notified
    if (entry.notifiedAt) return false;

    // Must have passed scheduled time
    const scheduledFor = parseISO(entry.scheduledFor);
    if (!isBefore(scheduledFor, now)) return false;

    // Must not be stale (payment due date should be today or future)
    const paymentDueAt = parseISO(entry.paymentDueAt);
    if (isBefore(paymentDueAt, todayStart)) return false;

    return true;
  });
}

/**
 * Cleanup stale entries - entries where payment date has already passed
 */
export function getStaleEntries(
  schedule: NotificationScheduleEntry[]
): NotificationScheduleEntry[] {
  const todayStart = startOfToday();

  return schedule.filter((entry) => {
    const paymentDueAt = parseISO(entry.paymentDueAt);
    return isBefore(paymentDueAt, todayStart);
  });
}

export function useMissedNotificationsRecovery() {
  const schedule = useNotificationScheduleStore((s) => s.schedule);
  const markBatchAsNotified = useNotificationScheduleStore(
    (s) => s.markBatchAsNotified
  );
  const updateSchedule = useNotificationScheduleStore((s) => s.updateSchedule);
  const setLastNotificationCheck = useSettingsStore(
    (s) => s.setLastNotificationCheck
  );
  const setDateFilter = useUIStore((s) => s.setDateFilter);

  /**
   * Handle missed notifications:
   * 1. Show toast with count
   * 2. Mark entries as notified
   * 3. Update lastNotificationCheck
   */
  const handleMissedNotifications = useCallback(() => {
    const missedEntries = getMissedNotifications(schedule);

    if (missedEntries.length === 0) {
      // AC5: No missed notifications, just update check timestamp
      setLastNotificationCheck(new Date().toISOString());
      return;
    }

    // Log reliability event
    logReliabilityBatch(
      missedEntries.map((entry) => entry.subscriptionId),
      "missed_recovery"
    );

    // Get unique missed payment dates for filter action
    const uniqueDates = [
      ...new Set(missedEntries.map((e) => e.paymentDueAt.split("T")[0])),
    ];

    // Show toast (AC2)
    const message = NOTIFICATION_STRINGS.MISSED_NOTIFICATIONS_TOAST.replace(
      "{{count}}",
      missedEntries.length.toString()
    );

    toast(message, {
      icon: <Bell className="h-4 w-4" />,
      duration: MISSED_TOAST_DURATION,
      action: {
        label: NOTIFICATION_STRINGS.MISSED_NOTIFICATIONS_ACTION,
        onClick: () => {
          // Set date filter to comma-separated list of unique dates
          setDateFilter(uniqueDates.join(","));
        },
      },
    });

    // Mark all missed entries as notified (AC3)
    markBatchAsNotified(missedEntries.map((e) => e.subscriptionId));

    // Update lastNotificationCheck (AC4)
    setLastNotificationCheck(new Date().toISOString());
  }, [schedule, markBatchAsNotified, setLastNotificationCheck, setDateFilter]);

  /**
   * Cleanup stale entries from schedule (AC6)
   */
  const cleanupStaleEntries = useCallback(() => {
    const staleEntries = getStaleEntries(schedule);
    if (staleEntries.length === 0) return;

    const staleIds = new Set(staleEntries.map((e) => e.subscriptionId));
    const cleanedSchedule = schedule.filter(
      (entry) => !staleIds.has(entry.subscriptionId)
    );

    if (cleanedSchedule.length !== schedule.length) {
      updateSchedule(cleanedSchedule);
      console.log(
        `[MissedNotificationsRecovery] Cleaned up ${staleEntries.length} stale entries`
      );
    }
  }, [schedule, updateSchedule]);

  /**
   * Combined recovery run
   */
  const runRecovery = useCallback(() => {
    cleanupStaleEntries();
    handleMissedNotifications();
  }, [cleanupStaleEntries, handleMissedNotifications]);

  // Expose for external use (by useNotificationLifecycle)
  return {
    runRecovery,
    handleMissedNotifications,
    cleanupStaleEntries,
    getMissedNotifications: () => getMissedNotifications(schedule),
    getStaleEntries: () => getStaleEntries(schedule),
  };
}
