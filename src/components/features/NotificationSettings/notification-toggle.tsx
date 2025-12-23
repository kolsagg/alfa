/**
 * NotificationToggle Component
 *
 * Story 4.2: Main toggle for enabling/disabling notifications in settings.
 * Implements the "Just-in-Time Permission" pattern:
 * - Requests browser permission when toggled ON (if not already granted)
 * - Shows iOS PWA modal when on iOS Safari (not standalone)
 * - Handles denied/unsupported states gracefully
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";
import {
  requestAndUpdatePermission,
  isNotificationSupported,
  getBrowserNotificationPermission,
} from "@/lib/notification-permission";
import { isPushNotificationActive } from "@/lib/notification/utils";
import { NOTIFICATION_STRINGS } from "@/lib/i18n/notifications";
import { detectIOSSafariNonStandalone } from "@/hooks/use-ios-pwa-detection";
import {
  Bell,
  BellOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface NotificationToggleProps {
  /** Callback when iOS Safari detected - triggers iOS PWA modal */
  onIOSSafariDetected?: () => void;
  /** Additional CSS classes */
  className?: string;
}

import { NOTIFICATION_CONFIG } from "@/config/notifications";

type ToggleState = "idle" | "loading" | "success" | "error";

export function NotificationToggle({
  onIOSSafariDetected,
  className,
}: NotificationToggleProps) {
  const [toggleState, setToggleState] = useState<ToggleState>("idle");

  const {
    notificationsEnabled,
    notificationPermission,
    setNotificationsEnabled,
    setNotificationPermission,
  } = useSettingsStore();

  // Check browser support and sync permission state on mount
  const isSupported = isNotificationSupported();
  const browserPermission = getBrowserNotificationPermission();

  // Sync store with browser permission on mount (handles out-of-sync scenarios)
  useEffect(() => {
    if (
      browserPermission !== "unsupported" &&
      browserPermission !== notificationPermission
    ) {
      const oldPermission = notificationPermission;
      setNotificationPermission(browserPermission);

      // Story 4.2 Fix: Provide feedback if permission was revoked externally
      if (oldPermission === "granted" && browserPermission === "denied") {
        import("sonner").then(({ toast }) => {
          toast.warning("Bildirim izni kapandı", {
            description:
              "Tarayıcı ayarlarından bildirim izni kaldırılmış görünüyor.",
          });
        });
      }
    }
  }, [browserPermission, notificationPermission, setNotificationPermission]);

  // Story 4.7: Use shared utility for push notification state
  const isEffectivelyEnabled = useMemo(
    () =>
      isPushNotificationActive(notificationsEnabled, notificationPermission),
    [notificationsEnabled, notificationPermission]
  );

  // Determine if toggle should be disabled
  const isDisabled =
    !isSupported ||
    notificationPermission === "denied" ||
    toggleState === "loading";

  const handleToggle = useCallback(
    async (checked: boolean) => {
      // If turning OFF, just update store
      if (!checked) {
        setNotificationsEnabled(false);
        return;
      }

      // If turning ON, we need to handle permission
      // Check for iOS Safari non-standalone first
      if (detectIOSSafariNonStandalone()) {
        onIOSSafariDetected?.();
        return;
      }

      // Check current permission state
      const currentBrowserPermission = getBrowserNotificationPermission();

      // Already granted - just enable
      if (currentBrowserPermission === "granted") {
        setNotificationsEnabled(true);
        setNotificationPermission("granted");
        return;
      }

      // Already denied - can't do anything
      if (currentBrowserPermission === "denied") {
        // Store is synced by useEffect, show guidance toast is handled by requestAndUpdatePermission
        return;
      }

      // Permission is "default" - request it
      setToggleState("loading");

      try {
        const granted = await requestAndUpdatePermission();

        if (granted) {
          setNotificationsEnabled(true);
          setToggleState("success");
          // Reset to idle after animation
          setTimeout(
            () => setToggleState("idle"),
            NOTIFICATION_CONFIG.SUCCESS_STATE_DURATION_MS
          );
        } else {
          setToggleState("error");
          setTimeout(
            () => setToggleState("idle"),
            NOTIFICATION_CONFIG.SUCCESS_STATE_DURATION_MS
          );
        }
      } catch {
        setToggleState("error");
        setTimeout(
          () => setToggleState("idle"),
          NOTIFICATION_CONFIG.SUCCESS_STATE_DURATION_MS
        );
      }
    },
    [onIOSSafariDetected, setNotificationsEnabled, setNotificationPermission]
  );

  // Render status indicator
  const renderStatusIndicator = () => {
    if (!isSupported) {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <AlertCircle className="size-4" />
          <span>{NOTIFICATION_STRINGS.SETTINGS_UNSUPPORTED}</span>
        </div>
      );
    }

    if (notificationPermission === "denied") {
      return (
        <div className="flex items-center gap-1.5 text-warning text-sm">
          <AlertCircle className="size-4" />
          <span>{NOTIFICATION_STRINGS.SETTINGS_DENIED}</span>
        </div>
      );
    }

    if (notificationPermission === "granted") {
      return (
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
          <CheckCircle2 className="size-4" />
          <span>
            {notificationsEnabled
              ? NOTIFICATION_STRINGS.SETTINGS_ACTIVE
              : NOTIFICATION_STRINGS.SETTINGS_GRANTED}
          </span>
        </div>
      );
    }

    return null;
  };

  // Render loading/success icon overlay on toggle
  const renderToggleIcon = () => {
    if (toggleState === "loading") {
      return <Loader2 className="size-4 animate-spin text-primary" />;
    }
    if (toggleState === "success") {
      return <CheckCircle2 className="size-4 text-green-500" />;
    }
    if (isEffectivelyEnabled) {
      return <Bell className="size-4 text-primary" />;
    }
    return <BellOff className="size-4 text-muted-foreground" />;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-muted/50">
            {renderToggleIcon()}
          </div>
          <div className="flex flex-col">
            <Label
              htmlFor="notification-toggle"
              className="text-base font-medium cursor-pointer"
            >
              Bildirimleri Etkinleştir
            </Label>
            <span className="text-sm text-muted-foreground">
              Ödeme hatırlatıcıları al
            </span>
          </div>
        </div>
        <Switch
          id="notification-toggle"
          checked={isEffectivelyEnabled}
          onCheckedChange={handleToggle}
          disabled={isDisabled}
          aria-describedby="notification-status"
        />
      </div>
      <div id="notification-status" className="mt-2 ml-12">
        {renderStatusIndicator()}
      </div>
    </div>
  );
}
