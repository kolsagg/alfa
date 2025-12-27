/**
 * Notification Permission Helper
 *
 * Implements the Just-in-Time permission request pattern:
 * - Shows toast prompt after first subscription is added
 * - Handles iOS Safari non-PWA case with special message
 * - Stores permission result in SettingsStore
 *
 * This is a STUB for Epic 4 - only handles permission request, not scheduling.
 */

import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { detectIOSSafariNonStandalone } from "@/hooks/use-ios-pwa-detection";
import { logger } from "@/lib/event-logger";

/**
 * Request notification permission from the browser.
 * Returns the permission result.
 * Handles browsers that don't support Notification API.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  // Check if Notification API is available
  if (typeof Notification === "undefined") {
    console.warn(
      "[NotificationPermission] Notification API not available in this browser"
    );
    return "denied";
  }

  // Check current permission
  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (error) {
    console.error("[NotificationPermission] Permission request failed:", error);
    return "denied";
  }
}

/**
 * Shows a toast-based notification permission prompt.
 * Uses sonner toast with action buttons for non-blocking UX.
 *
 * @param subscriptionName - Name of the subscription to personalize the prompt
 */
export function showNotificationPermissionPrompt(
  subscriptionName: string
): void {
  const settings = useSettingsStore.getState();
  const setNotificationPermission = settings.setNotificationPermission;
  const setHasSeenNotificationPrompt = settings.setHasSeenNotificationPrompt;

  // Mark as seen immediately when triggered
  setHasSeenNotificationPrompt(true);

  // Check for iOS Safari non-standalone first
  if (detectIOSSafariNonStandalone()) {
    toast.info("Bildirimler için lütfen uygulamayı Ana Ekrana ekleyin.", {
      duration: 5000,
      description:
        "iOS'ta bildirimler sadece Ana Ekrana eklenen uygulamalarda çalışır.",
    });
    return;
  }

  // Standard browser permission request
  toast(`${subscriptionName} için ödeme hatırlatıcısı kurulsun mu?`, {
    duration: Infinity, // Don't auto-dismiss - user must take action
    action: {
      label: "Evet, Bildirim Gönder",
      onClick: async () => {
        const result = await requestNotificationPermission();
        setNotificationPermission(result);

        if (result === "granted") {
          toast.success("Bildirimler aktif!", {
            description: "Ödeme hatırlatıcıları artık size gönderilecek.",
          });
        } else if (result === "denied") {
          // Story 7.1: Log notification denied event
          logger.log("notification_denied", { source: "toast_prompt" });
          toast.info("Bildirimleri daha sonra Ayarlar'dan açabilirsiniz.", {
            duration: 4000,
          });
        }
      },
    },
    cancel: {
      label: "Şimdi Değil",
      onClick: () => {
        toast.info("Bildirimleri daha sonra Ayarlar'dan açabilirsiniz.", {
          duration: 3000,
        });
      },
    },
  });
}

/**
 * Request notification permission and update SettingsStore.
 * Shows appropriate toast based on result.
 *
 * Story 4.2: This is the primary function for settings toggle integration.
 *
 * @returns boolean - true if permission granted, false otherwise
 */
export async function requestAndUpdatePermission(): Promise<boolean> {
  const { setNotificationPermission, setNotificationPermissionDenied } =
    useSettingsStore.getState();

  // Check if Notification API is available
  if (typeof Notification === "undefined") {
    toast.error("Bu tarayıcı bildirimleri desteklemiyor.", {
      duration: 4000,
    });
    return false;
  }

  // Check current browser permission state
  const currentPermission = Notification.permission;

  // Already granted - sync store and return success
  if (currentPermission === "granted") {
    setNotificationPermission("granted");
    toast.success("Bildirimler aktif!", {
      description: "Ödeme hatırlatıcıları artık size gönderilecek.",
    });
    return true;
  }

  // Already denied - can't request again, show guidance
  if (currentPermission === "denied") {
    setNotificationPermissionDenied();
    // Story 7.1: Log notification denied event
    logger.log("notification_denied", {
      source: "settings_toggle",
      reason: "already_denied",
    });
    toast.info("Bildirimleri daha sonra tarayıcı ayarlarından açabilirsiniz.", {
      duration: 5000,
    });
    return false;
  }

  // Permission is "default" - request it
  try {
    const result = await Notification.requestPermission();

    if (result === "granted") {
      setNotificationPermission("granted");
      toast.success("Bildirimler aktif!", {
        description: "Ödeme hatırlatıcıları artık size gönderilecek.",
      });
      return true;
    } else if (result === "denied") {
      setNotificationPermissionDenied();
      // Story 7.1: Log notification denied event
      logger.log("notification_denied", {
        source: "settings_toggle",
        reason: "user_denied",
      });
      toast.info(
        "Bildirimleri daha sonra tarayıcı ayarlarından açabilirsiniz.",
        {
          duration: 5000,
        }
      );
      return false;
    }

    // "default" returned (user dismissed without choosing)
    return false;
  } catch (error) {
    console.error("[NotificationPermission] Permission request failed:", error);
    toast.error("Bildirim izni istenemedi. Lütfen tekrar deneyin.", {
      duration: 4000,
    });
    return false;
  }
}

/**
 * Check if notifications are supported in the current browser.
 */
export function isNotificationSupported(): boolean {
  return typeof Notification !== "undefined";
}

/**
 * Get the current browser notification permission state.
 * Returns "unsupported" if Notification API is not available.
 */
export function getBrowserNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.permission;
}
