import { z } from "zod";
import type { Subscription } from "@/types/subscription";

// Zod schema for sort options
export const SortOptionSchema = z.enum(["date", "price", "name"]);
export type SortOption = z.infer<typeof SortOptionSchema>;

// Default sort option
export const DEFAULT_SORT_OPTION: SortOption = "date";

/**
 * Sort subscriptions by next payment date (ascending - nearest first)
 */
export function sortByDate(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort(
    (a, b) =>
      new Date(a.nextPaymentDate).getTime() -
      new Date(b.nextPaymentDate).getTime()
  );
}

/**
 * Sort subscriptions by amount (descending - highest first)
 */
export function sortByPrice(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort((a, b) => b.amount - a.amount);
}

/**
 * Sort subscriptions by name (A-Z, Turkish locale aware)
 */
export function sortByName(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort((a, b) =>
    a.name.localeCompare(b.name, "tr", { sensitivity: "base" })
  );
}

/**
 * Sort subscriptions by the specified option
 */
export function sortSubscriptions(
  subscriptions: Subscription[],
  sortBy: SortOption
): Subscription[] {
  switch (sortBy) {
    case "date":
      return sortByDate(subscriptions);
    case "price":
      return sortByPrice(subscriptions);
    case "name":
      return sortByName(subscriptions);
    default:
      return sortByDate(subscriptions);
  }
}

/**
 * Filter subscriptions by category ID
 * @param subscriptions - Array of subscriptions to filter
 * @param categoryId - Category ID to filter by, null means "all" (no filter)
 */
export function filterByCategory(
  subscriptions: Subscription[],
  categoryId: string | null
): Subscription[] {
  if (!categoryId) return subscriptions;
  return subscriptions.filter((sub) => sub.categoryId === categoryId);
}

/**
 * Get unique category IDs from subscriptions
 */
export function getUniqueCategoryIds(subscriptions: Subscription[]): string[] {
  const categoryIds: string[] = [];
  for (const sub of subscriptions) {
    if (sub.categoryId && !categoryIds.includes(sub.categoryId)) {
      categoryIds.push(sub.categoryId);
    }
  }
  return categoryIds;
}

/**
 * Process subscriptions with both filtering and sorting
 */
export function processSubscriptions(
  subscriptions: Subscription[],
  categoryId: string | null,
  sortBy: SortOption
): Subscription[] {
  const filtered = filterByCategory(subscriptions, categoryId);
  return sortSubscriptions(filtered, sortBy);
}

// Virtualization threshold - use regular rendering below this count
export const VIRTUALIZATION_THRESHOLD = 20;
