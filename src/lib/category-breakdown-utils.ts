import type { Subscription } from "@/types/subscription";

/**
 * Category breakdown item for a single category within a currency group
 */
export interface CategoryBreakdownItem {
  categoryId: string;
  total: number;
  currency: string;
  percentage: number; // 0-100
}

/**
 * Breakdown result grouped by currency
 * Each currency key maps to an array of category breakdowns sorted by percentage (desc)
 */
export type BreakdownResult = Record<string, CategoryBreakdownItem[]>;

/**
 * Calculate category breakdown from subscriptions, grouped by currency
 * Each currency group is independently calculated to 100%
 *
 * @param subscriptions - Array of subscriptions to analyze
 * @returns Object keyed by currency, each containing sorted category breakdowns
 */
export function calculateCategoryBreakdown(
  subscriptions: Subscription[]
): BreakdownResult {
  if (subscriptions.length === 0) {
    return {};
  }

  // Step 1: Group by currency, then by category
  const currencyGroups: Record<
    string,
    Record<string, { total: number; count: number }>
  > = {};

  for (const sub of subscriptions) {
    const currency = sub.currency;
    const categoryId = sub.categoryId || "other";

    if (!currencyGroups[currency]) {
      currencyGroups[currency] = {};
    }

    if (!currencyGroups[currency][categoryId]) {
      currencyGroups[currency][categoryId] = { total: 0, count: 0 };
    }

    currencyGroups[currency][categoryId].total += sub.amount;
    currencyGroups[currency][categoryId].count += 1;
  }

  // Step 2: Calculate percentages and build result
  const result: BreakdownResult = {};

  for (const [currency, categories] of Object.entries(currencyGroups)) {
    // Calculate grand total for this currency
    const grandTotal = Object.values(categories).reduce(
      (sum, cat) => sum + cat.total,
      0
    );

    // Build breakdown items
    const items: CategoryBreakdownItem[] = Object.entries(categories).map(
      ([categoryId, data]) => ({
        categoryId,
        total: data.total,
        currency,
        percentage:
          grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0,
      })
    );

    // CRITICAL FIX: Ensure percentages sum to exactly 100%
    if (grandTotal > 0 && items.length > 0) {
      const sum = items.reduce((acc, item) => acc + item.percentage, 0);
      const diff = 100 - sum;

      if (diff !== 0) {
        // Find the index of the item with the highest total to adjust
        // Sorting later will maintain order
        let largestIdx = 0;
        for (let i = 1; i < items.length; i++) {
          if (items[i].total > items[largestIdx].total) {
            largestIdx = i;
          }
        }
        items[largestIdx].percentage += diff;
      }
    }

    // Sort by percentage descending
    items.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return b.total - a.total; // Tie-breaker: higher amount first
    });

    result[currency] = items;
  }

  return result;
}

/**
 * Check if breakdown should be displayed (more than 1 unique category across all currencies)
 */
export function shouldShowBreakdown(breakdown: BreakdownResult): boolean {
  const allCategoryIds = new Set<string>();

  for (const items of Object.values(breakdown)) {
    for (const item of items) {
      allCategoryIds.add(item.categoryId);
    }
  }

  return allCategoryIds.size > 1;
}

/**
 * Get total across all categories for a specific currency
 */
export function getCurrencyTotal(
  breakdown: BreakdownResult,
  currency: string
): number {
  const items = breakdown[currency];
  if (!items) return 0;
  return items.reduce((sum, item) => sum + item.total, 0);
}
