import type { Subscription } from "@/types/subscription";

/**
 * Multipliers to convert various billing cycles to monthly equivalents
 */
const MONTHLY_FACTORS = {
  weekly: 4.33,
  monthly: 1,
  yearly: 1 / 12,
};

/**
 * Calculates the monthly equivalent of a single subscription in TRY
 * @param subscription - The subscription object
 * @param rates - Current exchange rates from useFXStore (base TRY)
 */
export function calculateMonthlyEquivalent(
  subscription: Subscription,
  rates: Record<string, number>
): number {
  let monthlyAmount = 0;

  // 1. Convert to monthly base
  switch (subscription.billingCycle) {
    case "weekly":
      monthlyAmount = subscription.amount * MONTHLY_FACTORS.weekly;
      break;
    case "monthly":
      monthlyAmount = subscription.amount * MONTHLY_FACTORS.monthly;
      break;
    case "yearly":
      monthlyAmount = subscription.amount * MONTHLY_FACTORS.yearly;
      break;
    case "custom":
      if (subscription.customDays) {
        monthlyAmount = subscription.amount * (30 / subscription.customDays);
      }
      break;
  }

  // 2. Convert to TRY using rates
  const rate = rates[subscription.currency] || 1;
  return monthlyAmount * rate;
}

/**
 * Total monthly spending across all subscriptions in TRY
 */
export function calculateTotalMonthly(
  subscriptions: Subscription[],
  rates: Record<string, number>
): number {
  return subscriptions.reduce(
    (total, sub) => total + calculateMonthlyEquivalent(sub, rates),
    0
  );
}

/**
 * Total yearly spending across all subscriptions in TRY
 */
export function calculateTotalYearly(
  subscriptions: Subscription[],
  rates: Record<string, number>
): number {
  return calculateTotalMonthly(subscriptions, rates) * 12;
}

/**
 * Checks if the subscription list contains multiple currencies
 */
export function hasMixedCurrencies(subscriptions: Subscription[]): boolean {
  if (subscriptions.length <= 1) return false;
  const standardCurrency = subscriptions[0].currency;
  return subscriptions.some((sub) => sub.currency !== standardCurrency);
}
