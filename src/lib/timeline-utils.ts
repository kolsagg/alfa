import { differenceInDays, startOfDay, isBefore } from "date-fns";
import type { Subscription } from "@/types/subscription";

/**
 * Calculate days until payment date
 * @returns Positive = upcoming, Negative = past due, 0 = today
 */
export function getDaysUntilPayment(
  paymentDate: Date | string,
  today = startOfDay(new Date())
): number {
  const payment = startOfDay(
    typeof paymentDate === "string" ? new Date(paymentDate) : paymentDate
  );
  return differenceInDays(payment, today);
}

/**
 * Format days remaining for display
 */
export function formatDaysRemaining(days: number): string {
  if (days < 0) return `${Math.abs(days)} gün gecikti`;
  if (days === 0) return "Bugün";
  if (days === 1) return "Yarın";
  return `${days} gün sonra`;
}

/**
 * Urgency thresholds for timeline items
 */
export const URGENCY_THRESHOLDS = {
  subtle: 7, // 7+ days: --color-subtle
  attention: 3, // 3-7 days: --color-attention
  urgent: 1, // 1-3 days: --color-urgent
  critical: 0, // 0 or past: --color-critical
} as const;

/**
 * Get urgency level based on days until payment
 */
export function getUrgencyLevel(
  days: number
): "subtle" | "attention" | "urgent" | "critical" {
  if (days < 0) return "critical";
  if (days === 0) return "critical";
  if (days < URGENCY_THRESHOLDS.attention) return "urgent"; // 1-2 days = urgent
  if (days <= URGENCY_THRESHOLDS.subtle) return "attention"; // 3-7 days = attention
  return "subtle"; // 8+ days = subtle
}

/**
 * Sort subscriptions into past due and upcoming groups
 */
export function sortByPaymentDate(
  subscriptions: Subscription[],
  today = startOfDay(new Date())
): {
  pastDue: Subscription[];
  upcoming: Subscription[];
} {
  const pastDue: Subscription[] = [];
  const upcoming: Subscription[] = [];

  // Single pass through subscriptions
  for (const s of subscriptions) {
    if (isBefore(new Date(s.nextPaymentDate), today)) {
      pastDue.push(s);
    } else {
      upcoming.push(s);
    }
  }

  // ISO string comparison is efficient for chronological sorting
  const sortFn = (a: Subscription, b: Subscription) =>
    a.nextPaymentDate.localeCompare(b.nextPaymentDate);

  return {
    pastDue: pastDue.sort(sortFn),
    upcoming: upcoming.sort(sortFn),
  };
}

/**
 * Get all upcoming payments from subscriptions, sorted chronologically
 */
export function getUpcomingPayments(
  subscriptions: Subscription[],
  today = startOfDay(new Date())
): {
  pastDue: Array<Subscription & { daysUntil: number; urgency: string }>;
  upcoming: Array<Subscription & { daysUntil: number; urgency: string }>;
} {
  const { pastDue, upcoming } = sortByPaymentDate(subscriptions, today);

  const enrichPayment = (sub: Subscription) => {
    const daysUntil = getDaysUntilPayment(sub.nextPaymentDate, today);
    return {
      ...sub,
      daysUntil,
      urgency: getUrgencyLevel(daysUntil),
    };
  };

  return {
    pastDue: pastDue.map(enrichPayment),
    upcoming: upcoming.map(enrichPayment),
  };
}
