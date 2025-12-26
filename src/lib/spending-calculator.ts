/**
 * Spending Calculator - Per-Card Monthly Spending Utilities
 *
 * Story 6.4: AC1, AC2
 * - Normalizes subscription amounts to monthly equivalents
 * - Calculates per-card spending with multi-currency support
 * - Never mixes currencies in summation
 */

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
