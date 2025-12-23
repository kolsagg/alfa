/**
 * NotificationBanner Component
 *
 * Story 4.2 AC#4: Graceful degradation banner for denied notification permission.
 * Story 4.7: Extended to handle unsupported browsers and iOS modal priority.
 *
 * Visibility logic:
 * - Shows when permission is "denied" OR browser unsupported (AC6)
 * - Within first 7 days after denial: always shows
 * - After 7 days: only shows if a payment is imminent (≤3 days)
 * - User can permanently dismiss with "Bir daha gösterme" button
 * - IF iOS Install Guidance modal is active, banner is suppressed (AC1)
 */

import { useMemo } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { useIOSPWADetection } from "@/hooks/use-ios-pwa-detection";
import { cn } from "@/lib/utils";
import { shouldShowNotificationBanner } from "./utils";
import { NOTIFICATION_STRINGS } from "@/lib/i18n/notifications";

interface NotificationBannerProps {
  /** Next payment date (ISO string or Date) for imminent payment check */
  nextPaymentDate?: string | Date;
  /** Additional CSS classes */
  className?: string;
}

export function NotificationBanner({
  nextPaymentDate,
  className,
}: NotificationBannerProps) {
  const {
    notificationPermission,
    notificationPermissionDeniedAt,
    notificationBannerDismissedAt,
    dismissNotificationBanner,
  } = useSettingsStore();

  // Story 4.7 AC1: Check if iOS modal is active
  const { shouldShowPrompt: isIOSModalActive } = useIOSPWADetection();

  const shouldShow = useMemo(
    () =>
      shouldShowNotificationBanner(
        {
          notificationPermission,
          notificationPermissionDeniedAt,
          notificationBannerDismissedAt,
        },
        nextPaymentDate,
        isIOSModalActive // Story 4.7: Suppress if iOS modal is active
      ),
    [
      notificationPermission,
      notificationPermissionDeniedAt,
      notificationBannerDismissedAt,
      nextPaymentDate,
      isIOSModalActive,
    ]
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 rounded-lg",
        "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800",
        "text-amber-800 dark:text-amber-200",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className="size-5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">
          {NOTIFICATION_STRINGS.BANNER_DENIED}
        </p>
      </div>
      <button
        type="button"
        onClick={dismissNotificationBanner}
        className={cn(
          "shrink-0 p-1.5 rounded-md transition-colors",
          "hover:bg-amber-200/50 dark:hover:bg-amber-800/50",
          "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
          "dark:focus:ring-offset-amber-950"
        )}
        aria-label={NOTIFICATION_STRINGS.BANNER_DISMISS_ARIA}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
