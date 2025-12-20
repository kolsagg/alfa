# Story 2.7: Color/Icon Picker

Status: done

## Story

**As a** user,
**I want** to customize subscription appearance using a modular picker,
**So that** I can visually distinguish my subscriptions while maintaining design system consistency.

## Acceptance Criteria

1.  **Given** user is editing/adding subscription details
    **When** they open the color picker
    **Then** 8 preset colors are shown using **design system CSS variables** (`var(--color-*)`)
    **And** each color button has a descriptive `aria-label` for screen readers.

2.  **Given** the subscription form is open
    **When** the picker components are rendered
    **Then** they MUST be implemented as **modular standalone components** (`ColorPicker`, `IconPicker`) in `src/components/features/subscription/`.

3.  **Given** user selects a category
    **When** color/icon have not been manually set
    **Then** system auto-assigns values using `categories.get(category)` metadata
    **And** selected values are immediately previewed in the modular components.

4.  **Given** user manually interacts with pickers
    **When** they later change the category
    **Then** manual selections are preserved (not overwritten).

5.  **Given** a mobile/touch user
    **When** interacting with picker options
    **Then** every button/choice has a **minimum 44x44px touch target**.

## Tasks / Subtasks

- [x] **Task 1: Modular Component Extraction**
  - [x] Extract `ColorPicker` into `src/components/features/subscription/color-picker.tsx`
  - [x] Extract `IconPicker` into `src/components/features/subscription/icon-picker.tsx`
  - [x] Refactor `SubscriptionForm.tsx` to use these components
  - [x] Ensure `manuallySetColor`/`manuallySetIcon` state is preserved in the form
- [x] **Task 2: Design System Integration (CSS Variables)**
  - [x] Map preset colors to `--color-primary`, `--color-secondary`, etc. in `ColorPicker`
  - [x] Update `CATEGORY_METADATA` to use these CSS variables instead of hardcoded OKLCH
  - [x] Ensure `SubscriptionForm` correctly handles these variable values when auto-assigning
- [x] **Task 3: Accessibility & UX Polish**
  - [x] Add named `aria-label` to color swatches (Mercan, Turkuaz, etc.)
  - [x] Use `h-11 min-h-[44px]` for all interactive touch targets
  - [x] Add `SelectItem` min-height for icon options
- [x] **Task 4: Unit Testing**
  - [x] Build `color-picker.test.tsx` (all passing)
  - [x] Build `icon-picker.test.tsx` (all passing)
  - [x] Verify integration in `subscription-form.test.tsx` (manual override preservation)
  - [x] Fix JSDOM/Radix related test failures in dialog tests

## Dev Notes

### Architecture Requirement: Modularity

`SubscriptionForm` has reached a complexity limit. You MUST extract picker logic into separate files.

**New Path:** `src/components/features/subscription/`

- `color-picker.tsx`
- `icon-picker.tsx`

### Technical Specification: Theme Variables

Do NOT use hardcoded colors. Use the Oklch variables defined in `index.css`:

```typescript
// Use this pattern in ColorPicker
const PRESET_COLORS = [
  { name: "Primary", label: "Turkuaz", value: "var(--color-primary)" },
  { name: "Secondary", label: "İndigo", value: "var(--color-secondary)" },
  { name: "Attention", label: "Sarı", value: "var(--color-attention)" },
  { name: "Urgent", label: "Mercan", value: "var(--color-urgent)" },
  { name: "Critical", label: "Koyu Mercan", value: "var(--color-critical)" },
  { name: "Success", label: "Yeşil", value: "var(--color-success)" },
  { name: "Subtle", label: "Açık Mavi", value: "var(--color-subtle)" },
  { name: "Muted", label: "Gri", value: "var(--color-muted)" },
];
```

### Reference: Auto-Assignment Guard

Maintain the `manuallySetColor` and `manuallySetIcon` state checks in the primary form component to prevent accidental category overrides.

## Dev Agent Record

### Context Reference

- `docs/ux-design-specification.md` (Zen Dashboard palette)
- `docs/architecture.md` (Modular components, OKLCH system)
- `src/components/features/subscription/subscription-form.tsx` (Current monolithic implementation)

### Agent Model Used

Gemini (Antigravity) - Validation Mode

### Change Log

- 2025-12-20: Validated and improved story. Fixed hardcoded colors, added modularity requirement, and enhanced accessibility criteria.
- 2025-12-20: Implemented components, fixed tests, and integrated design system.
- 2025-12-20: AI Code Review: Fixed redundant state reset, added missing React imports, improved test coverage for IconPicker, and synced categories.test.ts documentation.

### Completion Notes

- Extracted `ColorPicker` and `IconPicker` into modular components.
- Refactored `SubscriptionForm` to use the new components while maintaining manual override state.
- Updated `CATEGORY_METADATA` and `ColorPicker` presets to use `var(--color-*)` variables.
- Implemented exact regex matching in tests for Turkish labels (e.g., `^Mercan$`) to avoid "Multiple elements found" errors.
- Mocked `CategorySelect` and other form helpers in integration tests to bypass JSDOM/Radix UI pointer capture and portal issues.
- Enforced 44x44px targets on `SelectTrigger`, `SelectItem`, and `button` elements.
- Verified that choosing a category auto-populates color/icon ONLY if they haven't been manually set.

### File List

- `docs/sprint-artifacts/2-7-color-icon-picker.md`
- `src/components/features/subscription/color-picker.tsx` (new)
- `src/components/features/subscription/color-picker-constants.ts` (new)
- `src/components/features/subscription/icon-picker.tsx` (new)
- `src/components/features/subscription/icon-picker-constants.ts` (new)
- `src/components/features/subscription/color-picker.test.tsx` (new)
- `src/components/features/subscription/icon-picker.test.tsx` (new)
- `src/components/features/subscription/subscription-form.tsx` (modified)
- `src/components/features/subscription/subscription-form.test.tsx` (modified)
- `src/components/features/subscription/subscription-dialogs.test.tsx` (modified mocks)
- `src/config/categories.ts` (modified: color variables)
- `src/config/categories.test.ts` (modified: sync with CSS variables)
- `src/components/forms/category-select.tsx` (modified: accessibility)
