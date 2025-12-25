import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCardStore, type CardsState, type CardInput } from "./card-store";
import type { Card } from "@/types/card";

const createTestCardInput = (
  overrides: Partial<CardInput> = {}
): CardInput => ({
  name: "Test Card",
  lastFourDigits: "1234",
  cutoffDate: 15,
  ...overrides,
});

const createValidCard = (overrides: Partial<Card> = {}): Card => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Test Card",
  type: "credit",
  lastFourDigits: "1234",
  cutoffDate: 15,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("useCardStore", () => {
  beforeEach(() => {
    useCardStore.setState({ cards: [] } as Partial<CardsState>);
    localStorage.clear();
  });

  describe("addCard", () => {
    it("should add a card with generated id and timestamps", () => {
      const input = createTestCardInput();
      const result = useCardStore.getState().addCard(input);

      expect(result).not.toBeNull();
      expect(result?.id).toBeDefined();
      expect(result?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(result?.createdAt).toBeDefined();
      expect(result?.updatedAt).toBeDefined();
      expect(result?.name).toBe("Test Card");
      expect(result?.lastFourDigits).toBe("1234");
      expect(result?.cutoffDate).toBe(15);
    });

    it("should return null for invalid input - lastFourDigits too short", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalid = { ...createTestCardInput(), lastFourDigits: "12" };
      const result = useCardStore.getState().addCard(invalid);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return null for invalid input - name too long", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalid = { ...createTestCardInput(), name: "a".repeat(51) };
      const result = useCardStore.getState().addCard(invalid);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should add card with optional color", () => {
      const input = createTestCardInput({ color: "#FF5733" });
      const result = useCardStore.getState().addCard(input);

      expect(result).not.toBeNull();
      expect(result?.color).toBe("#FF5733");
    });

    it("should reject invalid color format", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalid = { ...createTestCardInput(), color: "red" };
      const result = useCardStore.getState().addCard(invalid);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should store card in state", () => {
      const input = createTestCardInput();
      useCardStore.getState().addCard(input);

      const cards = useCardStore.getState().cards;
      expect(cards).toHaveLength(1);
      expect(cards[0].name).toBe("Test Card");
    });
  });

  describe("updateCard", () => {
    it("should update card successfully with partial data", () => {
      const card = useCardStore.getState().addCard(createTestCardInput());
      expect(card).not.toBeNull();

      const result = useCardStore.getState().updateCard(card!.id, {
        name: "Updated Card",
      });

      expect(result).toBe(true);

      const updated = useCardStore.getState().getCardById(card!.id);
      expect(updated?.name).toBe("Updated Card");
      expect(updated?.lastFourDigits).toBe("1234"); // Unchanged
    });

    it("should update updatedAt timestamp", () => {
      vi.useFakeTimers();
      const now = new Date("2025-12-25T12:00:00Z");
      vi.setSystemTime(now);

      const card = useCardStore.getState().addCard(createTestCardInput());
      expect(card).not.toBeNull();
      const originalUpdatedAt = card!.updatedAt;

      // Advance time
      vi.advanceTimersByTime(1000);

      const result = useCardStore.getState().updateCard(card!.id, {
        name: "Updated",
      });

      expect(result).toBe(true);

      const updated = useCardStore.getState().getCardById(card!.id);
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
      expect(updated?.updatedAt).toBe(
        new Date("2025-12-25T12:00:01Z").toISOString()
      );

      vi.useRealTimers();
    });

    it("should return false for non-existent id", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = useCardStore.getState().updateCard("non-existent-uuid", {
        name: "Test",
      });

      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("should keep original data when update validation fails", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const card = useCardStore.getState().addCard(createTestCardInput());
      expect(card).not.toBeNull();

      // Invalid update - lastFourDigits not 4 digits
      const result = useCardStore.getState().updateCard(card!.id, {
        lastFourDigits: "12",
      });

      expect(result).toBe(false);

      const unchanged = useCardStore.getState().getCardById(card!.id);
      expect(unchanged?.lastFourDigits).toBe("1234"); // Original preserved

      consoleSpy.mockRestore();
    });
  });

  describe("deleteCard", () => {
    it("should delete card successfully", () => {
      const card = useCardStore.getState().addCard(createTestCardInput());
      expect(card).not.toBeNull();

      const result = useCardStore.getState().deleteCard(card!.id);

      expect(result).toBe(true);
      expect(useCardStore.getState().cards).toHaveLength(0);
    });

    it("should return false for non-existent id", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = useCardStore.getState().deleteCard("non-existent-uuid");

      expect(result).toBe(false);
      warnSpy.mockRestore();
    });

    it("should only delete the specified card", () => {
      const card1 = useCardStore
        .getState()
        .addCard(createTestCardInput({ name: "Card 1" }));
      const card2 = useCardStore
        .getState()
        .addCard(createTestCardInput({ name: "Card 2" }));

      expect(card1).not.toBeNull();
      expect(card2).not.toBeNull();

      useCardStore.getState().deleteCard(card1!.id);

      const cards = useCardStore.getState().cards;
      expect(cards).toHaveLength(1);
      expect(cards[0].name).toBe("Card 2");
    });
  });

  describe("getCards", () => {
    it("should return all cards", () => {
      useCardStore.getState().addCard(createTestCardInput({ name: "Card 1" }));
      useCardStore.getState().addCard(createTestCardInput({ name: "Card 2" }));
      useCardStore.getState().addCard(createTestCardInput({ name: "Card 3" }));

      const cards = useCardStore.getState().getCards();

      expect(cards).toHaveLength(3);
    });

    it("should return empty array when no cards", () => {
      const cards = useCardStore.getState().getCards();
      expect(cards).toEqual([]);
    });
  });

  describe("getCardById", () => {
    it("should return correct card", () => {
      const card1 = useCardStore
        .getState()
        .addCard(createTestCardInput({ name: "Card 1" }));
      const card2 = useCardStore
        .getState()
        .addCard(createTestCardInput({ name: "Card 2" }));

      expect(card1).not.toBeNull();
      expect(card2).not.toBeNull();

      const result = useCardStore.getState().getCardById(card2!.id);

      expect(result?.name).toBe("Card 2");
    });

    it("should return undefined for non-existent id", () => {
      useCardStore.getState().addCard(createTestCardInput());

      const result = useCardStore.getState().getCardById("non-existent-uuid");

      expect(result).toBeUndefined();
    });
  });

  describe("importCards", () => {
    it("should import valid cards", () => {
      const cards: Card[] = [
        createValidCard({ id: "550e8400-e29b-41d4-a716-446655440001" }),
        createValidCard({ id: "550e8400-e29b-41d4-a716-446655440002" }),
      ];

      const result = useCardStore.getState().importCards(cards);

      expect(result).toBe(true);
      expect(useCardStore.getState().cards).toHaveLength(2);
    });

    it("should reject import with invalid cards", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidCards = [
        createValidCard(),
        { ...createValidCard(), lastFourDigits: "12" }, // Invalid
      ];

      const result = useCardStore
        .getState()
        .importCards(invalidCards as Card[]);

      expect(result).toBe(false);
      expect(useCardStore.getState().cards).toHaveLength(0); // Original state preserved
      consoleSpy.mockRestore();
    });

    it("should reject import with duplicate IDs in payload", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const cardId = "550e8400-e29b-41d4-a716-446655440001";
      const duplicateCards = [
        createValidCard({ id: cardId, name: "Card 1" }),
        createValidCard({ id: cardId, name: "Card 2" }), // Duplicate ID
      ];

      const result = useCardStore.getState().importCards(duplicateCards);

      expect(result).toBe(false);
      expect(useCardStore.getState().cards).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[CardStore] Import cancelled: Duplicate card IDs detected in payload"
      );

      consoleSpy.mockRestore();
    });

    it("should replace existing cards on import", () => {
      useCardStore
        .getState()
        .addCard(createTestCardInput({ name: "Old Card" }));

      const newCards: Card[] = [
        createValidCard({ name: "New Card 1" }),
        createValidCard({
          id: "550e8400-e29b-41d4-a716-446655440003",
          name: "New Card 2",
        }),
      ];

      useCardStore.getState().importCards(newCards);

      const cards = useCardStore.getState().cards;
      expect(cards).toHaveLength(2);
      expect(cards.every((c) => c.name.startsWith("New Card"))).toBe(true);
    });
  });

  describe("persistence", () => {
    it("should use correct storage key in dev", () => {
      useCardStore.getState().addCard(createTestCardInput());

      // Trigger persist
      const options = useCardStore.persist.getOptions();
      expect(options.name).toBe("subtracker-cards-dev");
    });
  });

  describe("rehydration", () => {
    it("should filter out invalid cards during rehydration", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Simulate persisted state with invalid card
      const persistedState = {
        cards: [
          createValidCard(),
          { ...createValidCard(), lastFourDigits: "12", id: "invalid-card-id" }, // Invalid
        ],
      };

      // Use merge function directly
      const currentState = useCardStore.getState();
      const merged = useCardStore.persist
        .getOptions()
        .merge?.(persistedState as Partial<CardsState>, currentState);

      // Only valid cards should remain
      expect(merged?.cards).toHaveLength(1);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
