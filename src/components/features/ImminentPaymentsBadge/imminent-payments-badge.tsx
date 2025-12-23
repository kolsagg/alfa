/**
 * ImminentPaymentsBadge Component
 *
 * Story 4.7 AC5: Shows count of imminent payments (≤3 days) in the Header
 * when notifications are not active.
 *
 * Features:
 * - Uses role="status" and aria-label for screen readers
 * - Uses attention/urgent color based on urgency level
 * - Tapping sets UI dateFilter to show imminent payments
 */

import { useMemo, useCallback } from "react";
import { Bell } from "lucide-react";
import { useImminentPayments } from "@/hooks/use-imminent-payments";
import { useSettingsStore } from "@/stores/settings-store";
import { useUIStore } from "@/stores/ui-store";
import { isPushNotificationActive } from "@/lib/notification/utils";
import { formatImminentBadgeLabel } from "@/lib/i18n/notifications";
import { cn } from "@/lib/utils";

const urgencyColorMap = {
  critical: "bg-[var(--color-critical)] text-white",
  urgent: "bg-[var(--color-urgent)] text-white",
  attention: "bg-[var(--color-attention)] text-foreground",
} as const;

interface ImminentPaymentsBadgeProps {
  className?: string;
}

export function ImminentPaymentsBadge({
  className,
}: ImminentPaymentsBadgeProps) {
  const { notificationsEnabled, notificationPermission } = useSettingsStore();
  const setDateFilter = useUIStore((s) => s.setDateFilter);
  const { count, imminentDates, urgencyLevel } = useImminentPayments();

  // Story 4.7: Use shared utility for push notification state
  const isPushActive = useMemo(
    () =>
      isPushNotificationActive(notificationsEnabled, notificationPermission),
    [notificationsEnabled, notificationPermission]
  );

  // AC5: Tapping sets dateFilter to imminent dates (Multi-select supported by Story 4.5 logic)
  const handleClick = useCallback(() => {
    if (imminentDates.length > 0) {
      // Joining dates as a comma-separated string for the filter logic
      setDateFilter(imminentDates.join(","));
    }
  }, [imminentDates, setDateFilter]);

  // Don't render if push is active or no imminent payments
  if (isPushActive || count === 0 || !urgencyLevel) {
    return null;
  }

  const ariaLabel = formatImminentBadgeLabel(count);

  return (
    <button
      type="button"
      role="status"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
        "transition-all duration-200 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
        urgencyColorMap[urgencyLevel],
        className
      )}
    >
      <Bell className="size-4" aria-hidden="true" />
      <span className="text-sm font-bold tabular-nums">{count}</span>
    </button>
  );
}
