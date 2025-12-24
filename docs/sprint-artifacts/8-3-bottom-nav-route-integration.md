# Story 8.3: Bottom Nav Route Integration

Status: Done

## Story

As a **user**,
I want **the bottom navigation to clearly indicate which page I'm viewing and provide smooth navigation feedback**,
so that **I always know where I am in the app and get satisfying visual feedback when navigating across any device**.

## Acceptance Criteria

### AC1: Active State Visual Distinction

- **Given** the user is on any page (Dashboard, Settings, Wallet)
- **When** they view the BottomNav
- **Then** the active tab uses primary teal (`oklch(0.75 0.12 180)`) with enhanced visual markers:
  - Active icon uses `fill-current` or increased stroke weight (`stroke-[2.5]`)
  - Item background includes a subtle highlight (`bg-primary/10`)
  - Subtle scale transform (`scale-105`) is applied to the active container

### AC2: Navigation Transition & Feedback

- **Given** the user taps a navigation item
- **When** the route changes
- **Then** CSS transitions handle opacity, transform, and background changes smoothly
- **And** animations respect `prefers-reduced-motion`
- **And** (PWA/Mobile) a short haptic feedback (`navigator.vibrate(10)`) is triggered if supported by the browser

### AC3: Elevated Center Action (Add Button)

- **Given** the "Ekle" (Add) button is in the center
- **When** the user views the BottomNav
- **Then** it is visually distinct as the primary Global Action:
  - Circular shape with `bg-primary` and `text-primary-foreground`
  - Elevated positioning (slight negative top margin) with `shadow-lg`
- **And** it triggers the AddSubscriptionDialog without affecting the active route styling

### AC4: iOS PWA & Responsive Constraints

- **Given** the app is installed as a PWA on an iOS device with a notch
- **When** the BottomNav renders
- **Then** it MUST respect safe area insets using `padding-bottom: env(safe-area-inset-bottom)`
- **And** all interactive items maintain 44x44px minimum touch targets
- **And** labels use `whitespace-nowrap` to prevent wrapping on narrower screens

### AC5: PWA Standalone Mode Consistency

- **Given** the app is running in Standalone mode
- **When** the user navigates between routes
- **Then** the BottomNav active state remains synchronized with the URL hash
- **And** navigation is instantaneous with no full-page reloads

### AC6: Accessibility & Semantics

- **Given** a screen reader user
- **When** navigating between tabs
- **Then** the active NavLink has `aria-current="page"` explicitly set
- **And** focus rings are clearly visible and match the brand color palette

### AC7: Technical Regression

- **Given** new styling and logic
- **When** the test suite executes
- **Then** `npm run lint && npm run build && npm test -- --run` passes
- **And** unit tests verify active state logic for all 3 routes (Dashboard, Settings, Wallet)

## Tasks / Subtasks

- [x] **Task 1: Design System & Layout Enhancements (AC: #1, #3, #4)**

  - [x] 1.1 Update `bottom-nav.tsx` layout to use `fixed` position with `safe-area-inset-bottom` support
  - [x] 1.2 Refactor NavLink styling to include highlight, scale-up, and icon variants
  - [x] 1.3 Styles: Apply `whitespace-nowrap` and consistent typography to labels
  - [x] 1.4 Refactor Center Button: Circular, elevated, `shadow-lg`, and `bg-primary`

- [x] **Task 2: Interactive Feedback & Transitions (AC: #2)**

  - [x] 2.1 Implement CSS transitions for active state swaps (opacity, scale, color)
  - [x] 2.2 Define custom cubic-bezier easing in `index.css` for "premium" feel
  - [x] 2.3 Add conditional `navigator.vibrate` call on navigation clicks

- [x] **Task 3: Logic & Accessibility (AC: #5, #6)**

  - [x] 3.1 Ensure `aria-current="page"` is dynamically mapped based on `isActive`
  - [x] 3.2 Verify hash-routing sync remains 1:1 with BottomNav items
  - [x] 3.3 Audit tab order and keyboard navigation flow

- [x] **Task 4: Testing & Final Polish (AC: #7)**
  - [x] 4.1 Create/update `bottom-nav.test.tsx` verifying route/item sync
  - [x] 4.2 Validate focus states and touch target sizes (44px)
  - [x] 4.3 Run "Big 3" check: `npm run lint && npm run build && npm test`

## Dev Notes

### 🏗️ Architecture: PWA Mobile-First Navigation

The BottomNav is a critical PWA component. To achieve native-like quality, we focus on depth and spatial grounding.

**Critical Pattern: iOS Safe Area**

```css
nav {
  padding-bottom: env(safe-area-inset-bottom, 16px);
  /* Fallback to standard spacing if env not supported */
}
```

**FAB Pattern (Add Button):**
The button should be elevated above the nav bar's top border to signal it's a global action. Use a wrapper with `relative -top-4` or similar positioning.

### 📂 File Structure

- `src/components/layout/bottom-nav.tsx` (Primary)
- `src/router/routes.ts` (Reference for active paths)

### ⚠️ Critical Implementation Notes

1. **Spring-like Animations:** Avoid standard linear transitions. Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for active state scaling.
2. **Icon Fill:** If the icon doesn't support `fill`, increase `strokeWidth` to `2.5` for the active item.
3. **PWA Standalone Detection:** While CSS handles the safe area, ensure the background blur (`backdrop-blur`) remains consistent even when scrolling behind.

### 🧪 Testing Strategy

Mocks should ensure:

- URL `/settings` → `Ayarlar` tab has `aria-current="page"`.
- Click on `Dashboard` → URL changes to `/`.
- Center button click → Modal opens, URL does NOT change.

### 🔗 Dependencies

- **Depends On:** Story 8.1 (React Router Setup) ✅
- **Depends On:** Story 8.2 (Settings Page Layout) ✅

---

## Dev Agent Record

### Context Reference

- `docs/epics.md#Epic-8`
- `docs/ux-design-specification.md#PWA-Strategy`

### Agent Model Used

Antigravity (Gemini 2.5)

### Debug Log References

### Completion Notes List

- ✅ Implemented complete BottomNav with iOS safe-area support via `.safe-area-bottom` CSS class
- ✅ Added elevated FAB center button with circular shape, shadow-lg, and -top-4 positioning
- ✅ Active state includes: `text-primary`, `bg-primary/10`, `scale-105`, `strokeWidth={2.5}` on icon
- ✅ Added native active state handling via NavLink children/className callbacks
- ✅ Added focus-visible rings for all interactive elements (Accessibility)
- ✅ Implemented haptic feedback via `navigator.vibrate(10)` on navigation clicks
- ✅ Created `.transition-nav` class with spring-like cubic-bezier easing `(0.34, 1.56, 0.64, 1)`
- ✅ Added `prefers-reduced-motion` fallback for all transitions
- ✅ Comprehensive test suite with 24 tests covering all ACs and focus states
- ✅ All 591 tests pass, lint clean, build successful

---

## File List

| Action   | File Path                                   |
| -------- | ------------------------------------------- |
| Modified | `src/components/layout/bottom-nav.tsx`      |
| Created  | `src/components/layout/bottom-nav.test.tsx` |
| Modified | `src/index.css`                             |

---

## Change Log

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2025-12-24 | Story 8.3 created - Bottom Nav Route Integration                       |
| 2025-12-24 | Validated: Added iOS Safe Area, Elevated FAB, Haptics, and Icon shifts |
| 2025-12-24 | Implementation complete - all ACs satisfied, tests passing             |
| 2025-12-24 | Code Review fixes: strokeWidth prop, focus rings, NavLink patterns     |
