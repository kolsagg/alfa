import { isBefore, parseISO } from "date-fns";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { displayNotification } from "@/lib/notification/display-service";

export function checkAndDispatchNotifications() {
  const scheduleStore = useNotificationScheduleStore.getState();
  const subscriptionStore = useSubscriptionStore.getState();
  const pending = scheduleStore.getPendingNotifications();
  const now = new Date();

  pending.forEach((entry) => {
    const scheduledTime = parseISO(entry.scheduledFor);

    if (isBefore(scheduledTime, now)) {
      // Race Condition Protection: Re-check store current state
      // Accessing state directly inside the loop ensures we have the absolute latest state
      const currentEntry = useNotificationScheduleStore
        .getState()
        .getEntryBySubscriptionId(entry.subscriptionId);

      // If it became notified while we were processing or via another tab
      if (currentEntry?.notifiedAt) {
        return;
      }

      const subscription = subscriptionStore.getSubscriptionById(
        entry.subscriptionId
      );

      if (!subscription) {
        console.warn(
          `[Dispatcher] Subscription ${entry.subscriptionId} not found`
        );
        return;
      }

      // Dispatch
      try {
        const notification = displayNotification({
          subscription,
          paymentDueAt: entry.paymentDueAt,
        });

        if (notification) {
          // Update store immediately
          useNotificationScheduleStore
            .getState()
            .markAsNotified(entry.subscriptionId);
          logReliability(entry.subscriptionId, "success");
        } else {
          logReliability(entry.subscriptionId, "blocked"); // Permission denied or error
        }
      } catch (error) {
        console.error(
          `[Dispatcher] Error displaying notification for ${entry.subscriptionId}`,
          error
        );
        logReliability(entry.subscriptionId, "error");
      }
    }
  });
}

function logReliability(
  subscriptionId: string,
  status: "success" | "blocked" | "error"
) {
  try {
    const existingLog = localStorage.getItem("reliabilityLog");
    const log = existingLog ? JSON.parse(existingLog) : [];

    log.push({
      timestamp: new Date().toISOString(),
      subscriptionId,
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
