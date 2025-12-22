import { useEffect } from "react";
import {
  checkAndDispatchNotifications,
  syncNotificationPermissions,
} from "@/services/notification-dispatcher";

export function useNotificationLifecycle() {
  useEffect(() => {
    // Initial check
    checkAndDispatchNotifications();
    syncNotificationPermissions();

    // Interval (Every 60 seconds)
    const intervalId = setInterval(() => {
      checkAndDispatchNotifications();
      syncNotificationPermissions();
    }, 60 * 1000);

    // Visibility Listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndDispatchNotifications();
        syncNotificationPermissions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
