/**
 * useImminentPayments Hook
 *
 * Story 4.7: Memoized hook for calculating imminent payment information.
 * Used in ImminentPaymentsBadge (AC5) and any component needing imminent payment data.
 */

import { useMemo } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { NOTIFICATION_CONFIG } from "@/config/notifications";
import { startOfDay, differenceInDays } from "date-fns";

const { IMMINENT_PAYMENT_DAYS } = NOTIFICATION_CONFIG;

export interface ImminentPayment {
  id: string;
  name: string;
  nextPaymentDate: string;
  daysUntil: number;
}

export interface UseImminentPaymentsResult {
  /** Count of imminent payments (≤ IMMINENT_PAYMENT_DAYS) */
  count: number;
  /** List of imminent payments sorted by date (earliest first) */
  payments: ImminentPayment[];
  /** The earliest imminent payment date (ISO string) or null if none */
  earliestDate: string | null;
  /** All unique imminent payment dates for collective filtering */
  imminentDates: string[];
  /** Most urgent level: "critical" (0 days), "urgent" (1-2), "attention" (3+) */
  urgencyLevel: "critical" | "urgent" | "attention" | null;
}

/**
 * Calculate imminent payments from subscription store
 * Uses memoization to prevent Header re-renders on unrelated store changes
 */
export function useImminentPayments(): UseImminentPaymentsResult {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  return useMemo(() => {
    const today = startOfDay(new Date());

    const imminent: ImminentPayment[] = [];
    const datesSet = new Set<string>();

    for (const sub of subscriptions) {
      const paymentDate = startOfDay(new Date(sub.nextPaymentDate));
      const daysUntil = differenceInDays(paymentDate, today);

      // Include today (0) through IMMINENT_PAYMENT_DAYS
      if (daysUntil >= 0 && daysUntil <= IMMINENT_PAYMENT_DAYS) {
        imminent.push({
          id: sub.id,
          name: sub.name,
          nextPaymentDate: sub.nextPaymentDate,
          daysUntil,
        });
        datesSet.add(sub.nextPaymentDate);
      }
    }

    // Sort by date (earliest first)
    imminent.sort((a, b) => a.daysUntil - b.daysUntil);

    // Determine urgency based on earliest payment
    let urgencyLevel: UseImminentPaymentsResult["urgencyLevel"] = null;
    if (imminent.length > 0) {
      const earliest = imminent[0].daysUntil;
      if (earliest <= 0) {
        urgencyLevel = "critical";
      } else if (earliest <= 2) {
        urgencyLevel = "urgent";
      } else {
        urgencyLevel = "attention";
      }
    }

    return {
      count: imminent.length,
      payments: imminent,
      earliestDate: imminent.length > 0 ? imminent[0].nextPaymentDate : null,
      imminentDates: Array.from(datesSet).sort(),
      urgencyLevel,
    };
  }, [subscriptions]);
}
