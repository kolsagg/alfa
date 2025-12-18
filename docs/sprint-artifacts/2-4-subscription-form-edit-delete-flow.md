# Story 2.4: Subscription Form - Edit/Delete Flow

Status: done

## Story

**As a** user,
**I want** to edit or delete an existing subscription,
**So that** I can keep my data accurate.

## Acceptance Criteria

1. **Given** user taps on a subscription card
   **When** the detail view opens
   **Then** subscription details are shown (name, amount, currency, category badge, next payment date)
   **And** "Düzenle" button opens edit form pre-filled with existing data
   **And** "Sil" button shows confirmation dialog
   **And** dialog has proper heading and close button

2. **Given** user clicks "Düzenle" button
   **When** the edit form opens
   **Then** `SubscriptionForm` with `mode="edit"` is used
   **And** all fields are pre-populated from `getSubscriptionById(id)`
   **And** form validation works identically to add flow
   **And** on submit, `updateSubscription(id, updates)` is called (returns `boolean`)
   **And** toast notification confirms: "[Name] güncellendi"
   **And** all dialogs close after successful update

3. **Given** user clicks "Sil" button
   **When** the confirmation dialog opens
   **Then** dialog title shows: "[Name]'i bırakıyorsun" (positive framing)
   **And** subtitle shows: "Aylık/Yıllık/Haftalık [amount] tasarruf edeceksin ✨" (success color)
   **And** "Vazgeç" button closes dialog without action
   **And** "Evet, iptal et" button (destructive variant) confirms deletion

4. **Given** user confirms deletion
   **When** `deleteSubscription(id)` is called (returns `boolean`)
   **Then** subscription is removed from store
   **And** toast notification confirms: "[Name] silindi"
   **And** if `!prefersReducedMotion`: confetti CSS animation plays
   **And** if `prefersReducedMotion`: simple checkmark scale/fade animation instead
   **And** all dialogs close, dashboard updates immediately

5. **Given** subscription not found during edit/delete (rehydration deleted it)
   **When** dialog tries to access subscription
   **Then** error state shows: "Bu abonelik artık mevcut değil"
   **And** dialog closes automatically after 2 seconds
   **And** user returns to dashboard

6. **Given** any interactive elements in dialogs
   **When** user navigates with keyboard
   **Then** logical tab order is maintained
   **And** Escape key closes dialogs (when not submitting)
   **And** all buttons meet 44x44px touch target minimum
   **And** focus is trapped within active dialog

7. **Given** edit/delete operation is in progress (`isSubmitting = true`)
   **When** waiting for store action
   **Then** submit/delete button shows `<Loader2>` spinner
   **And** all inputs/buttons are disabled
   **And** dialog `onOpenChange` is blocked (cannot close during submission)

## Tasks / Subtasks

- [x] 1. Create SubscriptionCard Component (AC: 1)

  - [ ] Create `src/components/features/subscription/subscription-card.tsx`
  - [ ] Display: name, amount (formatted), currency, next payment date, category badge
  - [ ] Use `CategoryBadge` from `src/components/ui/category-badge.tsx`
  - [ ] Use `formatCurrency` from `src/components/features/subscription/utils.ts`
  - [ ] Accept `onClick: (subscription: Subscription) => void` prop
  - [ ] Keyboard accessible: `role="button"`, `tabIndex={0}`, Enter/Space triggers click
  - [ ] Hover: `cursor-pointer`, subtle shadow/scale effect

- [x] 2. Create SubscriptionDetailDialog Component (AC: 1)

  - [ ] Create `src/components/features/subscription/subscription-detail-dialog.tsx`
  - [ ] Props: `subscription: Subscription | null`, `open: boolean`, `onOpenChange`, `onEdit`, `onDelete`
  - [ ] Display details with `CategoryBadge` (size="default")
  - [ ] Show next payment date formatted with `date-fns` + `tr` locale
  - [ ] "Düzenle" and "Sil" buttons (44px min height)
  - [ ] Use shadcn `Dialog` component

- [x] 3. Create DeleteConfirmationDialog Component (AC: 3, 4, 5, 7)

  - [ ] Create `src/components/features/subscription/delete-confirmation-dialog.tsx`
  - [ ] Use shadcn `AlertDialog` (not Dialog) for destructive action pattern
  - [ ] Props: `subscription: Subscription | null`, `open`, `onOpenChange`, `onConfirm`
  - [ ] Title: `${subscription.name}'i bırakıyorsun`
  - [ ] Description: `${formatSavingsText(subscription)} tasarruf edeceksin ✨` (text-success)
  - [ ] Buttons: "Vazgeç" (outline), "Evet, iptal et" (destructive)
  - [ ] Loading state: disable buttons, show spinner, block close

- [x] 4. Extend SubscriptionForm for Edit Mode (AC: 2, 7)

  - [ ] Add props: `mode?: "add" | "edit"`, `subscriptionId?: string`
  - [ ] Import `updateSubscription` from store
  - [ ] In `handleSubmit`: if mode="edit", call `updateSubscription(subscriptionId, formData)`
  - [ ] `updateSubscription` returns `boolean`, not `Subscription`
  - [ ] Change submit button text: "Kaydet" → "Güncelle" when edit mode
  - [ ] Dialog close prevention: pass `isSubmitting` to parent via callback or state lift

- [x] 5. Create EditSubscriptionDialog Component (AC: 2, 7)

  - [ ] Create `src/components/features/subscription/edit-subscription-dialog.tsx`
  - [ ] Props: `subscription: Subscription | null`, `open`, `onOpenChange`, `onSuccess`
  - [ ] Map subscription to `initialValues` (see code pattern below)
  - [ ] Block `onOpenChange` when `isSubmitting` is true
  - [ ] On success: close dialog, trigger parent refresh

- [x] 6. Create useReducedMotion Hook (AC: 4)

  - [ ] Create `src/hooks/use-reduced-motion.ts`
  - [ ] Listen to `matchMedia('(prefers-reduced-motion: reduce)')`
  - [ ] Handle dynamic changes via `addEventListener('change', handler)`
  - [ ] Export: `export function useReducedMotion(): boolean`

- [x] 7. Implement Deletion Celebration (AC: 4)

  - [ ] Create `src/components/features/subscription/deletion-celebration.tsx`
  - [ ] **Use CSS keyframes** (NO canvas-confetti - avoid extra dependency)
  - [ ] If `!reducedMotion`: show falling confetti particles (CSS animation)
  - [ ] If `reducedMotion`: show checkmark icon with scale-up + fade animation
  - [ ] Auto-cleanup after animation ends (~2 seconds)

- [x] 8. Handle Edge Case: Subscription Not Found (AC: 5)

  - [ ] In detail/edit/delete dialogs: check `getSubscriptionById(id)` on open
  - [ ] If returns `undefined`: show error state, auto-close after 2s
  - [ ] Toast: "Bu abonelik artık mevcut değil"

- [x] 9. Integrate in Dashboard (AC: 1)

  - [ ] Create dialog state management in `dashboard-layout.tsx` or new wrapper
  - [ ] Wire: card click → detail dialog → edit/delete dialogs
  - [ ] After delete success: check if subscription count === 0 → show empty state (Story 2.8)

- [x] 10. Unit Tests (All ACs)
  - [ ] Create `src/components/features/subscription/subscription-dialogs.test.tsx` (combined file)
  - [ ] Test: edit form pre-populated correctly
  - [ ] Test: `updateSubscription` called with correct id and data
  - [ ] Test: `deleteSubscription` called, returns true → toast + celebration
  - [ ] Test: `deleteSubscription` returns false → error toast, dialog stays open
  - [ ] Test: subscription not found → error state shown
  - [ ] Test: `prefers-reduced-motion: reduce` → confetti skipped, fallback shown
  - [ ] Test: `prefers-reduced-motion: no-preference` → confetti shown
  - [ ] Test: keyboard navigation (Escape closes when not submitting)
  - [ ] Test: loading state blocks dialog close

## Dev Notes

### Store Actions Return Types (CRITICAL)

```typescript
// subscription-store.ts - ALREADY IMPLEMENTED
addSubscription(input: SubscriptionInput): Subscription | null  // Create
updateSubscription(id: string, updates: SubscriptionUpdate): boolean  // Update
deleteSubscription(id: string): boolean  // Delete
getSubscriptionById(id: string): Subscription | undefined  // Read
```

### Edit Mode Form Integration

```typescript
// subscription-form.tsx - Changes needed
interface SubscriptionFormProps {
  initialValues?: Partial<SubscriptionInput>;
  mode?: "add" | "edit"; // NEW
  subscriptionId?: string; // NEW (required when mode="edit")
  onSuccess?: () => void;
  onCancel?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void; // NEW - for dialog close blocking
}

// In handleSubmit:
const addSubscription = useSubscriptionStore((s) => s.addSubscription);
const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);

if (mode === "edit" && subscriptionId) {
  const success = updateSubscription(subscriptionId, formData);
  if (success) {
    toast.success(`${name} güncellendi`);
    onSuccess?.();
  } else {
    toast.error("Güncelleme başarısız");
  }
} else {
  const created = addSubscription(formData);
  // ... existing add logic
}
```

### Subscription to Form Mapping

```typescript
// Map existing subscription to form initialValues
const mapToFormValues = (sub: Subscription): Partial<SubscriptionInput> => ({
  name: sub.name,
  amount: sub.amount,
  currency: sub.currency,
  billingCycle: sub.billingCycle,
  nextPaymentDate: sub.nextPaymentDate, // Show as reference, form will recalculate if changed
  categoryId: sub.categoryId || "other",
  color: sub.color,
  icon: sub.icon,
  cardId: sub.cardId,
  isActive: sub.isActive,
});
```

### Dialog Close Prevention Pattern

```typescript
// CRITICAL: Block dialog close during submission
<Dialog
  open={open}
  onOpenChange={(newOpen) => {
    if (!isSubmitting) onOpenChange(newOpen);
  }}
>
```

### Delete Confirmation UX (Party Mode Decision)

```typescript
// Positive framing with savings message
const formatSavingsText = (sub: Subscription): string => {
  const amount = formatCurrency(sub.amount, sub.currency);
  switch (sub.billingCycle) {
    case "monthly": return `Aylık ${amount}`;
    case "yearly": return `Yıllık ${amount}`;
    case "weekly": return `Haftalık ${amount}`;
    default: return amount;
  }
};

// AlertDialog content:
<AlertDialogTitle>{subscription.name}'i bırakıyorsun</AlertDialogTitle>
<AlertDialogDescription className="text-success">
  {formatSavingsText(subscription)} tasarruf edeceksin ✨
</AlertDialogDescription>
```

### useReducedMotion Hook

```typescript
// src/hooks/use-reduced-motion.ts
import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}
```

### CSS Confetti Animation (NO external package)

```css
/* Add to index.css or component styles */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti-particle {
  position: fixed;
  width: 10px;
  height: 10px;
  animation: confetti-fall 2s ease-out forwards;
}

/* Reduced motion fallback */
@keyframes success-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-checkmark {
  animation: success-pulse 0.3s ease-out forwards;
}
```

### Edge Case: Subscription Not Found

```typescript
const subscription = useSubscriptionStore((s) =>
  s.getSubscriptionById(selectedId)
);

useEffect(() => {
  if (open && !subscription) {
    toast.error("Bu abonelik artık mevcut değil");
    const timer = setTimeout(() => onOpenChange(false), 2000);
    return () => clearTimeout(timer);
  }
}, [open, subscription, onOpenChange]);
```

### Component Imports Reference

```typescript
// From existing codebase:
import { CategoryBadge } from "@/components/ui/category-badge";
import {
  formatCurrency,
  calculateNextPaymentDate,
} from "@/components/features/subscription/utils";
import { useSubscriptionStore } from "@/stores/subscription-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
```

### Previous Story Learnings (2.3)

- ✅ Zustand mock: use `mockImplementation` with selector function support
- ✅ FAB positioned `bottom-24` on mobile (avoid BottomNav overlap)
- ✅ Form uses `noValidate` for custom validation
- ✅ Turkish error messages
- ✅ `initialValues` prop works for pre-fill

### Accessibility Checklist

- [ ] All buttons ≥ 44x44px (`min-h-[44px]`)
- [ ] `aria-labelledby` on dialogs
- [ ] `aria-describedby` for descriptions
- [ ] Focus trap within dialogs (shadcn handles this)
- [ ] Escape closes (except during submission)
- [ ] Screen reader announces toast via live region
- [ ] Reduced motion respected for all animations

## Party Mode Consensus (2025-12-18)

### Delete Confirmation UX

| Element      | Decision                                                               |
| ------------ | ---------------------------------------------------------------------- |
| **Title**    | "[Name]'i bırakıyorsun" (positive framing)                             |
| **Subtitle** | "Aylık/Yıllık/Haftalık [amount] tasarruf edeceksin ✨" (success color) |
| **Confirm**  | "Evet, iptal et" - destructive variant                                 |
| **Cancel**   | "Vazgeç" - outline variant                                             |

### Animation Strategy

- **No reduced motion:** CSS confetti animation (2s duration)
- **Reduced motion:** Checkmark icon with scale-up pulse (0.3s)
- **Zero visual feedback is NOT acceptable** for accessibility

### Test Coverage (Murat - TEA)

1. `prefers-reduced-motion: no-preference` → confetti
2. `prefers-reduced-motion: reduce` → fallback animation
3. Delete success → toast + store update
4. Delete fail → error toast, dialog stays open
5. Subscription not found → error state, auto-close

### Scope Boundaries

- ✅ Current period savings only (no yearly projection)
- ✅ Out of scope: cumulative savings tracker (Story 3.1)
- ✅ Empty state after last delete → defer to Story 2.8

## Dev Agent Record

### Context Reference

- `src/components/features/subscription/subscription-form.tsx` (extend with mode prop)
- `src/components/features/subscription/add-subscription-dialog.tsx` (dialog pattern)
- `src/components/features/subscription/utils.ts` (formatCurrency, calculateNextPaymentDate)
- `src/stores/subscription-store.ts` (updateSubscription, deleteSubscription, getSubscriptionById)
- `src/types/subscription.ts` (Subscription, SubscriptionUpdate)
- `src/components/ui/category-badge.tsx` (CategoryBadge component)
- `src/components/ui/dialog.tsx` (Dialog)
- `src/components/ui/alert-dialog.tsx` (AlertDialog for destructive actions)
- `src/config/categories.ts` (category metadata)

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

### File List

**New Files:**

- `src/components/features/subscription/subscription-card.tsx`
- `src/components/features/subscription/subscription-detail-dialog.tsx`
- `src/components/features/subscription/delete-confirmation-dialog.tsx`
- `src/components/features/subscription/edit-subscription-dialog.tsx`
- `src/components/features/subscription/deletion-celebration.tsx`
- `src/components/features/subscription/subscription-list.tsx`
- `src/components/features/subscription/subscription-dialogs.test.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/hooks/use-reduced-motion.ts`

**Modified Files:**

- `src/components/features/subscription/subscription-form.tsx` (add mode, subscriptionId, onSubmittingChange props + code review fixes)
- `src/App.tsx` (integrate SubscriptionList)
- `src/index.css` (add animations)
- `src/components/ui/dialog.tsx` (fix close button hit area)

## Change Log

- 2025-12-18: Story created - ready-for-dev
- 2025-12-18: Party Mode consensus added (delete UX, animations, edge cases)
- 2025-12-18: Quality review - 15 improvements applied (critical fixes, enhancements, optimizations)
- 2025-12-18: ADVERSARIAL Code Review - 8 issues identified and fixed (Jumping date bug, touch targets, toast consistency, test coverage)
