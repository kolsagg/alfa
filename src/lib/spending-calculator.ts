/**
 * Spending Calculator - Per-Card Monthly Spending Utilities
 *
 * Story 6.4: AC1, AC2
 * - Normalizes subscription amounts to monthly equivalents
 * - Calculates per-card spending with multi-currency support
 * - Never mixes currencies in summation
 *
 * Story 6.5: AC1, AC2, AC3, AC4
 * - Calculates actual statement amounts (not normalized)
 * - Handles multiple occurrences for weekly/custom subscriptions
 * - Statement period boundary calculations with month-end handling
 */

import {
  addMonths,
  subMonths,
  startOfDay,
  endOfDay,
  addWeeks,
  addYears,
  addDays,
  differenceInDays,
  isBefore,
  isAfter,
  isWithinInterval,
  getDaysInMonth,
} from "date-fns";
import type { Subscription } from "@/types/subscription";
import type { Currency } from "@/types/common";

/**
 * SpendingInfo - Spending breakdown for a card or group
 *
 * - totalMonthly: Sum only valid when hasMultipleCurrencies is false
 * - currency: Primary currency or 'MIXED' when multiple currencies exist
 * - byCurrency: ALWAYS populated with per-currency totals
 */
export interface SpendingInfo {
  totalMonthly: number;
  currency: Currency | "MIXED";
  subscriptionCount: number;
  hasMultipleCurrencies: boolean;
  byCurrency: Partial<Record<Currency, number>>;
}

/**
 * Weekly to monthly factor: 365.25 / 12 / 7 ≈ 4.348
 * Using precise calculation for accuracy
 */
const WEEKLY_TO_MONTHLY = 365.25 / 12 / 7;

/**
 * Normalizes a subscription amount to its monthly equivalent
 *
 * @param subscription - The subscription to normalize
 * @returns Monthly equivalent amount in the subscription's currency
 */
export function normalizeToMonthly(subscription: Subscription): number {
  const { amount, billingCycle, customDays } = subscription;

  switch (billingCycle) {
    case "monthly":
      return amount;
    case "yearly":
      return amount / 12;
    case "weekly":
      return amount * WEEKLY_TO_MONTHLY;
    case "custom":
      if (customDays && customDays > 0) {
        return amount * (30 / customDays);
      }
      // Fallback to monthly if customDays is invalid
      return amount;
    default:
      return amount;
  }
}

/**
 * Calculates spending info for a specific card
 *
 * @param cardId - Card ID to calculate spending for (null/undefined for unassigned)
 * @param subscriptions - Array of all subscriptions
 * @returns SpendingInfo with totals per currency
 */
export function calculateCardSpending(
  cardId: string | null | undefined,
  subscriptions: Subscription[]
): SpendingInfo {
  // Filter subscriptions for this card (or unassigned if cardId is null/undefined)
  const cardSubscriptions = subscriptions.filter((sub) => {
    // Only active subscriptions
    if (!sub.isActive) return false;

    if (cardId === null || cardId === undefined) {
      // Unassigned: no cardId or cardId is undefined/null
      return !sub.cardId;
    }
    return sub.cardId === cardId;
  });

  if (cardSubscriptions.length === 0) {
    return {
      totalMonthly: 0,
      currency: "TRY", // Default currency
      subscriptionCount: 0,
      hasMultipleCurrencies: false,
      byCurrency: {},
    };
  }

  // Calculate per-currency totals
  const byCurrency: Partial<Record<Currency, number>> = {};

  for (const sub of cardSubscriptions) {
    const monthlyAmount = normalizeToMonthly(sub);
    const currency = sub.currency;

    byCurrency[currency] = (byCurrency[currency] || 0) + monthlyAmount;
  }

  // Check if multiple currencies exist
  const currencyKeys = Object.keys(byCurrency) as Currency[];
  const hasMultipleCurrencies = currencyKeys.length > 1;

  // Determine primary currency and total
  let totalMonthly = 0;
  let primaryCurrency: Currency | "MIXED" = currencyKeys[0] || "TRY";

  if (hasMultipleCurrencies) {
    primaryCurrency = "MIXED";
    // totalMonthly is not meaningful when mixed, but we can sum for reference
    totalMonthly = Object.values(byCurrency).reduce(
      (sum, val) => sum + (val || 0),
      0
    );
  } else {
    totalMonthly = byCurrency[primaryCurrency as Currency] || 0;
  }

  return {
    totalMonthly,
    currency: primaryCurrency,
    subscriptionCount: cardSubscriptions.length,
    hasMultipleCurrencies,
    byCurrency,
  };
}

/**
 * Calculates spending for unassigned subscriptions
 *
 * @param subscriptions - Array of all subscriptions
 * @returns SpendingInfo for subscriptions without cardId
 */
export function calculateUnassignedSpending(
  subscriptions: Subscription[]
): SpendingInfo {
  return calculateCardSpending(null, subscriptions);
}

/**
 * Currency symbols for formatting
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

/**
 * Formats a currency amount using Intl.NumberFormat
 *
 * @param amount - Numeric value to format
 * @param currency - Currency code
 * @returns Formatted string (e.g., "₺1.200")
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${formatter.format(amount)}`;
}

/**
 * Renders spending display with multi-currency support and deterministic sorting
 *
 * @param spending - SpendingInfo object
 * @param noSubscriptionsText - String to show when count is 0
 * @param separator - String to join multiple currencies (default: "+")
 * @returns Formatted string representing total spending
 */
export function renderSpendingDisplay(
  spending: SpendingInfo,
  noSubscriptionsText: string,
  separator: string = "+"
): string {
  if (spending.subscriptionCount === 0) {
    return noSubscriptionsText;
  }

  if (spending.hasMultipleCurrencies) {
    // Deterministic sorting of currencies (TRY first, then alphabetical)
    const sortedCurrencies = (
      Object.keys(spending.byCurrency) as Currency[]
    ).sort((a, b) => {
      if (a === "TRY") return -1;
      if (b === "TRY") return 1;
      return a.localeCompare(b);
    });

    const parts = sortedCurrencies
      .map((currency) => {
        const amount = spending.byCurrency[currency] ?? 0;
        return amount > 0 ? formatCurrencyAmount(amount, currency) : null;
      })
      .filter((part): part is string => part !== null);

    return parts.join(` ${separator} `);
  }

  // Single currency
  return formatCurrencyAmount(
    spending.totalMonthly,
    spending.currency as string
  );
}

// ============================================
// Story 6.5: Statement Calculation Types & Functions
// ============================================

/**
 * Statement bounds for current and next billing cycle
 */
export interface StatementBounds {
  current: { start: Date; end: Date };
  next: { start: Date; end: Date };
  daysRemaining: number;
}

/**
 * StatementTotals - Actual bill prediction for a credit card
 *
 * Story 6.5: AC1, AC2
 * - currentBill: Sum of actual amounts posting in current statement period
 * - nextBill: Sum of actual amounts posting in next statement period
 */
export interface StatementTotals {
  currentBill: SpendingInfo;
  nextBill: SpendingInfo;
  currentPeriod: { start: Date; end: Date };
  nextPeriod: { start: Date; end: Date };
  daysRemaining: number;
}

/**
 * Calculate the statement period bounds for a credit card
 *
 * Story 6.5: AC4 - Handle month-end edge cases
 *
 * @param cutoffDay - Day of month for statement cutoff (1-31)
 * @param referenceDate - Date to calculate periods relative to
 * @returns Statement bounds with current and next periods
 */
export function getStatementBounds(
  cutoffDay: number,
  referenceDate: Date
): StatementBounds {
  const ref = startOfDay(referenceDate);
  const refMonth = ref.getMonth();
  const refYear = ref.getFullYear();
  const refDay = ref.getDate();

  // Clamp cutoff day to valid range for the month and create new date
  const clampToMonth = (
    year: number,
    month: number,
    targetDay: number
  ): Date => {
    const date = new Date(year, month, 1);
    const maxDays = getDaysInMonth(date);
    const clampedDay = Math.min(targetDay, maxDays);
    return new Date(year, month, clampedDay);
  };

  let currentEnd: Date;
  let currentStart: Date;

  // Determine if we're before or after the cutoff in the reference month
  const clampedCutoff = Math.max(1, Math.min(31, cutoffDay));
  const refMonthCutoff = clampToMonth(refYear, refMonth, clampedCutoff);
  const refCutoffDay = refMonthCutoff.getDate();

  if (refDay <= refCutoffDay) {
    // Reference is before/on cutoff → current period ends this month on cutoff day
    currentEnd = endOfDay(clampToMonth(refYear, refMonth, clampedCutoff));

    // Start is day after cutoff of previous month
    const prevMonthDate = subMonths(new Date(refYear, refMonth, 1), 1);
    const prevCutoff = clampToMonth(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth(),
      clampedCutoff
    );
    currentStart = startOfDay(addDays(prevCutoff, 1));
  } else {
    // Reference is after cutoff → current period started this month (day after cutoff)
    const thisMonthCutoff = clampToMonth(refYear, refMonth, clampedCutoff);
    currentStart = startOfDay(addDays(thisMonthCutoff, 1));

    // End is cutoff of next month
    const nextMonthDate = addMonths(new Date(refYear, refMonth, 1), 1);
    currentEnd = endOfDay(
      clampToMonth(
        nextMonthDate.getFullYear(),
        nextMonthDate.getMonth(),
        clampedCutoff
      )
    );
  }

  // Next period is immediately after current
  const nextStart = startOfDay(addDays(currentEnd, 1));
  const nextMonthForEnd = addMonths(currentEnd, 1);
  const nextEnd = endOfDay(
    clampToMonth(
      nextMonthForEnd.getFullYear(),
      nextMonthForEnd.getMonth(),
      cutoffDay
    )
  );

  // Calculate days remaining in current period
  const daysRemaining = Math.max(0, differenceInDays(currentEnd, ref));

  return {
    current: { start: currentStart, end: currentEnd },
    next: { start: nextStart, end: nextEnd },
    daysRemaining,
  };
}

/**
 * Get the next occurrence date after a given date for a subscription
 */
function getNextOccurrence(sub: Subscription, afterDate: Date): Date {
  const nextPayment = new Date(sub.nextPaymentDate);
  const baseDate = startOfDay(nextPayment);
  const after = startOfDay(afterDate);

  // If next payment is already after the date, return it
  if (!isBefore(baseDate, after)) {
    return baseDate;
  }

  // Move forward until we're at or after the target date
  // Fixed Issue 1: Use original date as base to prevent drift (e.g., Jan 31 -> Feb 28 -> Mar 28 error)
  let count = 1;
  let current = baseDate;

  while (isBefore(current, after)) {
    switch (sub.billingCycle) {
      case "weekly":
        current = addWeeks(baseDate, count);
        break;
      case "monthly":
        current = addMonths(baseDate, count);
        break;
      case "yearly":
        current = addYears(baseDate, count);
        break;
      case "custom":
        current = addDays(baseDate, count * (sub.customDays || 30));
        break;
      default:
        current = addMonths(baseDate, count);
    }
    count++;
  }

  return current;
}

/**
 * Get the previous occurrence date before a given date for a subscription
 */
function getPreviousOccurrence(sub: Subscription, beforeDate: Date): Date {
  const nextPayment = new Date(sub.nextPaymentDate);
  const baseDate = startOfDay(nextPayment);
  const before = startOfDay(beforeDate);

  // Move backward until we're before the target date
  // Fixed Issue 1: Use original date as base to prevent drift
  let count = 0;
  let current = baseDate;

  while (!isBefore(current, before)) {
    count++;
    switch (sub.billingCycle) {
      case "weekly":
        current = addWeeks(baseDate, -count);
        break;
      case "monthly":
        current = addMonths(baseDate, -count);
        break;
      case "yearly":
        current = addYears(baseDate, -count);
        break;
      case "custom":
        current = addDays(baseDate, -count * (sub.customDays || 30));
        break;
      default:
        current = addMonths(baseDate, -count);
    }
  }

  return current;
}

/**
 * Calculate all occurrences of a subscription within a date range
 *
 * Story 6.5: AC3 - Find ALL occurrences including multiple for weekly/custom
 *
 * @param sub - The subscription
 * @param start - Period start (inclusive)
 * @param end - Period end (inclusive)
 * @returns Array of amounts for each occurrence in the period
 */
export function calculateOccurrencesInPeriod(
  sub: Subscription,
  start: Date,
  end: Date
): number[] {
  const occurrences: number[] = [];
  const periodStart = startOfDay(start);
  const periodEnd = endOfDay(end);
  const baseDate = startOfDay(new Date(sub.nextPaymentDate));

  // Find the first occurrence at or before the period start
  let current = getPreviousOccurrence(sub, periodStart);

  // If that's before the start, get the next one
  if (isBefore(current, periodStart)) {
    current = getNextOccurrence(sub, periodStart);
  }

  // Find starting N to keep baseDate reference consistency
  let n = 0;
  if (sub.billingCycle === "monthly") {
    // Approx N find
    const monthDiff =
      (current.getFullYear() - baseDate.getFullYear()) * 12 +
      (current.getMonth() - baseDate.getMonth());
    n = monthDiff;
  } else if (sub.billingCycle === "weekly") {
    n = Math.round(differenceInDays(current, baseDate) / 7);
  } else if (sub.billingCycle === "yearly") {
    n = current.getFullYear() - baseDate.getFullYear();
  } else if (sub.billingCycle === "custom") {
    n = Math.round(
      differenceInDays(current, baseDate) / (sub.customDays || 30)
    );
  }

  // Iterate through all occurrences in the period using baseDate + N to avoid drift
  while (!isAfter(current, periodEnd)) {
    if (
      isWithinInterval(current, { start: periodStart, end: periodEnd }) ||
      current.getTime() === periodStart.getTime() ||
      current.getTime() === periodEnd.getTime()
    ) {
      occurrences.push(sub.amount);
    }

    n++;
    // Move to next occurrence using base-N to avoid drift
    switch (sub.billingCycle) {
      case "weekly":
        current = addWeeks(baseDate, n);
        break;
      case "monthly":
        current = addMonths(baseDate, n);
        break;
      case "yearly":
        current = addYears(baseDate, n);
        break;
      case "custom":
        current = addDays(baseDate, n * (sub.customDays || 30));
        break;
      default:
        current = addMonths(baseDate, n);
    }
  }

  return occurrences;
}

/**
 * Build SpendingInfo from occurrence amounts
 */
function buildSpendingInfo(
  occurrencesBySubId: Map<string, { amounts: number[]; currency: Currency }>
): SpendingInfo {
  const byCurrency: Partial<Record<Currency, number>> = {};
  let subscriptionCount = 0;

  for (const [, data] of occurrencesBySubId) {
    if (data.amounts.length > 0) {
      subscriptionCount++;
      const total = data.amounts.reduce((sum, amt) => sum + amt, 0);
      byCurrency[data.currency] = (byCurrency[data.currency] || 0) + total;
    }
  }

  const currencyKeys = Object.keys(byCurrency) as Currency[];
  const hasMultipleCurrencies = currencyKeys.length > 1;

  let totalMonthly = 0;
  let primaryCurrency: Currency | "MIXED" = currencyKeys[0] || "TRY";

  if (hasMultipleCurrencies) {
    primaryCurrency = "MIXED";
    totalMonthly = Object.values(byCurrency).reduce(
      (sum, val) => sum + (val || 0),
      0
    );
  } else {
    totalMonthly = byCurrency[primaryCurrency as Currency] || 0;
  }

  return {
    totalMonthly,
    currency: primaryCurrency,
    subscriptionCount,
    hasMultipleCurrencies,
    byCurrency,
  };
}

/**
 * Calculate actual statement amounts for a credit card
 *
 * Story 6.5: AC1, AC2, AC3
 * - Sums ACTUAL posting amounts, not normalized
 * - Handles multiple occurrences per period
 * - Multi-currency support
 *
 * @param cardId - Card ID
 * @param cutoffDay - Statement cutoff day (1-31)
 * @param subscriptions - All subscriptions
 * @param referenceDate - Date to calculate statement from
 * @returns Statement totals with current and next bill predictions
 */
export function calculateActualStatementAmount(
  cardId: string,
  cutoffDay: number,
  subscriptions: Subscription[],
  referenceDate: Date = new Date()
): StatementTotals {
  const bounds = getStatementBounds(cutoffDay, referenceDate);

  // Filter subscriptions for this card
  const cardSubs = subscriptions.filter(
    (sub) => sub.cardId === cardId && sub.isActive
  );

  // Calculate current period occurrences
  const currentOccurrences = new Map<
    string,
    { amounts: number[]; currency: Currency }
  >();
  const nextOccurrences = new Map<
    string,
    { amounts: number[]; currency: Currency }
  >();

  for (const sub of cardSubs) {
    const currentAmounts = calculateOccurrencesInPeriod(
      sub,
      bounds.current.start,
      bounds.current.end
    );
    const nextAmounts = calculateOccurrencesInPeriod(
      sub,
      bounds.next.start,
      bounds.next.end
    );

    currentOccurrences.set(sub.id, {
      amounts: currentAmounts,
      currency: sub.currency,
    });
    nextOccurrences.set(sub.id, {
      amounts: nextAmounts,
      currency: sub.currency,
    });
  }

  return {
    currentBill: buildSpendingInfo(currentOccurrences),
    nextBill: buildSpendingInfo(nextOccurrences),
    currentPeriod: { start: bounds.current.start, end: bounds.current.end },
    nextPeriod: { start: bounds.next.start, end: bounds.next.end },
    daysRemaining: bounds.daysRemaining,
  };
}
