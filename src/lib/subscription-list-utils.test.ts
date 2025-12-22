import { describe, it, expect } from "vitest";
import {
  sortByDate,
  sortByPrice,
  sortByName,
  sortSubscriptions,
  filterByCategory,
  getUniqueCategoryIds,
  processSubscriptions,
  SortOptionSchema,
  DEFAULT_SORT_OPTION,
  VIRTUALIZATION_THRESHOLD,
} from "./subscription-list-utils";
import type { Subscription } from "@/types/subscription";

// Helper to create mock subscriptions
function createMockSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  return {
    id: crypto.randomUUID(),
    name: "Test Subscription",
    amount: 100,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("subscription-list-utils", () => {
  describe("SortOptionSchema", () => {
    it("validates valid sort options", () => {
      expect(SortOptionSchema.safeParse("date").success).toBe(true);
      expect(SortOptionSchema.safeParse("price").success).toBe(true);
      expect(SortOptionSchema.safeParse("name").success).toBe(true);
    });

    it("rejects invalid sort options", () => {
      expect(SortOptionSchema.safeParse("invalid").success).toBe(false);
      expect(SortOptionSchema.safeParse("").success).toBe(false);
      expect(SortOptionSchema.safeParse(123).success).toBe(false);
    });
  });

  describe("DEFAULT_SORT_OPTION", () => {
    it("defaults to date", () => {
      expect(DEFAULT_SORT_OPTION).toBe("date");
    });
  });

  describe("VIRTUALIZATION_THRESHOLD", () => {
    it("is set to 20", () => {
      expect(VIRTUALIZATION_THRESHOLD).toBe(20);
    });
  });

  describe("sortByDate", () => {
    it("sorts subscriptions by next payment date ascending (nearest first)", () => {
      const subs = [
        createMockSubscription({
          name: "Far",
          nextPaymentDate: "2025-12-30T00:00:00.000Z",
        }),
        createMockSubscription({
          name: "Near",
          nextPaymentDate: "2025-12-22T00:00:00.000Z",
        }),
        createMockSubscription({
          name: "Middle",
          nextPaymentDate: "2025-12-25T00:00:00.000Z",
        }),
      ];

      const sorted = sortByDate(subs);

      expect(sorted[0].name).toBe("Near");
      expect(sorted[1].name).toBe("Middle");
      expect(sorted[2].name).toBe("Far");
    });

    it("does not mutate original array", () => {
      const subs = [
        createMockSubscription({
          name: "B",
          nextPaymentDate: "2025-12-30T00:00:00.000Z",
        }),
        createMockSubscription({
          name: "A",
          nextPaymentDate: "2025-12-22T00:00:00.000Z",
        }),
      ];

      const original = [...subs];
      sortByDate(subs);

      expect(subs[0].name).toBe(original[0].name);
    });

    it("handles empty array", () => {
      expect(sortByDate([])).toEqual([]);
    });
  });

  describe("sortByPrice", () => {
    it("sorts subscriptions by amount descending (highest first)", () => {
      const subs = [
        createMockSubscription({ name: "Cheap", amount: 10 }),
        createMockSubscription({ name: "Expensive", amount: 500 }),
        createMockSubscription({ name: "Medium", amount: 100 }),
      ];

      const sorted = sortByPrice(subs);

      expect(sorted[0].name).toBe("Expensive");
      expect(sorted[1].name).toBe("Medium");
      expect(sorted[2].name).toBe("Cheap");
    });

    it("does not mutate original array", () => {
      const subs = [
        createMockSubscription({ name: "A", amount: 10 }),
        createMockSubscription({ name: "B", amount: 500 }),
      ];

      const original = [...subs];
      sortByPrice(subs);

      expect(subs[0].name).toBe(original[0].name);
    });
  });

  describe("sortByName", () => {
    it("sorts subscriptions alphabetically A-Z", () => {
      const subs = [
        createMockSubscription({ name: "Zoom" }),
        createMockSubscription({ name: "Apple" }),
        createMockSubscription({ name: "Netflix" }),
      ];

      const sorted = sortByName(subs);

      expect(sorted[0].name).toBe("Apple");
      expect(sorted[1].name).toBe("Netflix");
      expect(sorted[2].name).toBe("Zoom");
    });

    it("handles Turkish characters correctly", () => {
      const subs = [
        createMockSubscription({ name: "Şirket" }),
        createMockSubscription({ name: "Ağ" }),
        createMockSubscription({ name: "Çevre" }),
        createMockSubscription({ name: "İnternet" }),
      ];

      const sorted = sortByName(subs);

      // Turkish alphabet order: A, Ç, I, İ, Ş
      expect(sorted[0].name).toBe("Ağ");
      expect(sorted[1].name).toBe("Çevre");
      expect(sorted[2].name).toBe("İnternet");
      expect(sorted[3].name).toBe("Şirket");
    });

    it("is case insensitive", () => {
      const subs = [
        createMockSubscription({ name: "zebra" }),
        createMockSubscription({ name: "Apple" }),
        createMockSubscription({ name: "BANANA" }),
      ];

      const sorted = sortByName(subs);

      expect(sorted[0].name).toBe("Apple");
      expect(sorted[1].name).toBe("BANANA");
      expect(sorted[2].name).toBe("zebra");
    });
  });

  describe("sortSubscriptions", () => {
    const subs = [
      createMockSubscription({
        name: "Netflix",
        amount: 100,
        nextPaymentDate: "2025-12-30T00:00:00.000Z",
      }),
      createMockSubscription({
        name: "Apple",
        amount: 500,
        nextPaymentDate: "2025-12-22T00:00:00.000Z",
      }),
      createMockSubscription({
        name: "Spotify",
        amount: 50,
        nextPaymentDate: "2025-12-25T00:00:00.000Z",
      }),
    ];

    it("sorts by date when sortBy is date", () => {
      const sorted = sortSubscriptions(subs, "date");
      expect(sorted[0].name).toBe("Apple");
    });

    it("sorts by price when sortBy is price", () => {
      const sorted = sortSubscriptions(subs, "price");
      expect(sorted[0].name).toBe("Apple");
    });

    it("sorts by name when sortBy is name", () => {
      const sorted = sortSubscriptions(subs, "name");
      expect(sorted[0].name).toBe("Apple");
    });
  });

  describe("filterByCategory", () => {
    const subs = [
      createMockSubscription({ name: "Netflix", categoryId: "entertainment" }),
      createMockSubscription({ name: "Spotify", categoryId: "entertainment" }),
      createMockSubscription({ name: "Office", categoryId: "productivity" }),
      createMockSubscription({ name: "Gym", categoryId: "health" }),
    ];

    it("filters subscriptions by category ID", () => {
      const filtered = filterByCategory(subs, "entertainment");

      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe("Netflix");
      expect(filtered[1].name).toBe("Spotify");
    });

    it("returns all subscriptions when categoryId is null", () => {
      const filtered = filterByCategory(subs, null);

      expect(filtered).toHaveLength(4);
    });

    it("returns empty array when no subscriptions match category", () => {
      const filtered = filterByCategory(subs, "nonexistent");

      expect(filtered).toHaveLength(0);
    });

    it("handles empty array", () => {
      expect(filterByCategory([], "entertainment")).toEqual([]);
    });
  });

  describe("getUniqueCategoryIds", () => {
    it("returns unique category IDs", () => {
      const subs = [
        createMockSubscription({ categoryId: "entertainment" }),
        createMockSubscription({ categoryId: "entertainment" }),
        createMockSubscription({ categoryId: "productivity" }),
        createMockSubscription({ categoryId: "health" }),
      ];

      const categoryIds = getUniqueCategoryIds(subs);

      expect(categoryIds).toHaveLength(3);
      expect(categoryIds).toContain("entertainment");
      expect(categoryIds).toContain("productivity");
      expect(categoryIds).toContain("health");
    });

    it("excludes undefined and null category IDs", () => {
      const subs = [
        createMockSubscription({ categoryId: "entertainment" }),
        createMockSubscription({ categoryId: undefined }),
        createMockSubscription({}), // No categoryId
      ];

      const categoryIds = getUniqueCategoryIds(subs);

      expect(categoryIds).toHaveLength(1);
      expect(categoryIds).toContain("entertainment");
    });

    it("returns empty array for empty input", () => {
      expect(getUniqueCategoryIds([])).toEqual([]);
    });
  });

  describe("processSubscriptions", () => {
    const subs = [
      createMockSubscription({
        name: "Netflix",
        amount: 100,
        categoryId: "entertainment",
        nextPaymentDate: "2025-12-30T00:00:00.000Z",
      }),
      createMockSubscription({
        name: "Apple",
        amount: 500,
        categoryId: "productivity",
        nextPaymentDate: "2025-12-22T00:00:00.000Z",
      }),
      createMockSubscription({
        name: "Spotify",
        amount: 50,
        categoryId: "entertainment",
        nextPaymentDate: "2025-12-25T00:00:00.000Z",
      }),
    ];

    it("filters and sorts subscriptions", () => {
      const processed = processSubscriptions(subs, "entertainment", "price");

      expect(processed).toHaveLength(2);
      expect(processed[0].name).toBe("Netflix"); // Higher price
      expect(processed[1].name).toBe("Spotify"); // Lower price
    });

    it("applies sorting to all subscriptions when filter is null", () => {
      const processed = processSubscriptions(subs, null, "name");

      expect(processed).toHaveLength(3);
      expect(processed[0].name).toBe("Apple");
      expect(processed[1].name).toBe("Netflix");
      expect(processed[2].name).toBe("Spotify");
    });

    it("returns empty array when filter matches nothing", () => {
      const processed = processSubscriptions(subs, "nonexistent", "date");

      expect(processed).toHaveLength(0);
    });
  });
});
