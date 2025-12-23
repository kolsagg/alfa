import { useEffect } from "react";
import {
  checkAndDispatchNotifications,
  syncNotificationPermissions,
} from "@/services/notification-dispatcher";
import { useMissedNotificationsRecovery } from "./use-missed-notifications-recovery";

export function useNotificationLifecycle() {
  const { runRecovery } = useMissedNotificationsRecovery();

  useEffect(() => {
    // Initial recovery and check (Story 4.8)
    runRecovery();
    checkAndDispatchNotifications();
    syncNotificationPermissions();

    // Interval (Every 60 seconds)
    const intervalId = setInterval(() => {
      // Periodic check with recovery to handle device wake-up after long sleep
      // where checkAndDispatchNotifications tolerance might be exceeded.
      runRecovery();
      checkAndDispatchNotifications();
      syncNotificationPermissions();
    }, 60 * 1000);

    // Visibility Listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Run recovery before dispatch on visibility change (AC1)
        runRecovery();
        checkAndDispatchNotifications();
        syncNotificationPermissions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [runRecovery]);
}
