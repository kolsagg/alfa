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
