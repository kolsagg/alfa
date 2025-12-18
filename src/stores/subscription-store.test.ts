import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useSubscriptionStore,
  type SubscriptionState,
  type SubscriptionInput,
} from "./subscription-store";

// Helper to create a valid subscription input
const createTestInput = (
  overrides: Partial<SubscriptionInput> = {}
): SubscriptionInput => ({
  name: "Netflix",
  amount: 99.99,
  currency: "TRY",
  billingCycle: "monthly",
  nextPaymentDate: new Date().toISOString(),
  isActive: true,
  ...overrides,
});

describe("useSubscriptionStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSubscriptionStore.setState({
      subscriptions: [],
    } as Partial<SubscriptionState>);
    localStorage.clear();
  });

  describe("addSubscription", () => {
    it("should add a subscription with generated id and timestamps", () => {
      const input = createTestInput();

      const result = useSubscriptionStore.getState().addSubscription(input);

      expect(result).not.toBeNull();
      expect(result?.id).toBeDefined();
      expect(result?.createdAt).toBeDefined();
      expect(result?.updatedAt).toBeDefined();
      expect(result?.name).toBe("Netflix");
      expect(result?.amount).toBe(99.99);

      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].id).toBe(result?.id);
    });

    it("should add multiple subscriptions", () => {
      useSubscriptionStore.getState().addSubscription(createTestInput());
      useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Spotify" }));
      useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Disney+" }));

      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toHaveLength(3);
    });

    it("should return null for invalid input", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Invalid: negative amount
      const invalidInput = {
        ...createTestInput(),
        amount: -10,
      };

      const result = useSubscriptionStore
        .getState()
        .addSubscription(invalidInput);

      expect(result).toBeNull();
      expect(useSubscriptionStore.getState().getSubscriptions()).toHaveLength(
        0
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should add subscription with optional fields", () => {
      const input = createTestInput({
        categoryId: "entertainment",
        cardId: crypto.randomUUID(),
        color: "#FF5733",
        icon: "tv",
      });

      const result = useSubscriptionStore.getState().addSubscription(input);

      expect(result?.categoryId).toBe("entertainment");
      expect(result?.color).toBe("#FF5733");
      expect(result?.icon).toBe("tv");
    });
  });

  describe("updateSubscription", () => {
    it("should update an existing subscription", async () => {
      const added = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput());

      expect(added).not.toBeNull();

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = useSubscriptionStore
        .getState()
        .updateSubscription(added!.id, { name: "Netflix Premium" });

      expect(result).toBe(true);

      const updated = useSubscriptionStore
        .getState()
        .getSubscriptionById(added!.id);
      expect(updated?.name).toBe("Netflix Premium");
      expect(updated?.updatedAt).not.toBe(added?.updatedAt);
    });

    it("should update amount and currency", () => {
      const added = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput());

      useSubscriptionStore
        .getState()
        .updateSubscription(added!.id, { amount: 149.99, currency: "USD" });

      const updated = useSubscriptionStore
        .getState()
        .getSubscriptionById(added!.id);
      expect(updated?.amount).toBe(149.99);
      expect(updated?.currency).toBe("USD");
    });

    it("should return false for non-existent subscription", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = useSubscriptionStore
        .getState()
        .updateSubscription("non-existent-id", { name: "Test" });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should reject invalid updates", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const added = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput());

      // Invalid: negative amount
      const result = useSubscriptionStore
        .getState()
        .updateSubscription(added!.id, { amount: -50 });

      expect(result).toBe(false);

      // Original should be unchanged
      const unchanged = useSubscriptionStore
        .getState()
        .getSubscriptionById(added!.id);
      expect(unchanged?.amount).toBe(99.99);

      consoleSpy.mockRestore();
    });
  });

  describe("deleteSubscription", () => {
    it("should delete an existing subscription", () => {
      const added = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput());

      expect(useSubscriptionStore.getState().getSubscriptions()).toHaveLength(
        1
      );

      const result = useSubscriptionStore
        .getState()
        .deleteSubscription(added!.id);

      expect(result).toBe(true);
      expect(useSubscriptionStore.getState().getSubscriptions()).toHaveLength(
        0
      );
    });

    it("should return false when deleting non-existent subscription", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = useSubscriptionStore
        .getState()
        .deleteSubscription("non-existent-id");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should delete correct subscription when multiple exist", () => {
      const sub1 = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Netflix" }));
      const sub2 = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Spotify" }));
      const sub3 = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Disney+" }));

      useSubscriptionStore.getState().deleteSubscription(sub2!.id);

      const remaining = useSubscriptionStore.getState().getSubscriptions();
      expect(remaining).toHaveLength(2);
      expect(remaining.find((s) => s.id === sub1!.id)).toBeDefined();
      expect(remaining.find((s) => s.id === sub2!.id)).toBeUndefined();
      expect(remaining.find((s) => s.id === sub3!.id)).toBeDefined();
    });
  });

  describe("getSubscriptions", () => {
    it("should return empty array when no subscriptions", () => {
      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toEqual([]);
    });

    it("should return all subscriptions", () => {
      useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Netflix" }));
      useSubscriptionStore
        .getState()
        .addSubscription(createTestInput({ name: "Spotify" }));

      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toHaveLength(2);
    });
  });

  describe("getSubscriptionById", () => {
    it("should return subscription by id", () => {
      const added = useSubscriptionStore
        .getState()
        .addSubscription(createTestInput());

      const found = useSubscriptionStore
        .getState()
        .getSubscriptionById(added!.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(added!.id);
    });

    it("should return undefined for non-existent id", () => {
      const found = useSubscriptionStore
        .getState()
        .getSubscriptionById("non-existent-id");

      expect(found).toBeUndefined();
    });
  });

  describe("persistence", () => {
    it("should persist to localStorage", async () => {
      useSubscriptionStore.getState().addSubscription(createTestInput());

      // Wait for persist middleware
      await new Promise((resolve) => setTimeout(resolve, 100));

      const devKey = "subtracker-subscriptions-dev";
      const stored = localStorage.getItem(devKey);

      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.subscriptions).toHaveLength(1);
        expect(parsed.state.subscriptions[0].name).toBe("Netflix");
      }
    });

    it("should rehydrate from localStorage", async () => {
      const testId = crypto.randomUUID();
      const now = new Date().toISOString();

      localStorage.setItem(
        "subtracker-subscriptions-dev",
        JSON.stringify({
          state: {
            subscriptions: [
              {
                id: testId,
                name: "Pre-existing",
                amount: 50,
                currency: "TRY",
                billingCycle: "monthly",
                nextPaymentDate: now,
                isActive: true,
                createdAt: now,
                updatedAt: now,
              },
            ],
          },
          version: 1,
        })
      );

      await useSubscriptionStore.persist.rehydrate();

      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].name).toBe("Pre-existing");
    });

    it("should handle migration from v0 to v1", async () => {
      localStorage.setItem(
        "subtracker-subscriptions-dev",
        JSON.stringify({
          state: {
            subscriptions: [],
          },
          version: 0,
        })
      );

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await useSubscriptionStore.persist.rehydrate();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[SubscriptionStore] Migrating from v0 to v1")
      );

      consoleSpy.mockRestore();
    });

    it("should validate subscriptions on rehydration", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const now = new Date().toISOString();

      // One valid, one invalid subscription
      localStorage.setItem(
        "subtracker-subscriptions-dev",
        JSON.stringify({
          state: {
            subscriptions: [
              {
                id: crypto.randomUUID(),
                name: "Valid",
                amount: 10,
                currency: "TRY",
                billingCycle: "monthly",
                nextPaymentDate: now,
                isActive: true,
                createdAt: now,
                updatedAt: now,
              },
              {
                id: "not-a-uuid", // Invalid UUID
                name: "Invalid",
                amount: 20,
                currency: "TRY",
                billingCycle: "monthly",
                nextPaymentDate: now,
                isActive: true,
                createdAt: now,
                updatedAt: now,
              },
            ],
          },
          version: 1,
        })
      );

      await useSubscriptionStore.persist.rehydrate();

      // Check that the warning was logged
      expect(consoleSpy).toHaveBeenCalled();

      // CRITICAL CHECK: Verify that the invalid subscription was REMOVED from the store
      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].name).toBe("Valid");
      expect(subscriptions[0].id).not.toBe("not-a-uuid");

      consoleSpy.mockRestore();
    });
    it("should handle migration from v1 to v2", async () => {
      const now = new Date().toISOString();
      const testId = crypto.randomUUID();

      localStorage.setItem(
        "subtracker-subscriptions-dev",
        JSON.stringify({
          state: {
            subscriptions: [
              {
                id: testId,
                name: "Legacy Sub",
                amount: 100,
                currency: "TRY",
                billingCycle: "monthly",
                nextPaymentDate: now,
                isActive: true,
                createdAt: now,
                updatedAt: now,
                // customDays is missing in v1
              },
            ],
          },
          version: 1, // Simulating stored v1 data
        })
      );

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await useSubscriptionStore.persist.rehydrate();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[SubscriptionStore] Migrating from v1 to v2")
      );

      const subscriptions = useSubscriptionStore.getState().getSubscriptions();
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].name).toBe("Legacy Sub");
      // Check that customDays is undefined or handled
      expect(
        (subscriptions[0] as Record<string, unknown>).customDays
      ).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });
});
