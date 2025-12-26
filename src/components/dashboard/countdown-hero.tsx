import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useFXStore } from "@/stores/fx-store";
import { isPushNotificationActive } from "@/lib/notification/utils";
import { formatCurrency } from "@/lib/formatters";
import {
  getTimeRemaining,
  getCountdownUrgency,
  getNextFuturePayment,
  getTodaysPayments,
  getAllTodaysPayments,
  getUpcoming7DaysPayments,
  formatCountdown,
  getIntervalMs,
  type CountdownUrgency,
  type TimeRemaining,
} from "@/lib/countdown-utils";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  BellOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

type HeroView = "today" | "upcoming";

export function CountdownHero() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const { notificationsEnabled, notificationPermission } = useSettingsStore();
  const reducedMotion = useReducedMotion();

  // Get today's top 3 payments for display
  const todaysPayments = useMemo(
    () => getTodaysPayments(subscriptions),
    [subscriptions]
  );

  // Get ALL today's payments for total count and amount
  const allTodaysPayments = useMemo(
    () => getAllTodaysPayments(subscriptions),
    [subscriptions]
  );

  // Get upcoming payments within 7 days (excluding today)
  const upcoming7Days = useMemo(
    () => getUpcoming7DaysPayments(subscriptions),
    [subscriptions]
  );

  const nextFuturePayment = useMemo(
    () => getNextFuturePayment(subscriptions),
    [subscriptions]
  );

  const hasPaymentsToday = todaysPayments.length > 0;
  const hasUpcoming = upcoming7Days.length > 0 || nextFuturePayment !== null;

  // Display payment: first from 7-day list, or next future payment
  const displayPayment = upcoming7Days[0] || nextFuturePayment;

  // Track current view
  const [currentView, setCurrentView] = useState<HeroView>(
    hasPaymentsToday ? "today" : "upcoming"
  );

  // Smooth swipe state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      touchStartX.current = e.touches[0].clientX;
    },
    [isAnimating]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || isAnimating) return;
      const currentX = e.touches[0].clientX;
      const diff = touchStartX.current - currentX;

      // Limit swipe offset and add resistance at edges
      const maxOffset = 150;
      let offset = Math.max(-maxOffset, Math.min(maxOffset, diff));

      // Add resistance if trying to swipe in unavailable direction
      if (currentView === "today" && diff < 0 && !hasPaymentsToday) {
        offset = diff * 0.2;
      }
      if (currentView === "upcoming" && diff > 0 && !hasUpcoming) {
        offset = diff * 0.2;
      }

      setSwipeOffset(offset);
    },
    [currentView, hasPaymentsToday, hasUpcoming, isAnimating]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;

    const threshold = 50;
    setIsAnimating(true);

    if (Math.abs(swipeOffset) > threshold) {
      if (swipeOffset > 0 && currentView === "today" && hasUpcoming) {
        setCurrentView("upcoming");
      } else if (
        swipeOffset < 0 &&
        currentView === "upcoming" &&
        hasPaymentsToday
      ) {
        setCurrentView("today");
      }
    }

    // Animate back to center
    setSwipeOffset(0);
    touchStartX.current = null;

    // Reset animation lock after transition
    setTimeout(() => setIsAnimating(false), 300);
  }, [swipeOffset, currentView, hasUpcoming, hasPaymentsToday]);

  // Arrow navigation
  const canGoLeft = currentView === "upcoming" && hasPaymentsToday;
  const canGoRight = currentView === "today" && hasUpcoming;

  const goLeft = useCallback(() => {
    if (canGoLeft && !isAnimating) {
      setIsAnimating(true);
      setCurrentView("today");
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [canGoLeft, isAnimating]);

  const goRight = useCallback(() => {
    if (canGoRight && !isAnimating) {
      setIsAnimating(true);
      setCurrentView("upcoming");
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [canGoRight, isAnimating]);

  // Push notification status
  const isPushActive = useMemo(
    () =>
      isPushNotificationActive(notificationsEnabled, notificationPermission),
    [notificationsEnabled, notificationPermission]
  );

  // Time remaining for upcoming payment
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(() =>
    displayPayment ? getTimeRemaining(displayPayment.nextPaymentDate) : null
  );

  const lastAnnouncedRef = useRef<string>("");

  // Derived values for upcoming view
  const urgency: CountdownUrgency = useMemo(
    () =>
      timeRemaining ? getCountdownUrgency(timeRemaining.totalMs) : "subtle",
    [timeRemaining]
  );

  const countdownText = useMemo(
    () => (timeRemaining ? formatCountdown(timeRemaining, urgency) : ""),
    [timeRemaining, urgency]
  );

  // Sync time remaining when future payment changes
  const [prevPaymentId, setPrevPaymentId] = useState<string | undefined>(
    displayPayment?.id
  );

  if (displayPayment?.id !== prevPaymentId) {
    setPrevPaymentId(displayPayment?.id);
    setTimeRemaining(
      displayPayment ? getTimeRemaining(displayPayment.nextPaymentDate) : null
    );
  }

  // Timer for countdown
  useEffect(() => {
    if (!displayPayment) return;

    const intervalMs = getIntervalMs(urgency);
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(displayPayment.nextPaymentDate));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [displayPayment, urgency]);

  // Refresh on visibility change
  useEffect(() => {
    if (!displayPayment) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setTimeRemaining(getTimeRemaining(displayPayment.nextPaymentDate));
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    return () =>
      window.removeEventListener("visibilitychange", handleVisibility);
  }, [displayPayment]);

  // Update announcement ref
  useEffect(() => {
    if (
      countdownText &&
      urgency !== "critical" &&
      countdownText !== lastAnnouncedRef.current
    ) {
      lastAnnouncedRef.current = countdownText;
    }
  }, [countdownText, urgency]);

  // Empty state - no payments at all
  if (!hasPaymentsToday && !hasUpcoming) {
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

  // Payment info for upcoming view
  const formattedUpcomingAmount = displayPayment
    ? formatCurrency(displayPayment.amount, displayPayment.currency)
    : "";

  // Calculate total for ALL today's payments (not just top 3)
  // Convert all amounts to TRY using exchange rates
  const rates = useFXStore((state) => state.rates);
  const todayTotal = allTodaysPayments.reduce((sum, s) => {
    const rate = rates[s.currency] || 1;
    return sum + s.amount * rate;
  }, 0);

  const todayTotalFormatted = formatCurrency(todayTotal, "TRY");
  const remainingTodayCount = allTodaysPayments.length - todaysPayments.length;

  // AC7: Payment is imminent
  const isImminent =
    timeRemaining !== null &&
    timeRemaining.totalMs <
      NOTIFICATION_CONFIG.IMMINENT_PAYMENT_DAYS * 24 * 60 * 60 * 1000;

  // Determine which urgency to use based on view
  const activeUrgency = currentView === "today" ? "critical" : urgency;

  const showNavIndicators = hasPaymentsToday && hasUpcoming;

  // Calculate view positions for smooth animation
  const todayTransform =
    currentView === "today"
      ? `translateX(${-swipeOffset}px)`
      : "translateX(-100%)";
  const upcomingTransform =
    currentView === "upcoming"
      ? `translateX(${-swipeOffset}px)`
      : "translateX(100%)";

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 border border-border/50 select-none",
        urgencyStyles[activeUrgency],
        (activeUrgency === "urgent" || activeUrgency === "critical") &&
          !reducedMotion &&
          "animate-countdown-pulse",
        !isPushActive &&
          isImminent &&
          !reducedMotion &&
          "ring-2 ring-primary/20 ring-offset-2",
        !isPushActive &&
          isImminent &&
          reducedMotion &&
          "border-2 border-[var(--color-urgent)]"
      )}
      aria-label="Ödeme sayacı"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation arrows */}
      {showNavIndicators && (
        <>
          {canGoLeft && (
            <button
              onClick={goLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors z-10"
              aria-label="Bugünün ödemelerine git"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          {canGoRight && (
            <button
              onClick={goRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors z-10"
              aria-label="Yaklaşan ödemeye git"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </>
      )}

      {/* Alert badge */}
      {!isPushActive && isImminent && currentView === "upcoming" && (
        <div
          className={cn(
            "absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full",
            "bg-[var(--color-urgent)]/10 text-[var(--color-urgent)]",
            "animate-in fade-in zoom-in duration-300",
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

      {/* View indicator dots */}
      {showNavIndicators && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-300",
              currentView === "today"
                ? "bg-[var(--color-critical)]"
                : "bg-muted-foreground/30"
            )}
          />
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-300",
              currentView === "upcoming"
                ? "bg-primary"
                : "bg-muted-foreground/30"
            )}
          />
        </div>
      )}

      {/* Sliding Container */}
      <div className="relative min-h-[200px]">
        {/* TODAY VIEW */}
        {hasPaymentsToday && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-4 text-center",
              "transition-transform duration-300 ease-out",
              currentView !== "today" && "pointer-events-none"
            )}
            style={{ transform: todayTransform }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="w-4 h-4 text-[var(--color-critical)]"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-muted-foreground">
                {allTodaysPayments.length > 1
                  ? `GÜNÜN ÖDEMELERİ (${allTodaysPayments.length})`
                  : "GÜNÜN ÖDEMESİ"}
              </p>
            </div>

            <div
              className={cn(
                "text-5xl font-extrabold tracking-tight tabular-nums font-jakarta",
                urgencyTextStyles.critical,
                !reducedMotion && "animate-attention-shake"
              )}
            >
              BUGÜN
            </div>

            {/* Top 3 payments with letter avatars */}
            <div className="flex items-center justify-center gap-4">
              {todaysPayments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {(payment.name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {payment.name}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Show remaining count and total for ALL payments */}
            {allTodaysPayments.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {remainingTodayCount > 0 && (
                  <span>+{remainingTodayCount} ödeme daha • </span>
                )}
                Toplam: {todayTotalFormatted}
              </p>
            )}
          </div>
        )}

        {/* UPCOMING VIEW */}
        {hasUpcoming && displayPayment && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-4 text-center pb-4",
              "transition-transform duration-300 ease-out",
              currentView !== "upcoming" && "pointer-events-none"
            )}
            style={{ transform: upcomingTransform }}
          >
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
                urgency === "critical" &&
                  !reducedMotion &&
                  "animate-attention-shake"
              )}
            >
              {countdownText}
            </div>

            {/* Upcoming payment with letter avatar */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground">
                  {(displayPayment.name || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-foreground">
                  {displayPayment.name}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {formattedUpcomingAmount}
                </p>
              </div>
            </div>

            {/* Show count if more payments in 7 days */}
            {upcoming7Days.length > 1 && (
              <p className="text-xs text-muted-foreground">
                +{upcoming7Days.length - 1} ödeme daha bu hafta
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
