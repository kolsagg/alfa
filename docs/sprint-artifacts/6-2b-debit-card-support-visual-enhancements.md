# Story 6.2b: Debit Card Support & Visual Enhancements

Status: review

## Story

As a **user**,
I want **to add both credit and debit cards to my wallet with appropriate visual distinction**,
so that **I can accurately track all my payment methods without confusion about card types**.

## Acceptance Criteria

1.  **AC1: Card Type Selection:**
    - When adding/editing a card, user can select card type: "Kredi Kartı" or "Banka Kartı".
    - Default selection is "Kredi Kartı".
    - UI uses Tab or RadioGroup for type selection.
2.  **AC2: Conditional Cut-off Date:**
    - Cut-off date field is only shown when card type is "Kredi Kartı" (credit).
    - For "Banka Kartı" (debit), cut-off date is not required and hidden.
    - Schema validates: `cutoffDate` required only when `type === "credit"`.
3.  **AC3: Optional Bank Name:**
    - New optional field: "Banka Adı" (Bank Name).
    - Max 30 characters, displayed on card visual.
    - Examples: "Garanti", "İş Bankası", "Yapı Kredi".
4.  **AC4: Enhanced CardVisual:**
    - Card type badge displayed (top-left): "Kredi" or "Banka" with distinct styling.
    - Bank name shown (if provided) near card number.
    - Cut-off date only displayed for credit cards.
    - Improved visual hierarchy with subtle animations.
5.  **AC5: Migration Compatibility:**
    - Existing cards default to `type: "credit"`.
    - Store version bumped with migration logic.
    - All existing tests continue to pass.

## Tasks / Subtasks

- [x] **Task 1: Schema & Type Updates** (AC: #1, #2, #3)

  - [x] 1.1 Update `src/types/card.ts`:
    - Add `type: z.enum(["credit", "debit"]).default("credit")`
    - Make `cutoffDate` optional with `.optional()`
    - Add `bankName: z.string().max(30).optional()`
  - [x] 1.2 Update `CardInput` type to reflect new fields.
  - [x] 1.3 Add conditional validation: cutoffDate required when type="credit".

- [x] **Task 2: Store Migration** (AC: #5)

  - [x] 2.1 Bump `card-store.ts` version to 2.
  - [x] 2.2 Add migration: existing cards get `type: "credit"`, `bankName: undefined`.
  - [x] 2.3 Update `importCards` to handle legacy format.

- [x] **Task 3: i18n Updates** (AC: #1, #3, #4)

  - [x] 3.1 Add to `wallet.ts`:
    - `CARD_TYPE_LABEL`, `CARD_TYPE_CREDIT`, `CARD_TYPE_DEBIT`
    - `BANK_NAME_LABEL`, `BANK_NAME_PLACEHOLDER`
    - `CARD_BADGE_CREDIT`, `CARD_BADGE_DEBIT`

- [x] **Task 4: CardFormDialog Updates** (AC: #1, #2, #3)

  - [x] 4.1 Add card type selector (custom button-based toggle).
  - [x] 4.2 Conditionally show/hide cutoffDate field based on type.
  - [x] 4.3 Add optional bankName input field.
  - [x] 4.4 Update form validation logic for conditional cutoffDate.

- [x] **Task 5: CardVisual Enhancements** (AC: #4)

  - [x] 5.1 Add card type badge component (pill-style, top-left).
  - [x] 5.2 Display bankName below card name (if present).
  - [x] 5.3 Conditionally render cutoff date (only for credit).
  - [x] 5.4 Add subtle hover animation improvements.

- [x] **Task 6: Testing** (AC: #5)
  - [x] 6.1 Update `card-store.test.ts` with type field in fixtures.
  - [x] 6.2 Update `card-form-dialog.test.tsx` for new type field.
  - [x] 6.3 Update `card-visual.test.tsx` for badge, bank name, and conditional cutoff rendering.
  - [x] 6.4 Ensure all existing tests pass (backwards compatibility) - 74 tests passing.

## Dev Notes

### 🔄 Schema Changes

```typescript
// src/types/card.ts
export const CardSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50),
    type: z.enum(["credit", "debit"]).default("credit"),
    lastFourDigits: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
    cutoffDate: z.number().int().min(1).max(31).optional(),
    bankName: z.string().max(30).optional(),
    color: z.string().refine(/* existing OKLCH/hex validation */).optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((data) => data.type === "debit" || data.cutoffDate !== undefined, {
    message: "Credit cards require a cut-off date",
    path: ["cutoffDate"],
  });
```

### 🎨 CardVisual Badge Design

```tsx
// Badge styling
<span
  className={cn(
    "absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full",
    type === "credit"
      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
  )}
>
  {type === "credit" ? "Kredi" : "Banka"}
</span>
```

### 📦 Migration Strategy

```typescript
// card-store.ts migration
if (version <= 1) {
  state.cards = state.cards.map((card) => ({
    ...card,
    type: card.type ?? "credit",
    bankName: card.bankName ?? undefined,
  }));
}
```

## Dev Agent Record

### Context Reference

<!-- Extends Story 6.2 -->

### Agent Model Used

Claude Sonnet 4 (Antigravity)

### Debug Log References

- Build successful: `npm run build` completed without errors
- All wallet-related tests passed: 74/74 tests
- Lint clean: No eslint errors

### Completion Notes List

- ✅ Task 1: Updated CardSchema with `type` enum, optional `cutoffDate`, `bankName`, and conditional validation via Zod refine
- ✅ Task 2: Store version bumped to 2 with migration logic for existing cards
- ✅ Task 3: Added 8 new i18n keys for card type, bank name, and badges
- ✅ Task 4: CardFormDialog now includes card type selector, conditional cutoff, and bank name input
- ✅ Task 5: CardVisual enhanced with type badge, bank name display, and conditional cutoff rendering
- ✅ Task 6: All test files updated with new type field, 74 tests passing

### File List

**Modified Files:**

- `src/types/card.ts` - Added CardType enum, optional cutoffDate, bankName, conditional validation
- `src/stores/card-store.ts` - Version 2 migration, type default in addCard
- `src/lib/i18n/wallet.ts` - 8 new i18n keys for debit card support
- `src/components/features/wallet/card-visual.tsx` - Type badge, bank name, conditional cutoff, icon switch
- `src/components/features/wallet/card-form-dialog.tsx` - Type selector, bank name input, conditional form logic
- `src/components/features/wallet/card-visual.test.tsx` - New tests for badge, bank name, debit cards
- `src/components/features/wallet/card-form-dialog.test.tsx` - Type field in fixtures
- `src/stores/card-store.test.ts` - Type field in createValidCard helper
- `src/pages/wallet-page.test.tsx` - Type field in mockCard, updated privacy/cutoff test

## Change Log

| Date       | Change                                                    |
| ---------- | --------------------------------------------------------- |
| 2025-12-26 | Story created for debit card support                      |
| 2025-12-26 | Implementation complete - all 6 tasks done, 74 tests pass |
