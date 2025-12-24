# Story 8.4: Settings - Theme Section

Status: done

## Story

As a **user**,
I want **a dedicated Theme settings section with expanded controls and real-time preview**,
so that **I can fine-tune the app's visual appearance to my preferences with a clear, intuitive interface**.

## Background

Story 8.2 implemented the basic Settings page with a minimal Görünüm (Theme) section containing only the existing `ThemeToggle` dropdown. This story enhances the Theme section to provide:

- Clearer visual distinction between theme options
- Real-time preview feedback
- Enhanced accessibility for theme selection
- Consistent design language with other expanded settings sections

## Acceptance Criteria

### AC1: Enhanced Theme Selection UI (Segmented Control)

- **Given** the user navigates to the Görünüm section in Settings
- **When** they view the theme options
- **Then** theme selection displays as a **Segmented Control** (using `Tabs` component) instead of a dropdown
- **And** it contains 3 distinct options: **Açık**, **Koyu**, **Sistem**
- **And** the active choice uses the primary brand color (`text-primary`, `bg-background` for the trigger)
- **And** the control is full-width on mobile to maximize touch target size
- **And** each option includes its respective icon (`Sun`, `Moon`, `Laptop`)

### AC2: Real-Time Preview & Accessibility

- **Given** the user selects a new theme
- **When** the store state updates
- **Then** the visual theme changes immediately with a smooth `200ms` color transition
- **And** the control uses `aria-label="Tema seçimi"` for the Tabs group
- **And** keyboard navigation (Arrow keys) works natively via the `Tabs` implementation
- **And** focus rings follow the `focus-visible:ring-2 focus-visible:ring-primary` pattern

### AC3: Dynamic System Indicator

- **Given** the user has "Sistem" selected
- **When** the page renders or the system preference changes
- **Then** a localized helper text appears below the selector: **"Şu anki sistem tercihi: [Açık/Koyu]"**
- **And** this text is hidden if "Açık" or "Koyu" is explicitly selected
- **And** the detection logic uses a `useMediaQuery` hook with real-time listeners

### AC4: Regression & Consistency

- **Given** the new `ThemeSelector` is integrated into SettingsPage
- **When** the developer verifies the app
- **Then** the Header's `ThemeToggle` (dropdown) MUST remain functional and synchronized with the new Settings selector
- **And** no duplicate IDs are introduced in the DOM
- **And** the `ThemeSelector` respects `prefers-reduced-motion` for all transitions

### AC5: Testing & Quality

- **Given** the new implementation
- **When** the test suite executes
- **Then** `npm run lint && npm run build && npm test -- --run` passes
- **And** new tests verify:
  - Theme change updates `useSettingsStore`
  - System indicator correctly detects current mode
  - `Tabs` triggers have correct accessibility roles
  - Synchronicity between Settings and Header components

## Tasks / Subtasks

- [x] **Task 1: ThemeSelector Implementation (AC: #1, #2, #4)**

  - [x] 1.1 Create `src/components/features/settings/theme-selector.tsx` using `Tabs` from `@/components/ui/tabs`
  - [x] 1.2 Map `useSettingsStore` theme state to `Tabs` value
  - [x] 1.3 Implement the 3-option layout with icons and labels
  - [x] 1.4 Apply premium styling for active/inactive states
  - [x] 1.5 Verify touch targets are >= 44x44px

- [x] **Task 2: System Preference Hook & Display (AC: #3)**

  - [x] 2.1 Implement/Ensure `useMediaQuery` hook is available
  - [x] 2.2 Add detection logic for `(prefers-color-scheme: dark)`
  - [x] 2.3 Implement conditional rendering for the helper text indicator

- [x] **Task 3: Page Integration (AC: #1, #4)**

  - [x] 3.1 Swap `ThemeToggle` for `ThemeSelector` in `src/pages/settings-page.tsx`
  - [x] 3.2 Update section description and layout for better vertical rhythm
  - [x] 3.3 Verify Header synchronization

- [x] **Task 4: Testing & Validation (AC: #5)**
  - [x] 4.1 Create `src/components/features/settings/theme-selector.test.tsx`
  - [x] 4.2 Mock `window.matchMedia` to test system indicator
  - [x] 4.3 Add integration test for store updates
  - [x] 4.4 Run full regression suite

## Dev Notes

### 🏗️ Architecture: Component Structure

This builds on the existing theme infrastructure:

```
src/
├── components/
│   ├── features/
│   │   └── settings/
│   │       ├── theme-selector.tsx    ← NEW (Primary)
│   │       ├── theme-selector.test.tsx ← NEW
│   │       ├── settings-section.tsx   (Existing - wrapper)
│   │       └── index.ts               (Update exports)
│   └── ui/
│       └── theme-toggle.tsx           (Existing - can remain for header use)
├── stores/
│   └── settings-store.ts              (Existing - NO CHANGES)
└── pages/
    └── settings-page.tsx              (Modify - swap component)
```

### ⚙️ Existing Theme Infrastructure (DO NOT MODIFY)

**settings-store.ts:**

```typescript
// Theme state and action - already implemented, version 4
theme: "system" | "light" | "dark"
setTheme: (theme: Theme) => void
```

**Theme Types (`src/types/settings.ts`):**

```typescript
export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;
```

### 📐 Design Tokens

Use existing OKLCH color system from `index.css`:

- `--color-primary: oklch(0.75 0.12 180)` - Soft Teal (active state)
- Active card: `bg-primary/10 ring-2 ring-primary`
- Inactive card: `bg-muted/50 hover:bg-muted`

### 🏗️ Architecture: Segmented Control Pattern

We use `Tabs` from `shadcn/ui` because it provides the best out-of-the-box accessibility (WAI-ARIA Tabs pattern) for what is essentially a radio-group styled as a segmented control.

```tsx
<Tabs value={theme} onValueChange={(v) => setTheme(v as Theme)}>
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="light">...</TabsTrigger>
    <TabsTrigger value="dark">...</TabsTrigger>
    <TabsTrigger value="system">...</TabsTrigger>
  </TabsList>
</Tabs>
```

### 🪝 useMediaQuery Hook

If not already present, use this pattern:

```typescript
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

### ⚠️ Critical Implementation Notes

1. **No Store Changes:** Theme persistence works via existing `settings-store.ts` version 4. Do NOT bump version or add migrations.

2. **ThemeToggle Preservation:** Keep `theme-toggle.tsx` in `src/components/ui/` for potential header usage or other contexts. Don't delete it.

3. **Transition Handling:** The root `<html>` element already has theme class toggling (from Story 1.3). Ensure CSS transitions apply at the body level with `prefers-reduced-motion` respected.

4. **Focus Management:** When implementing radiogroup, ensure Arrow keys cycle between options for keyboard users.

5. **Test Mocking:** Mock `window.matchMedia` in tests for system preference detection.

### 🧪 Mocking matchMedia (Vitest)

```typescript
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### 📊 Previous Story Learnings (8.2, 8.3)

- SettingsSection wrapper provides icon, title, description, and accessibility (aria-labelledby)
- Theme changes must not cause page reload - instantaneous
- iOS safe area not relevant for this component (mid-page)
- localized UI labels already established (Turkish)

### 🔗 Dependencies

- **Depends On:** Story 8.2 (Settings Page Layout) ✅ DONE
- **Depends On:** Story 1.3 (Theme System Implementation) ✅ DONE
- **Blocked By:** None
- **Blocks:** None (independent enhancement)

---

## Dev Agent Record

### Context Reference

- `docs/epics.md#Epic-8`
- `docs/ux-design-specification.md#Design-System-Foundation`
- `src/stores/settings-store.ts` - Theme state management
- `src/components/ui/theme-toggle.tsx` - Previous implementation reference

### Agent Model Used

Anthropic Claude (Antigravity)

### Debug Log References

No blocking issues encountered.

### Completion Notes List

- **Task 1:** Created `ThemeSelector` component using Radix `Tabs` for accessible segmented control. Implemented 3-option layout (Açık, Koyu, Sistem) with Lucide icons, premium styling, and ensured 44px min touch targets. Applied `focus-visible:ring-2` and `duration-200` as per AC2.
- **Task 2:** Created generic `useMediaQuery` hook. Implemented system preference detection. Added conditional helper text using centralized i18n (`SETTINGS_STRINGS`).
- **Task 3:** Swapped `ThemeToggle` for `ThemeSelector` in SettingsPage. Centralized all settings strings in `src/lib/i18n/settings.ts`. Updated section layout with improved vertical rhythm.
- **Task 4:** Created comprehensive test suite covering rendering, theme changes, and store synchronization. Verified accessibility (ARIA roles, keyboard nav, focus rings). All tests pass.

### File List

| Action   | File Path                                                  |
| -------- | ---------------------------------------------------------- |
| Created  | `src/components/features/settings/theme-selector.tsx`      |
| Created  | `src/components/features/settings/theme-selector.test.tsx` |
| Created  | `src/hooks/use-media-query.ts`                             |
| Created  | `src/lib/i18n/settings.ts`                                 |
| Modified | `src/components/features/settings/index.ts`                |
| Modified | `src/pages/settings-page.tsx`                              |
| Modified | `src/pages/settings-page.test.tsx`                         |
| Modified | `src/index.css`                                            |

---

## Change Log

| Date       | Change                                                              |
| ---------- | ------------------------------------------------------------------- |
| 2025-12-24 | Story drafted - Settings Theme Section expansion                    |
| 2025-12-24 | Implementation complete - All tasks done, 604 tests pass            |
| 2025-12-24 | Code Review Fixes - Applied i18n, fixed focus rings and transitions |
