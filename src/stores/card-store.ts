import { createStore } from "./create-store";
import { CardSchema, CardUpdateSchema } from "@/types/card";
import type { Card, CardUpdate, CardInput } from "@/types/card";
import { generateUUID } from "@/lib/uuid";
import { logger } from "@/lib/event-logger";

export type { CardInput };

export interface CardStoreState {
  cards: Card[];
}

export interface CardStoreActions {
  addCard: (input: CardInput) => Card | null;
  updateCard: (id: string, updates: CardUpdate) => boolean;
  deleteCard: (id: string) => boolean;
  getCards: () => Card[];
  getCardById: (id: string) => Card | undefined;
  importCards: (cards: Card[]) => boolean;
}

export type CardsState = CardStoreState & CardStoreActions;

export const useCardStore = createStore<CardsState>(
  (set, get) => ({
    cards: [],

    addCard: (input) => {
      const now = new Date().toISOString();
      const newCard = {
        ...input,
        type: input.type ?? "credit",
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const result = CardSchema.safeParse(newCard);
      if (!result.success) {
        console.error("[CardStore] Validation failed:", result.error.issues);
        return null;
      }

      set((state) => ({
        cards: [...state.cards, result.data],
      }));

      // Story 7.1: Log card added event
      logger.log("card_added", {
        type: result.data.type,
      });

      return result.data;
    },

    updateCard: (id, updates) => {
      const cards = get().cards;
      const index = cards.findIndex((card) => card.id === id);

      if (index === -1) {
        console.warn(`[CardStore] Card not found: ${id}`);
        return false;
      }

      const updateResult = CardUpdateSchema.safeParse(updates);
      if (!updateResult.success) {
        console.error(
          "[CardStore] Update validation failed:",
          updateResult.error.issues
        );
        return false;
      }

      const updatedCard = {
        ...cards[index],
        ...updateResult.data,
        updatedAt: new Date().toISOString(),
      };

      const fullResult = CardSchema.safeParse(updatedCard);
      if (!fullResult.success) {
        console.error(
          "[CardStore] Full validation failed:",
          fullResult.error.issues
        );
        return false;
      }

      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? fullResult.data : card
        ),
      }));

      return true;
    },

    deleteCard: (id) => {
      const cards = get().cards;
      const exists = cards.some((card) => card.id === id);

      if (!exists) {
        console.warn(`[CardStore] Card not found: ${id}`);
        return false;
      }

      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
      }));

      // Story 7.1: Log card deleted event
      logger.log("card_deleted");

      return true;
    },

    getCards: () => get().cards,

    getCardById: (id) => get().cards.find((card) => card.id === id),

    importCards: (newCards) => {
      // 1. Check for duplicates within the import payload itself
      const ids = newCards.map((c) => c.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        console.error(
          "[CardStore] Import cancelled: Duplicate card IDs detected in payload"
        );
        return false;
      }

      // 2. Validate all records
      for (const card of newCards) {
        const result = CardSchema.safeParse(card);
        if (!result.success) {
          console.error(
            `[CardStore] Import cancelled: Invalid record ${
              card.id || "unknown"
            }`,
            result.error.issues
          );
          return false;
        }
      }

      set({ cards: newCards });
      return true;
    },
  }),
  {
    name: "CardStore",
    storageName: "cards",
    version: 2,
    migrate: (persistedState: unknown, version: number) => {
      const state = persistedState as Partial<CardsState>;

      if (version === 0) {
        console.log("[CardStore] Migrating from v0 to v1");
        state.cards = state.cards ?? [];
      }

      // Story 6.2b: Add type field to existing cards
      if (version <= 1) {
        console.log("[CardStore] Migrating from v1 to v2: Adding card type");
        state.cards = (state.cards ?? []).map((card) => ({
          ...card,
          type: (card as Card).type ?? "credit",
          bankName: (card as Card).bankName ?? undefined,
        }));
      }

      return state as CardsState;
    },

    merge: (persistedState: unknown, currentState: CardsState) => {
      const merged = {
        ...currentState,
        ...(persistedState as Partial<CardsState>),
      };

      if (merged.cards) {
        const validCards = merged.cards.filter((card) => {
          const result = CardSchema.safeParse(card);
          if (!result.success) {
            console.warn(
              "[CardStore] Invalid card removed during rehydration:",
              card.id,
              result.error.issues
            );
            return false;
          }
          return true;
        });

        if (validCards.length !== merged.cards.length) {
          console.warn(
            `[CardStore] Cleaned up ${
              merged.cards.length - validCards.length
            } invalid cards`
          );
          merged.cards = validCards;
        }
      }

      return merged;
    },
    partialize: (state) => ({
      cards: state.cards,
    }),
  }
);
