import { startOfDay } from "date-fns";
import type { Subscription } from "@/types/subscription";

/**
 * Time remaining until a payment date
 */
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
}

/**
 * Urgency levels for countdown display
 */
export type CountdownUrgency = "subtle" | "attention" | "urgent" | "critical";

/**
 * Countdown thresholds in milliseconds
 */
export const COUNTDOWN_THRESHOLDS = {
  subtle: 7 * 24 * 60 * 60 * 1000, // 7+ days
  attention: 3 * 24 * 60 * 60 * 1000, // 3-7 days
  urgent: 24 * 60 * 60 * 1000, // 24 hours
  critical: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Calculate time remaining until a target date
 * @param targetDate - ISO date string or Date object
 * @param now - Current date (for testing)
 */
export function getTimeRemaining(
  targetDate: Date | string,
  now = new Date()
): TimeRemaining {
  const target =
    typeof targetDate === "string" ? new Date(targetDate) : targetDate;

  // Safety check for invalid dates
  if (isNaN(target.getTime())) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isPast: true,
    };
  }

  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isPast: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalMs: diff, isPast: false };
}

/**
 * Get urgency level based on total milliseconds remaining
 */
export function getCountdownUrgency(totalMs: number): CountdownUrgency {
  if (totalMs <= 0) return "critical";
  if (totalMs < COUNTDOWN_THRESHOLDS.critical) return "critical"; // <1 hour
  if (totalMs < COUNTDOWN_THRESHOLDS.urgent) return "urgent"; // <24 hours
  if (totalMs < COUNTDOWN_THRESHOLDS.attention) return "attention"; // <3 days
  if (totalMs < COUNTDOWN_THRESHOLDS.subtle) return "attention"; // 3-7 days
  return "subtle"; // 7+ days
}

/**
 * Get the next upcoming payment from subscriptions
 * CRITICAL: Only considers active subscriptions
 * Tie-breaker: Higher amount comes first
 */
export function getNextPayment(
  subscriptions: Subscription[],
  now = new Date()
): Subscription | null {
  const today = startOfDay(now);
  const futurePayments = subscriptions
    .filter((s) => s.isActive) // CRITICAL: Only active subscriptions
    .filter((s) => startOfDay(new Date(s.nextPaymentDate)) >= today) // Today or future
    .sort((a, b) => {
      const dateA = new Date(a.nextPaymentDate);
      const dateB = new Date(b.nextPaymentDate);
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;
      // Tie-breaker: Higher amount first
      return b.amount - a.amount;
    });

  return futurePayments[0] || null;
}

/**
 * Get today's payments sorted by amount (highest first)
 * @param limit - Maximum number of payments to return (default: 3)
 */
export function getTodaysPayments(
  subscriptions: Subscription[],
  now = new Date(),
  limit = 3
): Subscription[] {
  const today = startOfDay(now);
  return subscriptions
    .filter((s) => s.isActive)
    .filter((s) => {
      const paymentDay = startOfDay(new Date(s.nextPaymentDate));
      return paymentDay.getTime() === today.getTime();
    })
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
    .slice(0, limit);
}

/**
 * Get ALL today's payments (no limit) for total count and amount calculations
 */
export function getAllTodaysPayments(
  subscriptions: Subscription[],
  now = new Date()
): Subscription[] {
  const today = startOfDay(now);
  return subscriptions
    .filter((s) => s.isActive)
    .filter((s) => {
      const paymentDay = startOfDay(new Date(s.nextPaymentDate));
      return paymentDay.getTime() === today.getTime();
    })
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Get the next payment that's NOT today (strictly future)
 */
export function getNextFuturePayment(
  subscriptions: Subscription[],
  now = new Date()
): Subscription | null {
  const today = startOfDay(now);
  const futurePayments = subscriptions
    .filter((s) => s.isActive)
    .filter((s) => startOfDay(new Date(s.nextPaymentDate)) > today) // Strictly future
    .sort((a, b) => {
      const dateA = new Date(a.nextPaymentDate);
      const dateB = new Date(b.nextPaymentDate);
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.amount - a.amount;
    });

  return futurePayments[0] || null;
}

/**
 * Get payments within the next 7 days (excluding today), sorted by date then amount
 * @param limit - Maximum number of payments to return (default: 5)
 */
export function getUpcoming7DaysPayments(
  subscriptions: Subscription[],
  now = new Date(),
  limit = 5
): Subscription[] {
  const today = startOfDay(now);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  return subscriptions
    .filter((s) => s.isActive)
    .filter((s) => {
      const paymentDay = startOfDay(new Date(s.nextPaymentDate));
      // After today AND within 7 days
      return paymentDay > today && paymentDay <= sevenDaysFromNow;
    })
    .sort((a, b) => {
      const dateA = new Date(a.nextPaymentDate);
      const dateB = new Date(b.nextPaymentDate);
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.amount - a.amount; // Higher amount first for same date
    })
    .slice(0, limit);
}

/**
 * Format countdown for display
 * - Critical (<1 hour): HH:MM:SS
 * - Normal: Xg Xs or Xs Xd
 */
export function formatCountdown(
  time: TimeRemaining,
  urgency: CountdownUrgency
): string {
  if (time.isPast) return "BUGÜN";

  // Critical (<1 hour): Show seconds - HH:MM:SS
  if (urgency === "critical") {
    return `${String(time.hours).padStart(2, "0")}:${String(
      time.minutes
    ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
  }

  // Normal: Show days/hours/minutes
  if (time.days > 0) {
    return `${time.days}g ${time.hours}s`;
  }
  return `${time.hours}s ${time.minutes}d`;
}

/**
 * Get interval duration based on urgency
 * - Critical: 1 second (show seconds)
 * - Others: 1 minute
 */
export function getIntervalMs(urgency: CountdownUrgency): number {
  return urgency === "critical" ? 1000 : 60000;
}
