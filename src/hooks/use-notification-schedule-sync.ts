/**
 * Notification Schedule Sync Hook
 *
 * Automatically recalculates notification schedule when:
 * - Subscriptions change (add/update/delete)
 * - Notification settings change (daysBefore, time, enabled)
 *
 * Story 4.3 - Notification Scheduling Logic
 *
 * FOREGROUND-ONLY: Schedule calculation only occurs when app is open.
 */

import { useEffect, useRef, useCallback } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import {
  calculateNotificationSchedule,
  type ScheduleSettings,
} from "@/lib/notification-scheduling";
import { NOTIFICATION_CONFIG } from "@/config/notifications";

/**
 * Hook to keep notification schedule in sync with subscriptions and settings.
 *
 * Call this once at app level (App.tsx or DashboardLayout.tsx).
 *
 * @param options - Configuration options
 */
export function useNotificationScheduleSync(options?: {
  /** Custom debounce time in ms (default: 500) */
  debounceMs?: number;
}) {
  const debounceMs =
    options?.debounceMs ?? NOTIFICATION_CONFIG.SCHEDULE_DEBOUNCE_MS;

  // Store subscriptions
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  // Notification settings
  const notificationsEnabled = useSettingsStore(
    (state) => state.notificationsEnabled
  );
  const notificationPermission = useSettingsStore(
    (state) => state.notificationPermission
  );
  const notificationDaysBefore = useSettingsStore(
    (state) => state.notificationDaysBefore
  );
  const notificationTime = useSettingsStore((state) => state.notificationTime);

  // Schedule store actions
  const updateSchedule = useNotificationScheduleStore(
    (state) => state.updateSchedule
  );
  const clearSchedule = useNotificationScheduleStore(
    (state) => state.clearSchedule
  );

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if we've done initial calculation
  const hasInitializedRef = useRef(false);

  /**
   * Core recalculation function
   */
  const recalculateSchedule = useCallback(() => {
    const settings: ScheduleSettings = {
      notificationsEnabled,
      notificationPermission,
      notificationDaysBefore,
      notificationTime,
    };

    // Check preconditions
    if (!notificationsEnabled || notificationPermission !== "granted") {
      // Clear schedule if preconditions not met
      clearSchedule();

      if (import.meta.env.DEV) {
        console.log(
          "[NotificationScheduleSync] Preconditions not met - schedule cleared",
          { notificationsEnabled, notificationPermission }
        );
      }
      return;
    }

    // Calculate new schedule
    const newSchedule = calculateNotificationSchedule(subscriptions, settings);

    // Update store
    updateSchedule(newSchedule);

    if (import.meta.env.DEV) {
      console.log(
        "[NotificationScheduleSync] Schedule updated:",
        newSchedule.length,
        "entries"
      );
    }
  }, [
    subscriptions,
    notificationsEnabled,
    notificationPermission,
    notificationDaysBefore,
    notificationTime,
    updateSchedule,
    clearSchedule,
  ]);

  /**
   * Debounced recalculation to prevent rapid updates
   */
  const debouncedRecalculate = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      recalculateSchedule();
      debounceTimerRef.current = null;
    }, debounceMs);
  }, [recalculateSchedule, debounceMs]);

  // Effect: Calculate on mount and when dependencies change
  useEffect(() => {
    if (!hasInitializedRef.current) {
      // Initial calculation - immediate (no debounce)
      recalculateSchedule();
      hasInitializedRef.current = true;
    } else {
      // Subsequent changes - debounced
      debouncedRecalculate();
    }

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    subscriptions,
    notificationsEnabled,
    notificationPermission,
    notificationDaysBefore,
    notificationTime,
    recalculateSchedule,
    debouncedRecalculate,
  ]);

  // Return nothing - this is a side-effect only hook
}
