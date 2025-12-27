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

import { useMemo, useCallback, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useImminentPayments } from "@/hooks/use-imminent-payments";
import { useSettingsStore } from "@/stores/settings-store";
import { useUIStore } from "@/stores/ui-store";
import { isPushNotificationActive } from "@/lib/notification/utils";
import { formatImminentBadgeLabel } from "@/lib/i18n/notifications";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const urgencyColorMap = {
  critical:
    "bg-[var(--color-critical)] text-white hover:bg-[var(--color-critical)]/90",
  urgent:
    "bg-[var(--color-urgent)] text-white hover:bg-[var(--color-urgent)]/90",
  attention:
    "bg-[var(--color-attention)] text-foreground hover:bg-[var(--color-attention)]/90",
} as const;

interface ImminentPaymentsBadgeProps {
  className?: string;
}

export function ImminentPaymentsBadge({
  className,
}: ImminentPaymentsBadgeProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { notificationsEnabled, notificationPermission } = useSettingsStore();
  const setDateFilter = useUIStore((s) => s.setDateFilter);
  const { count, imminentDates, payments, urgencyLevel } =
    useImminentPayments();

  // Story 4.7: Use shared utility for push notification state
  const isPushActive = useMemo(
    () =>
      isPushNotificationActive(notificationsEnabled, notificationPermission),
    [notificationsEnabled, notificationPermission]
  );

  const handleDashboardClick = useCallback(() => {
    if (imminentDates.length > 0) {
      setDateFilter(imminentDates.join(","));
      navigate(ROUTES.DASHBOARD);
      setIsOpen(false);
    }
  }, [imminentDates, setDateFilter, navigate]);

  // Don't render if push is active or no imminent payments
  if (isPushActive || count === 0 || !urgencyLevel) {
    return null;
  }

  const ariaLabel = formatImminentBadgeLabel(count);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="status"
          aria-label={ariaLabel}
          className={cn(
            "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
            "transition-all duration-200 ease-out",
            "active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
            urgencyColorMap[urgencyLevel],
            className
          )}
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="text-sm font-bold tabular-nums">{count}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0 overflow-hidden bg-zinc-950 border-zinc-800 shadow-2xl"
      >
        <div className="p-3 border-b border-white/10">
          <h4 className="font-semibold text-sm text-zinc-100">
            Yaklaşan Ödemeler
          </h4>
          <p className="text-xs text-zinc-400">
            Bildirimler kapalı olduğu için gösteriliyor
          </p>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-medium text-sm truncate text-zinc-200 group-hover:text-white">
                  {payment.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 border",
                  payment.daysUntil <= 1
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}
              >
                {payment.daysUntil === 0
                  ? "Bugün"
                  : payment.daysUntil === 1
                  ? "Yarın"
                  : `${payment.daysUntil} gün`}
              </span>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-white/10 bg-white/[0.02]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5"
            onClick={handleDashboardClick}
          >
            Dashboard'da Göster
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
