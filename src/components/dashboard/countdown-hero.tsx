import { useState, useEffect, useRef, useMemo } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { isPushNotificationActive } from "@/lib/notification/utils";
import { formatCurrency } from "@/lib/formatters";
import {
  getTimeRemaining,
  getCountdownUrgency,
  getNextPayment,
  formatCountdown,
  getIntervalMs,
  type CountdownUrgency,
  type TimeRemaining,
} from "@/lib/countdown-utils";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, BellOff } from "lucide-react";
import { NOTIFICATION_CONFIG } from "@/config/notifications";
import { NOTIFICATION_STRINGS } from "@/lib/i18n/notifications";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const urgencyStyles: Record<CountdownUrgency, string> = {
  subtle: "from-muted/10 via-background to-background",
  attention: "from-[var(--color-attention)]/10 via-background to-background",
  urgent: "from-[var(--color-urgent)]/15 via-background to-background",
  critical: "from-[var(--color-critical)]/20 via-background to-background",
} as const;

const urgencyTextStyles: Record<CountdownUrgency, string> = {
  subtle: "text-muted-foreground",
  attention: "text-[var(--color-attention)]",
  urgent: "text-[var(--color-urgent)]",
  critical: "text-[var(--color-critical)]",
} as const;

export function CountdownHero() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const { notificationsEnabled, notificationPermission } = useSettingsStore();
  const reducedMotion = useReducedMotion();

  // Story 4.7: Use shared utility for push notification state
  const isPushActive = useMemo(
    () =>
      isPushNotificationActive(notificationsEnabled, notificationPermission),
    [notificationsEnabled, notificationPermission]
  );

  // 1. Optimize nextPayment calculation
  const nextPayment = useMemo(
    () => getNextPayment(subscriptions),
    [subscriptions]
  );

  // 2. Initialize state with fresh calculation
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(() =>
    nextPayment ? getTimeRemaining(nextPayment.nextPaymentDate) : null
  );

  const lastAnnouncedRef = useRef<string>("");

  // 3. Derived values (Performant)
  const urgency: CountdownUrgency = useMemo(
    () =>
      timeRemaining ? getCountdownUrgency(timeRemaining.totalMs) : "subtle",
    [timeRemaining]
  );

  const countdownText = useMemo(
    () => (timeRemaining ? formatCountdown(timeRemaining, urgency) : ""),
    [timeRemaining, urgency]
  );

  const announcementText = useMemo(() => {
    if (!timeRemaining || !nextPayment) return "";
    return `${nextPayment.name}, ${formatCurrency(
      nextPayment.amount,
      nextPayment.currency
    )}, ${
      timeRemaining.isPast
        ? "bugün"
        : `${timeRemaining.days} gün ${timeRemaining.hours} saat sonra`
    }`;
  }, [timeRemaining, nextPayment]);

  const [prevPaymentId, setPrevPaymentId] = useState<string | undefined>(
    nextPayment?.id
  );

  // Synchronous state adjustment when nextPayment changes
  if (nextPayment?.id !== prevPaymentId) {
    setPrevPaymentId(nextPayment?.id);
    setTimeRemaining(
      nextPayment ? getTimeRemaining(nextPayment.nextPaymentDate) : null
    );
  }

  // 5. Timer: only calls setState in callback
  useEffect(() => {
    if (!nextPayment) return;

    const intervalMs = getIntervalMs(urgency);
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(nextPayment.nextPaymentDate));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [nextPayment, urgency]);

  // 6. Refresh on visibility change
  useEffect(() => {
    if (!nextPayment) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setTimeRemaining(getTimeRemaining(nextPayment.nextPaymentDate));
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    return () =>
      window.removeEventListener("visibilitychange", handleVisibility);
  }, [nextPayment]);

  // 7. Update announcement ref (Side effect)
  useEffect(() => {
    if (
      countdownText &&
      urgency !== "critical" &&
      countdownText !== lastAnnouncedRef.current
    ) {
      lastAnnouncedRef.current = countdownText;
    }
  }, [countdownText, urgency]);

  // Empty state
  if (!nextPayment || !timeRemaining) {
    return (
      <section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-6 border border-border/50"
        aria-label="Yaklaşan ödeme sayacı"
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Bir sonraki ödeme
          </p>
          <div className="text-5xl font-extrabold tracking-tight text-foreground tabular-nums font-jakarta">
            --:--:--
          </div>
          <p className="text-lg font-semibold text-foreground/80">
            Henüz abonelik yok
          </p>
          <p className="text-xs text-muted-foreground">
            İlk aboneliğinizi ekleyin ve ödemeleri takip etmeye başlayın
          </p>
        </div>
      </section>
    );
  }

  const formattedAmount = formatCurrency(
    nextPayment.amount,
    nextPayment.currency
  );
  const initial = (nextPayment.name || "?").charAt(0).toUpperCase();

  const ariaLabel = `${nextPayment.name}, ${formattedAmount}, ${
    timeRemaining.isPast
      ? "bugün"
      : `${timeRemaining.days} gün ${timeRemaining.hours} saat sonra`
  }`;

  // AC7: Payment is imminent if it's within the configured threshold
  const isImminent =
    timeRemaining.totalMs <
    NOTIFICATION_CONFIG.IMMINENT_PAYMENT_DAYS * 24 * 60 * 60 * 1000;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 border border-border/50",
        urgencyStyles[urgency],
        (urgency === "urgent" || urgency === "critical") &&
          !reducedMotion &&
          "animate-countdown-pulse",
        // AC4/AC7: Emphasize if notifications are not helping
        !isPushActive &&
          isImminent &&
          !reducedMotion &&
          "ring-2 ring-primary/20 ring-offset-2",
        // AC4: respect prefers-reduced-motion - use bold border instead
        !isPushActive &&
          isImminent &&
          reducedMotion &&
          "border-2 border-[var(--color-urgent)]"
      )}
      aria-label={ariaLabel}
    >
      {/* AC7: Persistent Alert Badge for high urgency without push notifications */}
      {!isPushActive && isImminent && (
        <div
          className={cn(
            "absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full",
            "bg-[var(--color-urgent)]/10 text-[var(--color-urgent)]",
            "animate-in fade-in zoom-in duration-300",
            // AC4: respect prefers-reduced-motion
            reducedMotion &&
              "!animate-none border-2 border-[var(--color-urgent)]"
          )}
          title={NOTIFICATION_STRINGS.HERO_ALERT_TITLE}
        >
          <BellOff className="size-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {NOTIFICATION_STRINGS.HERO_NO_PUSH}
          </span>
        </div>
      )}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcementText}
      </div>

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          {(urgency === "urgent" || urgency === "critical") && (
            <AlertTriangle
              className={cn("w-4 h-4", urgencyTextStyles[urgency])}
              aria-hidden="true"
            />
          )}
          {urgency !== "urgent" && urgency !== "critical" && (
            <Clock
              className="w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <p className="text-sm font-medium text-muted-foreground">
            Bir sonraki ödeme
          </p>
        </div>

        <div
          className={cn(
            "text-5xl font-extrabold tracking-tight tabular-nums font-jakarta",
            urgencyTextStyles[urgency],
            urgency === "critical" && "animate-attention-shake"
          )}
        >
          {countdownText}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg font-semibold text-muted-foreground">
              {initial}
            </span>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold text-foreground">
              {nextPayment.name}
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              {formattedAmount}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
