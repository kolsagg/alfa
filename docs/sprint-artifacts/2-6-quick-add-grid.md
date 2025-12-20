# Story 2.6: Quick-Add Grid

Status: Ready for Review

## Story

**As a** user,
**I want** to quickly add popular subscriptions,
**So that** I don't have to type common services.

## Acceptance Criteria

1. **Given** user is on the add subscription screen
   **When** they see the Quick-Add Grid
   **Then** popular services are shown: Netflix, Spotify, iCloud, Adobe Creative Cloud, ChatGPT Plus, GitHub Pro, YouTube Premium, Amazon Prime
   **And** each service displays with recognizable branding (name + icon).

2. **Given** any Quick-Add service tile
   **When** rendered
   **Then** it has minimum 44x44px touch target
   **And** uses OKLCH color from category metadata.

3. **Given** user taps a Quick-Add service tile
   **When** the action is triggered
   **Then** the `SubscriptionForm` opens with pre-filled values:

   - `name`: Service name
   - `categoryId`: Suggested category
   - `icon`: Service icon name (optional, from POPULAR_ICONS)
   - `color`: Category color (optional)
     **And** user only needs to fill: `amount`, `currency`, `nextPaymentDate`

4. **Given** the Quick-Add Grid
   **When** viewed on mobile (< 640px)
   **Then** grid displays 2 columns
   **When** viewed on tablet (640-1024px)
   **Then** grid displays 3 columns
   **When** viewed on desktop (> 1024px)
   **Then** grid displays 4 columns.

5. **Given** the Quick-Add Grid is rendered
   **When** keyboard navigation is used
   **Then** each tile is focusable via Tab
   **And** Enter/Space activates the tile.

## Tasks / Subtasks

- [x] 1. Create Quick-Add Service Config (AC: 1, 3)

  - [x] Update `src/types/subscription.ts` (or create `src/types/quick-add.ts` if preferred) to include:
        `export interface QuickAddService { id: string; name: string; iconName: string; Icon: LucideIcon; categoryId: Category; color?: string; }`
  - [x] Create `src/config/quick-add-services.ts`
  - [x] Export `QUICK_ADD_SERVICES` array with 8 services. Each entry MUST have both:
    - `iconName`: string (e.g. "Tv") for the form storage
    - `Icon`: component reference (e.g. `Tv`) for grid rendering
  - [x] Use `lucide-react` icons available in codebase (matches POPULAR_ICONS)

- [x] 2. Create QuickAddGrid Component (AC: 1, 2, 4, 5)

  - [x] Create `src/components/features/quick-add/quick-add-grid.tsx`
  - [x] Create `src/components/features/quick-add/index.ts` for clean exports
  - [x] Implement responsive grid:
    - `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
  - [x] Each tile renders as shadcn `Button` variant="outline" with:
    - `Icon` component (from service definition)
    - Service name
    - min-h-[44px] for touch target
    - Category color as subtle background hover
  - [x] `onSelect(service: QuickAddService)` callback prop
  - [x] Implement keyboard accessibility (Enter/Space to select)

- [x] 3. Create QuickAddTile Component (AC: 2, 5)

  - [x] Create `src/components/features/quick-add/quick-add-tile.tsx`
  - [x] Uses shadcn Button as base
  - [x] Displays icon + name
  - [x] Uses category color for hover/active states
  - [x] Ensures 44x44px minimum touch target
  - [x] ARIA: role="button", accessible name

- [x] 4. Integrate QuickAddGrid with AddSubscriptionDialog (AC: 3)

  - [x] Modify `src/components/features/subscription/add-subscription-dialog.tsx`
  - [x] Add state: `prefilledService: QuickAddService | null`
  - [x] When dialog opens, show QuickAddGrid first
  - [x] When tile selected, pass pre-filled values to SubscriptionForm:
    ```tsx
    initialValues={{
      name: service.name,
      categoryId: service.categoryId,
      icon: service.iconName, // Pass string string to form
      color: categories.get(service.categoryId).color
    }}
    ```
  - [x] Optionally: Add "Custom" button to open empty form
  - [x] Add "Back" button to return to Quick-Add Grid from form

- [x] 5. Write Unit Tests (AC: All)
  - [x] Create `src/components/features/quick-add/quick-add-grid.test.tsx`
  - [x] Create `src/components/features/quick-add/quick-add-tile.test.tsx`
  - [x] Test: All 8 services render correctly
  - [x] Test: onSelect callback fires with correct service data
  - [x] Test: Keyboard navigation (Tab, Enter, Space)
  - [x] Test: Touch target dimensions (44x44px)
  - [x] Test: Responsive grid classes applied
  - [x] Note: subscription-dialogs.test.tsx already passes with Quick-Add integration (21 tests)

## Dev Notes

### Existing Code to Reuse (DO NOT REINVENT)

| What                  | Where                                                              | Usage                                 |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| Category metadata     | `src/config/categories.ts`                                         | Get color, icon, label for category   |
| CategoryBadge         | `src/components/ui/category-badge.tsx`                             | Visual category indicator if needed   |
| CategoryIcon          | `src/components/ui/category-icon.tsx`                              | Render category icons                 |
| SubscriptionForm      | `src/components/features/subscription/subscription-form.tsx`       | Already supports `initialValues` prop |
| AddSubscriptionDialog | `src/components/features/subscription/add-subscription-dialog.tsx` | Base dialog to modify                 |
| Button                | `src/components/ui/button.tsx`                                     | shadcn Button for tiles               |
| POPULAR_ICONS         | `subscription-form.tsx` lines 56-67                                | Available icon names                  |

### File Structure

```
src/
├── config/
│   └── quick-add-services.ts      # NEW: Service definitions
├── components/
│   └── features/
│       └── quick-add/
│           ├── quick-add-grid.tsx      # NEW: Grid component
│           ├── quick-add-grid.test.tsx # NEW: Grid tests
│           ├── quick-add-tile.tsx      # NEW: Tile component
│           ├── quick-add-tile.test.tsx # NEW: Tile tests
│           └── index.ts                # NEW: Exports
```

### Styling Patterns

```css
/* Responsive grid - mobile first */
.quick-add-grid {
  @apply grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4;
}

/* Tile - 44px minimum touch target */
.quick-add-tile {
  @apply min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 p-3;
  @apply border rounded-lg transition-colors;
  @apply hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary;
}
```

### Icon Mapping Strategy

Use lucide-react icons directly. Available icons in codebase:

- `Tv` (Netflix, YouTube)
- `Music` (Spotify)
- `Cloud` (iCloud)
- `Briefcase` (Adobe)
- `Bot` or `Sparkles` (ChatGPT)
- `Github` (GitHub)
- `ShoppingCart` (Amazon)

Import pattern:

```tsx
import {
  Tv,
  Music,
  Cloud,
  Briefcase,
  Bot,
  Github,
  ShoppingCart,
  Youtube,
} from "lucide-react";
```

### Pre-fill Flow

```tsx
// In AddSubscriptionDialog
const [selectedService, setSelectedService] = useState<QuickAddService | null>(
  null
);

// When Quick-Add tile clicked
const handleServiceSelect = (service: QuickAddService) => {
  setSelectedService(service);
};

// Pass to form
<SubscriptionForm
  initialValues={{
    name: selectedService.name,
    categoryId: selectedService.categoryId,
    icon: selectedService.icon,
    color: categories.get(selectedService.categoryId).color,
  }}
  mode="add"
  onSuccess={handleSuccess}
  onCancel={() => setSelectedService(null)} // back to grid
/>;
```

### Testing Patterns (From Previous Stories)

```tsx
// Touch target test
it("has minimum 44px touch target", () => {
  render(<QuickAddTile service={mockService} onSelect={vi.fn()} />);
  const tile = screen.getByRole("button");
  const styles = window.getComputedStyle(tile);
  expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
});

// Keyboard navigation test
it("activates on Enter key", async () => {
  const onSelect = vi.fn();
  render(<QuickAddTile service={mockService} onSelect={onSelect} />);
  const tile = screen.getByRole("button");
  tile.focus();
  await userEvent.keyboard("{Enter}");
  expect(onSelect).toHaveBeenCalledWith(mockService);
});
```

### Anti-Patterns to Avoid

❌ DO NOT:

- Create new category types - use existing `Category` from `@/types/common`
- Reinvent icon rendering - use lucide-react directly
- Hardcode colors - use `categories.get(categoryId).color`
- Skip touch target validation - 44x44px is WCAG requirement
- Create separate dialog - modify existing `AddSubscriptionDialog`

✅ DO:

- Reuse `categories` helper from `@/config/categories`
- Follow existing SubscriptionForm patterns
- Use shadcn Button component for tiles
- Maintain co-located test files
- Use Turkish labels where visible to user

### UX Notes

- Quick-Add Grid is first view when dialog opens
- "Custom" or "Diğer" button to skip to empty form
- Tiles should feel tappable with subtle hover/active states
- Selection should immediately show form, not require confirmation
- "Back" or "Geri" button to return to grid from form

## Dev Agent Record

### Context Reference

- `docs/epics.md` (Story 2.6)
- `docs/architecture.md` (Component patterns, naming conventions)
- `docs/ux-design-specification.md` (Quick-Add Grid visual design)
- Previous story: `2-5-period-selection-and-next-payment-calculation.md`

### Agent Model Used

Gemini (Antigravity)

### Debug Log References

- No blocking issues encountered

### Completion Notes List

- Story context created with exhaustive artifact analysis
- Reuse patterns from existing SubscriptionForm and category system
- Touch target and accessibility requirements emphasized
- Pre-fill pattern aligned with existing `initialValues` implementation
- ✅ Created `QuickAddService` interface in `quick-add-services.ts` (not in subscription.ts to keep concerns separated)
- ✅ Implemented 8 popular services: Netflix, Spotify, iCloud, Adobe CC, ChatGPT Plus, GitHub Pro, YouTube Premium, Amazon Prime
- ✅ QuickAddTile uses shadcn Button with 44x44px minimum touch target
- ✅ QuickAddGrid uses responsive grid (2/3/4 columns)
- ✅ AddSubscriptionDialog now shows Quick-Add Grid first, then transitions to form with pre-filled values
- ✅ All 16 new tests pass (7 for QuickAddTile, 9 for QuickAddGrid)
- ✅ Total 159 tests passing, lint clean, build successful

### Change Log

- 2025-12-20: Story implementation completed - Quick-Add Grid feature fully functional

### File List

- `docs/sprint-artifacts/2-6-quick-add-grid.md` (this file - updated)
- `src/config/quick-add-services.ts` (created)
- `src/components/features/quick-add/quick-add-grid.tsx` (created)
- `src/components/features/quick-add/quick-add-grid.test.tsx` (created)
- `src/components/features/quick-add/quick-add-tile.tsx` (created)
- `src/components/features/quick-add/quick-add-tile.test.tsx` (created)
- `src/components/features/quick-add/index.ts` (created)
- `src/components/features/subscription/add-subscription-dialog.tsx` (modified)
- `src/components/forms/category-select.tsx` (modified)
- `src/components/features/subscription/subscription-dialogs.test.tsx` (modified)
