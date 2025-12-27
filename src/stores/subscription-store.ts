import { createStore } from "./create-store";
import {
  SubscriptionSchema,
  SubscriptionUpdateSchema,
} from "@/types/subscription";
import type { Subscription, SubscriptionUpdate } from "@/types/subscription";
import { generateUUID } from "@/lib/uuid";
import { logger } from "@/lib/event-logger";

// Input type for adding subscriptions (without auto-generated fields)
export type SubscriptionInput = Omit<
  Subscription,
  "id" | "createdAt" | "updatedAt"
>;

// State interface (data only)
export interface SubscriptionStoreState {
  subscriptions: Subscription[];
}

// Actions interface
export interface SubscriptionStoreActions {
  addSubscription: (input: SubscriptionInput) => Subscription | null;
  updateSubscription: (id: string, updates: SubscriptionUpdate) => boolean;
  deleteSubscription: (id: string) => boolean;
  getSubscriptions: () => Subscription[];
  getSubscriptionById: (id: string) => Subscription | undefined;
  importSubscriptions: (subscriptions: Subscription[]) => boolean;
}

// Combined store type
export type SubscriptionState = SubscriptionStoreState &
  SubscriptionStoreActions;

export const useSubscriptionStore = createStore<SubscriptionState>(
  (set, get) => ({
    // Initial State
    subscriptions: [],

    // Actions
    addSubscription: (input) => {
      const now = new Date().toISOString();
      const newSubscription = {
        ...input,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };

      // Validate before adding
      const result = SubscriptionSchema.safeParse(newSubscription);
      if (!result.success) {
        console.error(
          "[SubscriptionStore] Validation failed:",
          result.error.issues
        );
        return null;
      }

      set((state) => ({
        subscriptions: [...state.subscriptions, result.data],
      }));

      // Story 7.1: Log subscription added event
      logger.log("subscription_added", {
        category: result.data.categoryId,
        billing_cycle: result.data.billingCycle,
        has_card: !!result.data.cardId,
      });

      return result.data;
    },

    updateSubscription: (id, updates) => {
      const subscriptions = get().subscriptions;
      const index = subscriptions.findIndex((sub) => sub.id === id);

      if (index === -1) {
        console.warn(`[SubscriptionStore] Subscription not found: ${id}`);
        return false;
      }

      // Validate update payload
      const updateResult = SubscriptionUpdateSchema.safeParse(updates);
      if (!updateResult.success) {
        console.error(
          "[SubscriptionStore] Update validation failed:",
          updateResult.error.issues
        );
        return false;
      }

      const updatedSubscription = {
        ...subscriptions[index],
        ...updateResult.data,
        updatedAt: new Date().toISOString(),
      };

      // Validate the complete updated record
      const fullResult = SubscriptionSchema.safeParse(updatedSubscription);
      if (!fullResult.success) {
        console.error(
          "[SubscriptionStore] Full validation failed:",
          fullResult.error.issues
        );
        return false;
      }

      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === id ? fullResult.data : sub
        ),
      }));

      // Story 7.1: Log subscription updated event
      logger.log("subscription_updated", {
        updated_fields: Object.keys(updateResult.data),
      });

      return true;
    },

    deleteSubscription: (id) => {
      const subscriptions = get().subscriptions;
      const exists = subscriptions.some((sub) => sub.id === id);

      if (!exists) {
        console.warn(`[SubscriptionStore] Subscription not found: ${id}`);
        return false;
      }

      set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
      }));

      // Story 7.1: Log subscription deleted event
      logger.log("subscription_deleted");

      return true;
    },

    getSubscriptions: () => {
      return get().subscriptions;
    },

    getSubscriptionById: (id) => {
      return get().subscriptions.find((sub) => sub.id === id);
    },

    importSubscriptions: (newSubscriptions) => {
      // Validate all records before applying
      const valid = newSubscriptions.every(
        (sub) => SubscriptionSchema.safeParse(sub).success
      );

      if (!valid) {
        console.error(
          "[SubscriptionStore] Import cancelled: Invalid records detected"
        );
        return false;
      }

      set({ subscriptions: newSubscriptions });
      return true;
    },
  }),
  {
    name: "SubscriptionsStore",
    version: 2,
    migrate: (persistedState: unknown, version: number) => {
      const state = persistedState as Partial<SubscriptionState>;

      if (version === 0) {
        // Migration from v0 to v1: Ensure subscriptions array exists
        console.log("[SubscriptionStore] Migrating from v0 to v1");
        state.subscriptions = state.subscriptions ?? [];
      }

      if (version < 2) {
        console.log("[SubscriptionStore] Migrating from v1 to v2");
        // v2 adds customDays as optional, so existing records are valid
      }

      return state as SubscriptionState;
    },
    merge: (persistedState: unknown, currentState: SubscriptionState) => {
      console.log("[SubscriptionStore] merge called", persistedState);
      // Standard shallow merge
      const merged = {
        ...currentState,
        ...(persistedState as Partial<SubscriptionState>),
      };

      // Always validate subscriptions during rehydration
      // AC4: Clean up invalid cardId references if card is not found in CardStore
      // Note: We attempt to read cards directly from localStorage for sync rehydration
      let availableCardIds: Set<string> | null = null;
      try {
        const cardStoreData = localStorage.getItem("subtracker-cards-dev");
        if (cardStoreData) {
          const parsed = JSON.parse(cardStoreData);
          if (parsed?.state?.cards) {
            availableCardIds = new Set(
              parsed.state.cards.map((c: { id: string }) => c.id)
            );
          }
        }
      } catch (e) {
        console.warn(
          "[SubscriptionStore] Failed to pre-load cards for cleanup",
          e
        );
      }

      if (merged.subscriptions) {
        merged.subscriptions = merged.subscriptions.map((sub) => {
          // If we have card list and cardId is not in it, remove the reference
          if (
            sub.cardId &&
            availableCardIds &&
            !availableCardIds.has(sub.cardId)
          ) {
            console.log(
              `[SubscriptionStore] Cleaning up orphaned cardId ${sub.cardId} for sub ${sub.id}`
            );
            return { ...sub, cardId: undefined };
          }
          return sub;
        });

        const validSubscriptions = merged.subscriptions.filter((sub) => {
          const result = SubscriptionSchema.safeParse(sub);
          if (!result.success) {
            console.warn(
              "[SubscriptionStore] Invalid subscription removed during rehydration:",
              sub.id,
              result.error.issues
            );
            return false;
          }
          return true;
        });

        if (validSubscriptions.length !== merged.subscriptions.length) {
          console.warn(
            `[SubscriptionStore] Cleaned up ${
              merged.subscriptions.length - validSubscriptions.length
            } invalid subscriptions`
          );
          merged.subscriptions = validSubscriptions;
        }
      }

      return merged;
    },
    partialize: (state) => ({
      subscriptions: state.subscriptions,
    }),
  }
);
