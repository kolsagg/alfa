import { z } from "zod";
import { isSameDay, parseISO } from "date-fns";
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
 * Filter subscriptions by date (same day check)
 * @param subscriptions - Array of subscriptions to filter
 * @param dateFilter - ISO date string to filter by, null means "all" (no filter)
 * Story 4.5 - Grouped Notifications
 */
export function filterByDate(
  subscriptions: Subscription[],
  dateFilter: string | null
): Subscription[] {
  if (!dateFilter) return subscriptions;

  // Story 4.7: If dateFilter contains multiple dates (comma-separated), filter by any of them
  const filterDates = dateFilter.split(",");

  if (filterDates.length > 1) {
    const targetDates = filterDates.map((d) => parseISO(d));
    return subscriptions.filter((sub) => {
      const subDate = parseISO(sub.nextPaymentDate);
      return targetDates.some((target) => isSameDay(subDate, target));
    });
  }

  const targetDate = parseISO(dateFilter);
  return subscriptions.filter((sub) =>
    isSameDay(parseISO(sub.nextPaymentDate), targetDate)
  );
}

/**
 * Process subscriptions with both filtering and sorting
 * @param subscriptions - Array of subscriptions to process
 * @param categoryId - Category ID to filter by, null means "all" (no filter)
 * @param sortBy - Sort option (date, price, name)
 * @param dateFilter - ISO date string to filter by, null means "all" (no filter)
 * Story 4.5 - Supports combined category + date filtering (AND logic)
 */
export function processSubscriptions(
  subscriptions: Subscription[],
  categoryId: string | null,
  sortBy: SortOption,
  dateFilter: string | null = null
): Subscription[] {
  let filtered = filterByCategory(subscriptions, categoryId);
  filtered = filterByDate(filtered, dateFilter);
  return sortSubscriptions(filtered, sortBy);
}

// Virtualization threshold - use regular rendering below this count
export const VIRTUALIZATION_THRESHOLD = 20;
