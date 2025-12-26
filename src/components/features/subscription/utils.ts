import {
  addMonths,
  addYears,
  addWeeks,
  addDays,
  startOfDay,
  isAfter,
} from "date-fns";
import type { BillingCycle } from "@/types/common";

/**
 * Calculate the next payment date based on the first payment date and billing cycle
 * @param firstPaymentDate - The initial payment date
 * @param billingCycle - The billing cycle (monthly, yearly, weekly, custom)
 * @param customDays - Number of days for custom billing cycle
 * @returns The calculated next payment date
 */
export function calculateNextPaymentDate(
  firstPaymentDate: Date,
  billingCycle: BillingCycle,
  customDays?: number
): Date {
  const today = startOfDay(new Date());
  let nextDate = startOfDay(new Date(firstPaymentDate));

  // If first payment is today or in the future, use it directly
  if (!isAfter(today, nextDate)) {
    return nextDate;
  }

  // Calculate next occurrence after today
  const MAX_ITERATIONS = 1200; // ~100 years of monthly payments
  let iterations = 0;

  // Calculate next occurrence starting from today or after
  while (nextDate < today) {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      console.warn(
        "calculateNextPaymentDate: Max iterations reached, returning today"
      );
      return today;
    }

    switch (billingCycle) {
      case "monthly":
        nextDate = addMonths(nextDate, 1);
        break;
      case "yearly":
        nextDate = addYears(nextDate, 1);
        break;
      case "weekly":
        nextDate = addWeeks(nextDate, 1);
        break;
      case "custom":
        // Ensure at least 1 day to prevent infinite loop
        nextDate = addDays(nextDate, Math.max(1, customDays ?? 30));
        break;
    }
  }

  return nextDate;
}
