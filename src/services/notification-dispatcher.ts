import { isBefore, parseISO, startOfDay } from "date-fns";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  displayNotification,
  displayGroupedNotification,
} from "@/lib/notification/display-service";
import type { NotificationScheduleEntry } from "@/types/notification-schedule";

/**
 * Group pending entries by payment due date
 * Story 4.5 - AC1: Batch Processing in Dispatcher
 */
function groupEntriesByPaymentDate(
  entries: NotificationScheduleEntry[]
): Map<string, NotificationScheduleEntry[]> {
  const groups = new Map<string, NotificationScheduleEntry[]>();

  for (const entry of entries) {
    // Use start of day as the grouping key
    const dateKey = startOfDay(parseISO(entry.paymentDueAt)).toISOString();

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(entry);
  }

  return groups;
}

export function checkAndDispatchNotifications() {
  const scheduleStore = useNotificationScheduleStore.getState();
  const subscriptionStore = useSubscriptionStore.getState();
  const pending = scheduleStore.getPendingNotifications();
  const now = new Date();

  // Filter entries that are ready to dispatch (scheduled time has passed)
  const readyToDispatch = pending.filter((entry) => {
    const scheduledTime = parseISO(entry.scheduledFor);
    return isBefore(scheduledTime, now);
  });

  if (readyToDispatch.length === 0) return;

  // Story 4.5 AC1: Group by payment due date
  const groups = groupEntriesByPaymentDate(readyToDispatch);

  for (const [dateKey, entries] of groups) {
    // AC1: Re-check store state for race condition protection
    const validEntries = entries.filter((entry) => {
      const currentEntry = useNotificationScheduleStore
        .getState()
        .getEntryBySubscriptionId(entry.subscriptionId);
      return currentEntry && !currentEntry.notifiedAt;
    });

    if (validEntries.length === 0) continue;

    // Gather subscription data
    const subscriptions = validEntries
      .map((entry) => {
        const sub = subscriptionStore.getSubscriptionById(entry.subscriptionId);
        if (!sub) {
          console.warn(
            `[Dispatcher] Subscription ${entry.subscriptionId} not found`
          );
          return null;
        }
        return {
          id: sub.id,
          name: sub.name,
          cost: sub.amount,
          currency: sub.currency,
          icon: sub.icon,
          color: sub.color,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (subscriptions.length === 0) continue;

    const paymentDueAt = validEntries[0].paymentDueAt;

    try {
      let notification: Notification | null;

      // AC3: Single Notification Fallback - use single display for 1 subscription
      if (subscriptions.length === 1) {
        notification = displayNotification({
          subscription: subscriptions[0],
          paymentDueAt,
        });
      } else {
        // Multiple subscriptions - use grouped display
        notification = displayGroupedNotification({
          subscriptions,
          paymentDueAt,
        });
      }

      if (notification) {
        // AC1: Mark batch as notified using new batch action
        const subscriptionIds = validEntries.map((e) => e.subscriptionId);
        useNotificationScheduleStore
          .getState()
          .markBatchAsNotified(subscriptionIds);

        // Log batch status
        logReliabilityBatch(subscriptionIds, "success");
      } else {
        // Permission denied or error
        logReliabilityBatch(
          validEntries.map((e) => e.subscriptionId),
          "blocked"
        );
      }
    } catch (error) {
      console.error(
        `[Dispatcher] Error displaying notification for group ${dateKey}`,
        error
      );
      logReliabilityBatch(
        validEntries.map((e) => e.subscriptionId),
        "error"
      );
    }
  }
}

/**
 * Log reliability for a batch of subscriptions
 * Story 4.5 - Task 2.3: Updated to support batch logging
 */
export function logReliabilityBatch(
  subscriptionIds: string[],
  status: "success" | "blocked" | "error" | "missed_recovery"
) {
  try {
    const existingLog = localStorage.getItem("reliabilityLog");
    const log = existingLog ? JSON.parse(existingLog) : [];

    log.push({
      timestamp: new Date().toISOString(),
      subscriptionIds,
      count: subscriptionIds.length,
      status,
      userAgent: navigator.userAgent,
    });

    // Keep log size manageable (last 100 entries)
    if (log.length > 100) {
      log.shift();
    }

    localStorage.setItem("reliabilityLog", JSON.stringify(log));
  } catch (e) {
    console.error("[Dispatcher] Failed to write reliability log", e);
  }
}

/**
 * Syncs the browser's Notification.permission with the SettingsStore.
 * Called periodically or on visibility change.
 */
export function syncNotificationPermissions() {
  if (typeof Notification === "undefined") return;

  const currentPermission = Notification.permission;
  const storePermission = useSettingsStore.getState().notificationPermission;

  if (currentPermission !== storePermission) {
    useSettingsStore.getState().setNotificationPermission(currentPermission);

    if (currentPermission === "denied") {
      useSettingsStore.getState().setNotificationPermissionDenied();
    }
  }
}
