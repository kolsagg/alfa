# Story 6.1: Cards Zustand Slice

Status: done

## Story

As a **developer**,
I want **a typed cards slice in the store**,
so that **I can manage card data with type safety**.

## Acceptance Criteria

1. **AC1 - Store Initialization:** Given the cards slice is initialized, When I access the store, Then it connects to localStorage with environment-aware namespace.
2. **AC2 - Typed Actions:** Then I have typed actions: `addCard`, `updateCard`, `deleteCard`, `getCards`, `getCardById`.
3. **AC3 - Card Schema:** And card schema includes: `id`, `name`, `lastFourDigits`, `cutoffDate`, `color` (optional), `createdAt`, `updatedAt`.
4. **AC4 - Persistence:** And slice is persisted to localStorage with key `subtracker-cards` (prod) or `subtracker-cards-dev` (dev).
5. **AC5 - Unit Tests:** And unit tests cover all CRUD actions, validation, persistence, and migration.
6. **AC6 - Privacy Compliance (NFR06):** And only last 4 digits of card number are stored (no full card numbers).

- [x] **Task 6: Review Follow-ups (AI)** (AC: All)

  - [x] [AI-Review][High] Implement uniqueness check for IDs in `importCards`
  - [x] [AI-Review][Medium] Improve error logging in `importCards` to identify failing records
  - [x] [AI-Review][Low] Improve timestamp mocking in tests using `vi.setSystemTime`
  - [x] [AI-Review][Low] Sync `File List` with actual git changes (added `sprint-status.yaml`)

- [x] **Task 1: Create Card Type & Schema** (AC: #3, #6)

  - [x] 1.1: Create `src/types/card.ts` with CardSchema using Zod
  - [x] 1.2: Define fields: `id` (uuid), `name` (string 1-50), `lastFourDigits` (4-digit string regex), `cutoffDate` (1-31 int), `color` (optional hex), `createdAt`, `updatedAt`
  - [x] 1.3: Export CardSchema, Card type, CardUpdateSchema, CardUpdate type
  - [x] 1.4: Add CardInput type (omit auto-generated fields: id, createdAt, updatedAt)
  - [x] 1.5: Update `src/types/index.ts` — add line: `export * from "./card";`

- [x] **Task 2: Implement Card Store** (AC: #1, #2, #4)

  - [x] 2.1: Create `src/stores/card-store.ts` using `createStore` factory
  - [x] 2.2: Implement CardStoreState interface with `cards: Card[]`
  - [x] 2.3: Implement CardStoreActions interface with CRUD actions
  - [x] 2.4: Implement `addCard(input: CardInput)` - generates UUID, timestamps, validates
  - [x] 2.5: Implement `updateCard(id: string, updates: CardUpdate)` - validates, updates timestamp
  - [x] 2.6: Implement `deleteCard(id: string)` - removes card, returns boolean
  - [x] 2.7: Implement `getCards()` - returns all cards
  - [x] 2.8: Implement `getCardById(id: string)` - returns card or undefined
  - [x] 2.9: Implement `importCards(cards: Card[])` - bulk import with validation
  - [x] 2.10: Configure: `storageName: "cards"`, `version: 1`
  - [x] 2.11: Add partialize to persist only `cards` array
  - [x] 2.12: Add merge function with validation on rehydration

- [x] **Task 3: Add Migration & Version Strategy** (AC: #1)

  - [x] 3.1: Set initial version to 1
  - [x] 3.2: Add migration function (v0→v1 ensures cards array exists)
  - [x] 3.3: Log migration: `[CardStore] Migrating from v0 to v1`

- [x] **Task 4: Write Unit Tests** (AC: #5)

  - [x] 4.1: Create `src/stores/card-store.test.ts`
  - [x] 4.2: Add beforeEach: reset store state + localStorage.clear()
  - [x] 4.3: Test `addCard` valid - verify id, timestamps generated
  - [x] 4.4: Test `addCard` invalid - verify null, console.error spied
  - [x] 4.5: Test `addCard` with optional color field
  - [x] 4.6: Test `updateCard` success - partial update works
  - [x] 4.7: Test `updateCard` non-existent id - returns false, console.warn
  - [x] 4.8: Test `updateCard` invalid data - original unchanged
  - [x] 4.9: Test `deleteCard` success
  - [x] 4.10: Test `deleteCard` non-existent id - returns false
  - [x] 4.11: Test `getCards` returns all
  - [x] 4.12: Test `getCardById` correct card or undefined
  - [x] 4.13: Test persistence to `subtracker-cards-dev`
  - [x] 4.14: Test rehydration from localStorage
  - [x] 4.15: Test validation on rehydration - invalid cards filtered
  - [x] 4.16: Test `importCards` valid data
  - [x] 4.17: Test `importCards` invalid - rejects import

- [x] **Task 5: Validation & Integration** (AC: All)
  - [x] 5.1: Run `npm test src/stores/card-store.test.ts`
  - [x] 5.2: Run `npm run lint` - no errors
  - [x] 5.3: Run `npm run build` - succeeds
  - [x] 5.4: Verify subscription store's cardId references work

## Dev Notes

### Complete Card Type Implementation

```typescript
// src/types/card.ts
import { z } from "zod";

export const CardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  lastFourDigits: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
  cutoffDate: z.number().int().min(1).max(31),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Card = z.infer<typeof CardSchema>;

export const CardUpdateSchema = CardSchema.partial().omit({
  id: true,
  createdAt: true,
});
export type CardUpdate = z.infer<typeof CardUpdateSchema>;
```

### Complete Card Store Implementation

```typescript
// src/stores/card-store.ts
import { createStore } from "./create-store";
import { CardSchema, CardUpdateSchema } from "@/types/card";
import type { Card, CardUpdate } from "@/types/card";
import { generateUUID } from "@/lib/uuid";

export type CardInput = Omit<Card, "id" | "createdAt" | "updatedAt">;

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

      return true;
    },

    getCards: () => get().cards,

    getCardById: (id) => get().cards.find((card) => card.id === id),

    importCards: (newCards) => {
      const valid = newCards.every(
        (card) => CardSchema.safeParse(card).success
      );

      if (!valid) {
        console.error("[CardStore] Import cancelled: Invalid records detected");
        return false;
      }

      set({ cards: newCards });
      return true;
    },
  }),
  {
    name: "CardStore",
    storageName: "cards",
    version: 1,
    migrate: (persistedState: unknown, version: number) => {
      const state = persistedState as Partial<CardsState>;

      if (version === 0) {
        console.log("[CardStore] Migrating from v0 to v1");
        state.cards = state.cards ?? [];
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
```

### Complete Test File Template

```typescript
// src/stores/card-store.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCardStore, type CardsState, type CardInput } from "./card-store";

const createTestCardInput = (
  overrides: Partial<CardInput> = {}
): CardInput => ({
  name: "Test Card",
  lastFourDigits: "1234",
  cutoffDate: 15,
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
      expect(result?.createdAt).toBeDefined();
      expect(result?.name).toBe("Test Card");
    });

    it("should return null for invalid input", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalid = { ...createTestCardInput(), lastFourDigits: "12" }; // Invalid
      const result = useCardStore.getState().addCard(invalid);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should add card with optional color", () => {
      const input = createTestCardInput({ color: "#FF5733" });
      const result = useCardStore.getState().addCard(input);

      expect(result?.color).toBe("#FF5733");
    });
  });

  // ... remaining tests follow subscription-store.test.ts pattern
});
```

### Storage Key

- **Production:** `subtracker-cards`
- **Development:** `subtracker-cards-dev`

### Console Spy Pattern (for tests)

```typescript
// Success pattern - spy and restore
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
// ... perform action that should error ...
expect(consoleSpy).toHaveBeenCalled();
consoleSpy.mockRestore();

// Warning pattern
const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
// ... perform action that should warn ...
expect(warnSpy).toHaveBeenCalled();
warnSpy.mockRestore();
```

### Privacy Compliance (NFR06)

⚠️ **CRITICAL:** Only store `lastFourDigits` - NEVER full card numbers.
Schema regex `/^\d{4}$/` enforces exactly 4 digits.

### Integration Notes

**Subscription Store Compatibility:**

- `subscription-store.ts` has `cardId: z.string().uuid().optional()`
- Card deletion does NOT cascade to subscriptions (handled in Story 6.3)
- Orphan cardId references are acceptable until Story 6.3

**Backup Schema (Future - Epic 6 completion):**

- `backup.ts` will need `cards` array added to BackupSchema
- `CURRENT_STORE_VERSIONS` will need `cards: 1`
- This is Story 6.5 or Epic 6 completion scope, not this story

### Files to Create/Modify

| File                            | Action | Content                                        |
| ------------------------------- | ------ | ---------------------------------------------- |
| `src/types/card.ts`             | CREATE | CardSchema, Card, CardUpdateSchema, CardUpdate |
| `src/types/index.ts`            | MODIFY | Add: `export * from "./card";`                 |
| `src/stores/card-store.ts`      | CREATE | Complete store implementation                  |
| `src/stores/card-store.test.ts` | CREATE | 17 test cases                                  |

### References

- [Source: docs/architecture.md#Data Architecture - Storage Namespace Strategy]
- [Source: docs/architecture.md#State Management Patterns]
- [Source: docs/epics.md#Story 6.1: Cards Zustand Slice]
- [Source: docs/PRD.md#FR06, FR07, NFR06]
- [Source: src/stores/subscription-store.ts - Reference pattern]
- [Source: src/stores/subscription-store.test.ts - Test pattern]
- [Source: src/stores/create-store.ts - Factory pattern]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (Antigravity)

### Debug Log References

- All 22 unit tests passed
- Lint check passed with no errors
- Build succeeded

### Completion Notes List

- ✅ Created `src/types/card.ts` with full Zod schema validation
- ✅ CardSchema enforces NFR06 privacy: only lastFourDigits (4-digit regex) stored
- ✅ Implemented complete card-store.ts with all CRUD actions
- ✅ Store uses createStore factory with proper persistence config
- ✅ Version 1 with migration strategy ready for future migrations
- ✅ Merge function filters invalid cards on rehydration
- ✅ 22 comprehensive unit tests covering all scenarios
- ✅ Subscription store compatibility verified (cardId: uuid optional)

### File List

| File                                       | Action   |
| ------------------------------------------ | -------- |
| `src/types/card.ts`                        | Created  |
| `src/types/index.ts`                       | Modified |
| `src/stores/card-store.ts`                 | Created  |
| `src/stores/card-store.test.ts`            | Created  |
| `docs/sprint-artifacts/sprint-status.yaml` | Modified |

### Change Log

- 2025-12-25: Story 6.1 implemented - Cards Zustand Slice with full CRUD, persistence, migration, and tests
- 2025-12-25: Code Review fixes applied (Import uniqueness, error logging improvements, test mocking optimization)
