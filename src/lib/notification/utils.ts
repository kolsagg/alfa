/**
 * Notification Utility Functions
 *
 * Story 4.7: Shared utilities for push notification state checks.
 */

import { isNotificationSupported } from "@/lib/notification-permission";

/**
 * Check if push notifications are actively enabled and working.
 *
 * Returns true only if:
 * 1. User has enabled notifications in app settings (notificationsEnabled)
 * 2. Browser permission is "granted"
 * 3. Notification API is supported in the browser
 *
 * @param notificationsEnabled - App-level notification toggle state
 * @param notificationPermission - Browser permission state from store
 * @returns boolean - true if push notifications are active
 */
export function isPushNotificationActive(
  notificationsEnabled: boolean,
  notificationPermission: string
): boolean {
  return (
    notificationsEnabled &&
    notificationPermission === "granted" &&
    isNotificationSupported()
  );
}
