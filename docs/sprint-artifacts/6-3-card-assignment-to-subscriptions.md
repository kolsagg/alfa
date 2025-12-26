# Story 6.3: Card Assignment to Subscriptions

Status: done

## Story

As a **user**,
I want **to assign a card to each subscription**,
So that **I know which card will be charged for each payment**.

## Acceptance Criteria

1. **AC1 - Card Dropdown in Subscription Form:**

   - Given the user adds/edits a subscription,
   - When they view the card field,
   - Then a dropdown shows all saved cards + "Kart seçilmedi" (No card) option.
   - And each card option displays: Card Name, Type Badge (Kredi/Banka), Last 4 Digits.
   - And the component remains consistent with `CategorySelect` UI patterns.

2. **AC2 - Card Selection Persistence:**

   - Given the user selects a card and saves the subscription,
   - When they view the subscription later,
   - Then the selected card is displayed in the subscription details.
   - And the `cardId` field is correctly persisted in the subscription record.

3. **AC3 - Subscription List Display:**

   - Given subscriptions have assigned cards,
   - When the user views the subscription list,
   - Then the card name and last 4 digits are displayed on subscription items.
   - And the display is responsive and handles long card names gracefully.

4. **AC4 - Orphan Card Reference Handling:**

   - Given a card is deleted that was assigned to subscriptions,
   - When the subscriptions are viewed,
   - Then they show "Kart atanmamış" (No card assigned) gracefully without errors.
   - And the subscription store cleans up invalid references during data rehydration.

5. **AC5 - Empty Card State:**
   - Given the user has no cards saved,
   - When they try to assign a card in subscription form,
   - Then the dropdown shows "Henüz kart yok" (No cards yet) with a button to navigate to Wallet.
   - And the user is warned if they have unsaved changes before navigating away.

## Tasks / Subtasks

- [x] **Task 1: Centralized i18n Strategy** (AC: #1, #3)

  - [x] 1.1: Create/Update `src/lib/i18n/subscriptions.ts`
    - CENTRALIZED STRINGS: `CARD_SELECT_LABEL`, `CARD_SELECT_PLACEHOLDER`, `NO_CARDS_AVAILABLE`, `NO_CARD_ASSIGNED`, `GO_TO_WALLET`.
  - [x] 1.2: Refactor `subscription-form.tsx` to use these localized strings instead of hardcoded text.

- [x] **Task 2: CardSelect Component (Forms Layer)** (AC: #1, #5, #6)

  - [x] 2.1: Create `src/components/forms/card-select.tsx` (Maintain directory consistency with `CategorySelect`).
  - [x] 2.2: Implement `CardSelectProps` matching `CategorySelectProps` pattern.
  - [x] 2.3: Use `useCardStore` with an optimized selector to fetch only necessary card data.
  - [x] 2.4: Implement OKLCH-compliant badges for card types (Kredi/Banka).
  - [x] 2.5: Add navigation to `/#/wallet` with a dirty-state check for the parent form.

- [x] **Task 3: Subscription Store Robustness** (AC: #4)

  - [x] 3.1: Update `src/stores/subscription-store.ts` rehydration/merge logic.
  - [x] 3.2: Orphan cardId references handled gracefully at display layer (subscription-card.tsx shows "Kart atanmamış").

- [x] **Task 4: Subscription Form Integration** (AC: #1, #2)

  - [x] 4.1: Plug `CardSelect` into `SubscriptionForm` after the icon picker.
  - [x] 4.2: Ensure `cardId` state is properly handled in `handleSubmit` and validation schemas.

- [x] **Task 5: UI/UX Updates for Subscription Card** (AC: #3, #4)

  - [x] 5.1: Update `src/components/features/subscription/subscription-card.tsx` to show card info.
  - [x] 5.2: Use a compact layout (Micro-icon + Last 4) for mobile view to prevent layout shift.

- [x] **Task 6: Testing (Precision Mocking)**
  - [x] 6.1: Create `src/components/forms/card-select.test.tsx`.
  - [x] 6.2: Use `vi.mock("@/stores/card-store")` to control card states for edge case testing (empty, loaded, multiple).
  - [x] 6.3: Verify "No card" selection results in `undefined` value.

## Dev Notes

### 🏗️ Architecture Compliance

- **Folder Structure:** UI components meant for forms MUST live in `src/components/forms/`.
- **I18n:** NEVER hardcode strings. Use `src/lib/i18n/` constants.
- **Store Sync:** Since `cardId` is a cross-slice reference, handle the "Deleted Card" scenario in the `merge` function of `subscription-store.ts`.

### 🎨 Design System

**Shared Props Interface:**

```typescript
interface CardSelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

**Mobile-Optimized Display:**

```tsx
// Use a tiny pill or icon badge in the subscription card list
<div className="flex items-center gap-1.5 text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">
  <CreditCard size={10} />
  <span>*{card.lastFourDigits}</span>
</div>
```

### 🧩 Optimization Patterns

- **Selectors:** Use `state => state.cards` carefully. If the form only needs to list them once, a standard selector is fine.
- **Performance:** In the `SubscriptionCard`, if many items are rendered, avoid full store subscription; use a targeted getter if possible.

### ⚠️ Edge Cases

1. **Unsaved Form Data:** Warning when clicking "Add Card" from within the subscription form.
2. **Missing Card Record:** Graceful handling of `cardId` that no longer maps to a card in `CardStore`.
3. **Empty Cards State:** Prompt user to go to Wallet and explain WHY (to track spending by card).

### 📁 File References

**Files to Create/Modified:**

- `src/components/forms/card-select.tsx` (NEW)
- `src/lib/i18n/subscriptions.ts` (NEW/UPDATE)
- `src/stores/subscription-store.ts` (SYNC LOGIC)
- `src/components/features/subscription/subscription-card.tsx` (DISPLAY)

## Dev Agent Record

### Implementation Plan

1. Created centralized i18n strings for subscriptions (Turkish)
2. Built CardSelect component following CategorySelect patterns
3. Implemented robust AC4 cleanup in SubscriptionStore's merge function
4. Integrated CardSelect into SubscriptionForm with unsaved changes warning
5. Enhanced SubscriptionCard to show card pill with last 4 digits
6. Created comprehensive tests (including AC4 orphan cleanup verification)

### Completion Notes

✅ Story 6.3 implementation complete:

- CardSelect component created with empty state, type badges (Kredi/Banka), and wallet navigation
- SubscriptionForm now includes card selection with AlertDialog for unsaved changes
- SubscriptionCard displays assigned card info in compact pill format
- Orphan card references show "Kart atanmamış" gracefully
- 16 unit tests passing for CardSelect component
- All 5 related subscription tests passing
- Overall: 872 tests passing, lint clean, build successful

## File List

**New Files:**

- `src/lib/i18n/subscriptions.ts`
- `src/components/forms/card-select.tsx`
- `src/components/forms/card-select.test.tsx`

**Modified Files:**

- `src/components/features/subscription/subscription-form.tsx`
- `src/components/features/subscription/subscription-card.tsx`
- `src/stores/subscription-store.ts`

## Change Log

| Date       | Change                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------- |
| 2025-12-26 | Story 6.3 created - Comprehensive Draft                                                       |
| 2025-12-26 | Story improved after \*validate-create-story review (Location fix, I18n sync, Orphan cleanup) |
| 2025-12-26 | Implementation complete - All tasks done, tests passing                                       |
| 2025-12-26 | AI Review Fixes - Robust AC4 cleanup, state initialization fix, expanded tests                |
