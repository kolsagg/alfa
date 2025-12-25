# Story 6.2: Card Management UI (Add/Edit/Delete)

Status: done

## Story

As a **user**,
I want **to manage my payment cards in a dedicated wallet view**,
so that **I can track which cards are linked to my subscriptions and keep their details current**.

## Acceptance Criteria

1.  **AC1: Card List Integration:**
    - Given the user navigates to the Wallet page,
    - When cards exist in the store,
    - Then a list/grid of cards is displayed (responsive: 1-col mobile, 2-col desktop).
    - And the "Coming Soon" badge/logic from Story 8.8 is removed.
2.  **AC2: Visual Card Representation:**
    - Each card is displayed as a `CardVisual` component with glassmorphism + OKLCH color.
    - Features: Card Name, Masked digits (`**** 1234`), formatted Cut-off date (for credit cards).
    - **Debit Card Support (6.2b):** Displays card type badge and optional bank name.
    - Aspect ratio matches standard credit card (~1.586).
    - **Privacy Note (NFR06):** UI clearly states "Sadece son 4 hane saklanır" (Only last 4 digits stored).
3.  **AC3: Add Card Flow:**
    - "Add Card" button available in Header and Empty State.
    - Opens `CardForm` dialog in `add` mode.
    - **Fields:** Name, Type (Credit/Debit), Last 4 Digits, Cut-off Date (conditional), Bank Name (optional), Color.
    - Reuses existing `ColorPicker` component.
    - Real-time validation (Zod schema).
4.  **AC4: Edit/Delete Flow:**
    - Tapping a card opens `CardForm` dialog in `edit` mode.
    - "Delete" button in dialog triggers `AlertDialog` confirmation.
    - Deletion removes card and shows success toast (`sonner`).
5.  **AC5: Empty State Enhancement:**
    - `WalletEmptyState` updated to include a "Add Your First Card" CTA button.
    - Clicking button opens the Add Card dialog.
6.  **AC6: Performance & Architecture:**
    - Uses targeted Zustand selectors (`state.cards`) to minimize re-renders.
    - Interactive elements have 44x44px touch targets.
    - Accessibility labels (ARIA) provided for all actions.

## Tasks / Subtasks

- [x] **Task 1: Schema & Store Prep** (AC: #3)
  - [x] 1.1 Update `src/types/card.ts`: relax color regex and add `type`, `bankName`, `cutoffDate` logic.
  - [x] 1.2 Update `src/lib/i18n/wallet.ts`: Add keys for all card management actions, labels, and 6.2b enhancements.
- [x] **Task 2: UI Components Development** (AC: #2)
  - [x] 2.1 Create `src/components/features/wallet/card-visual.tsx` with 6.2b visual badges and conditional rendering.
  - [x] 2.2 Create `src/components/features/wallet/card-list.tsx` (Responsive Grid).
- [x] **Task 3: Card Form & Dialogs** (AC: #3, #4)
  - [x] 3.1 Create `src/components/features/wallet/card-form-dialog.tsx` with type selector and conditional fields.
  - [x] 3.2 Create container dialogs/logic in `wallet-page.tsx`.
- [x] **Task 4: Page Integration** (AC: #1, #5)
  - [x] 4.1 Update `src/components/features/wallet/wallet-empty-state.tsx`.
    - Add `onAddCard` prop.
    - Add `Button` component with "Add Your First Card" label.
  - [x] 4.2 Update `src/pages/wallet-page.tsx`.
    - Wire up `useCardStore`.
    - Conditionally render `CardList` vs `WalletEmptyState`.
    - Add header action button.
- [x] **Task 5: Testing & Validation** (AC: #6)
  - [x] 5.1 Create `src/components/features/wallet/card-visual.test.tsx` (Visual props, masking).
  - [x] 5.2 Create `src/components/features/wallet/card-form-dialog.test.tsx` (Validation, Submission, Edit mode).
  - [x] 5.3 Update `src/pages/wallet-page.test.tsx` (Integration flows).
  - [x] 5.4 Verify NFR06 (Privacy note visibility).

## Dev Notes

### 🏗️ Architecture Compliance

- **Store:** `useCardStore` from `src/stores/card-store.ts`.
- **Validation:** `CardSchema` from `src/types/card.ts`.
- **Toast:** `import { toast } from "sonner";`
- **Confirmation:** `import { AlertDialog... } from "@/components/ui/alert-dialog";`
- **Icons:** `import { CreditCard, Plus, Trash2, Edit2 } from "lucide-react";`

### 🎨 Visual Design System (CardVisual)

- **Glassmorphism:**
  ```tsx
  <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all hover:border-white/30 dark:border-white/10 dark:bg-black/10">
    <div
      className="absolute inset-0 opacity-20"
      style={{ backgroundColor: color }}
    />
    {/* Content */}
  </div>
  ```
- **Privacy Note:** Small text (`text-xs text-muted-foreground`) near the input/card.

### 🧩 Component Reuse Strategy

- **ColorPicker:** Do NOT reinvent. Import from `@/components/features/subscription/color-picker`.
- **Colors:** Use constant from `@/components/features/subscription/color-picker-constants`.

### 🧪 Testing Standards

- **Selectors:** Mock store selectors to test re-renders is strictly not required but ensure selectors are granular.
- **Interactions:** Use `@testing-library/user-event` for typing and clicking.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (Antigravity)

### Debug Log References

- Build successful: `npm run build` completed without errors
- All wallet-related tests passed: 58/58 tests
- Lint clean: No eslint errors

### Completion Notes List

- ✅ Task 1.1: Updated CardSchema color validation to support both hex (#RRGGBB) and OKLCH (oklch(l c h)) formats using zod refine
- ✅ Task 1.2: Added 25+ i18n keys for card management (buttons, labels, validation errors, toasts, privacy note)
- ✅ Task 2.1: Created CardVisual component with glassmorphism styling, OKLCH color support, credit card aspect ratio, privacy note (NFR06)
- ✅ Task 2.2: Created CardList component with responsive grid layout and efficient Zustand selector
- ✅ Task 3.1: Created CardFormDialog component with add/edit modes, real-time validation, ColorPicker reuse, AlertDialog for delete confirmation, sonner toast notifications
- ✅ Task 3.2: Integrated dialog state management in WalletPage
- ✅ Task 4.1: Updated WalletEmptyState with onAddCard prop and "İlk Kartınızı Ekleyin" CTA button, removed Coming Soon badge
- ✅ Task 4.2: Updated WalletPage with useCardStore integration, conditional rendering, header Add Card button
- ✅ Task 5.1: Created card-visual.test.tsx with 10 comprehensive tests
- ✅ Task 5.2: Created card-form-dialog.test.tsx with 14 comprehensive tests
- ✅ Task 5.3: Updated wallet-page.test.tsx with 23 integration tests
- ✅ Task 5.4: NFR06 privacy note visibility verified in tests

### File List

**New Files:**

- `src/components/features/wallet/card-visual.tsx`vite
- `src/components/features/wallet/card-visual.test.tsx`
- `src/components/features/wallet/card-list.tsx`
- `src/components/features/wallet/card-form-dialog.tsx`
- `src/components/features/wallet/card-form-dialog.test.tsx`

**Modified Files:**

- `src/types/card.ts` - Added OKLCH color format support
- `src/lib/i18n/wallet.ts` - Added 25+ i18n keys for card management
- `src/components/features/wallet/wallet-empty-state.tsx` - Added onAddCard prop and CTA button
- `src/components/features/wallet/wallet-empty-state.test.tsx` - Updated tests for new functionality
- `src/components/features/wallet/index.ts` - Added barrel exports for new components
- `src/pages/wallet-page.tsx` - Full card management integration
- `src/pages/wallet-page.test.tsx` - Updated with integration tests

## Change Log

| Date       | Change                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 2025-12-26 | Story 6.2 implementation complete - Card Management UI with Add/Edit/Delete and 6.2b enhancements (Debit cards) |
