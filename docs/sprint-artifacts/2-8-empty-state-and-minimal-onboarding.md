# Story 2.8: Empty State and Minimal Onboarding

Status: done

## Story

**As a** first-time user,
**I want** guidance when the app is empty,
**So that** I know how to get started quickly and see the immediate value of tracking my subscriptions.

## Acceptance Criteria

1.  **Given** user has no subscriptions (first-time or all deleted)
    **When** they view the dashboard
    **Then** a welcoming empty state component is displayed with:

    - Welcome message: "Merhaba! Aboneliklerini takip etmeye hazır mısın?"
    - Illustrative icon/visual (resilient to `prefers-reduced-motion`).
    - Quick-Add Grid (reusing existing components).
    - "Özel Abonelik Ekle" CTA.
    - Tutorial hint: "Popüler servisleri ekleyin veya ayarlar menüsünden hatırlatıcıları yapılandırın."

2.  **Given** the empty state is displayed
    **When** user interacts with any action (Quick-Add or Custom)
    **Then** the centralized `AddSubscriptionDialog` opens via `useUIStore`.

3.  **Given** a Quick-Add service is picked
    **When** the form opens
    **Then** it MUST be pre-filled with service metadata (color, icon, name, category).

4.  **Given** the dashboard is empty
    **When** rendering the main view
    **Then** the `CountdownHeroPlaceholder` MUST be hidden to prioritize the onboarding message.

5.  **Given** the user adds their **first** subscription
    **When** the save is successful
    **Then** a "First Value" reveal occurs: Total monthly/yearly projection is shown for the first time.
    **And** empty state is replaced by the subscription list (coordinated via `aria-live` for SR).

6.  **Given** touch interaction
    **When** using any button or tile
    **Then** a **minimum 44x44px target area** is enforced.

## Tasks / Subtasks

- [x] **Task 1: Global State & Dialog Orchestration** (CRITICAL)
  - [x] Update `useUIStore.ts` to include `prefillData` and update `openModal`.
  - [x] Refactor `AddSubscriptionDialog` to handle `prefillData` (skip grid, pre-fill form).
  - [x] Ensure `prefillData` is cleared on dialog close.
- [x] **Task 2: Create EmptyState Component**
  - [x] Implement `EmptyState.tsx` with welcome message, Quick-Add Grid, and custom CTA.
  - [x] Add tutorial hint as per UX spec.
  - [x] Ensure accessibility (ARIA, touch targets).
- [x] **Task 3: Integration & Visibility Logic**
  - [x] Update `SubscriptionList.tsx` to show `EmptyState` when count is 0.
  - [x] Update `App.tsx` to conditionally hide `CountdownHeroPlaceholder`.
- [x] **Task 4: Implementation of "Total Reveal"**
  - [x] Verified dashboard summary updates immediately on first addition.
- [x] **Task 5: Validation & Review Fixes**
  - [x] Exhaustive tests for `EmptyState` and `AddSubscriptionDialog`.
  - [x] Fixed state leakage in `AddSubscriptionDialog` using `useEffect`.
  - [x] Updated tutorial text to include "+ Button" reference based on review.
  - [x] Added integration tests for EmptyState-to-Dialog flow.

## Dev Notes

### 🏗️ Architecture: Centralized Modal Control

Do NOT use local state for the dialog in `EmptyState`. Use the centralized store to prevent synchronization bugs and logic duplication.

**Interface Update for `useUIStore`:**

```typescript
interface UIState {
  activeModal: ModalType;
  editingSubscriptionId: string | null;
  prefillData: Partial<SubscriptionInput> | null; // NEW
  openModal: (
    modal: ModalType,
    id?: string,
    prefill?: Partial<SubscriptionInput>
  ) => void;
  // ...
}
```

### UX: The "Zen Dashboard" Empty State

- **Breathing Room:** Use `py-12` or `py-16` for the empty state container.
- **Illustration:** Use a Lucide icon with a subtle background glow (Oklch primary/10).
- **A11y:** The container should have `role="status"` or `aria-live="polite"` so screen readers announce when user adds the first item and the list appears.

### Component Reuse

- Reuse `QuickAddGrid` from `src/components/features/quick-add/`.
- Ensure `EmptyState` passes a callback to `QuickAddGrid` that calls `store.openModal`.

### File Locations

- Component: `src/components/layout/empty-state.tsx`
- Test: `src/components/layout/empty-state.test.tsx`

## Previous Story Intelligence (2.7)

- **Modularity:** Keep picking logic in pickers; `EmptyState` only triggers the dialog.
- **CSS Variables:** Use `var(--color-primary)` for the welcome icon/glow.

## Technical Requirements

- **Target:** iOS Safari 16.4+ (Standard touch targets).
- **Performance:** Ensure `EmptyState` doesn't re-render `QuickAddGrid` unnecessarily (Memoize if needed).

## Dev Agent Record

### Context Reference

- `docs/ux-design-specification.md` (Journey 1: İlk Kurulum & Keşif)
- `docs/architecture.md` (Zustand stores, UI state handling)
- `docs/epics.md` (Story 2.8)

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- ✅ **Task 1:** `useUIStore`'a `prefillData` ve `SubscriptionPrefillData` interface eklendi. `AddSubscriptionDialog` merkezi store ile kontrol edilir hale getirildi.
- ✅ **Task 2:** `EmptyState` bileşeni oluşturuldu. Zen Dashboard estetik, accessibility (aria-live, role=status), responsive layout.
- ✅ **Task 3:** `SubscriptionList` artık `EmptyState` render ediyor. `App.tsx` abonelik olmadığında `CountdownHeroPlaceholder`'ı gizliyor.
- ✅ **Task 4:** Reactive state ile zaten çalışıyor - subscription ekeyince dashboard summary görünüyor.
- ✅ **Task 5:** 7 unit test yazıldı ve geçti.

### File List

**New Files:**

- `src/components/layout/empty-state.tsx`
- `src/components/layout/empty-state.test.tsx`

**Modified Files:**

- `src/stores/ui-store.ts` - prefillData support
- `src/stores/ui-store.test.ts` - new tests for prefillData
- `src/components/features/subscription/add-subscription-dialog.tsx` - controlled via useUIStore
- `src/components/features/subscription/subscription-list.tsx` - uses EmptyState
- `src/components/features/subscription/subscription-dialogs.test.tsx` - updated empty state test
- `src/App.tsx` - conditional CountdownHeroPlaceholder rendering
