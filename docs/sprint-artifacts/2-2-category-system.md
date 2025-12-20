# Story 2.2: Category System

Status: done

## Story

**As a** user,
**I want** to organize subscriptions into categories,
**So that** I can see my spending by type.

## Acceptance Criteria

1. **Given** the user creates a subscription
   **When** they select a category
   **Then** they can choose from predefined categories with Turkish labels:

   - `entertainment` → "Eğlence"
   - `productivity` → "İş"
   - `tools` → "Araçlar"
   - `education` → "Eğitim"
   - `health` → "Sağlık"
   - `other` → "Diğer"

2. **Given** any category ID
   **When** `getCategoryDetails(id)` is called
   **Then** it returns an object with:

   - `icon`: a `LucideIcon` component
   - `color`: OKLCH color string
   - `label`: Turkish display string

3. **Given** `other` is the default category
   **When** `getCategoryDetails(undefined)` or unknown ID is passed
   **Then** it returns the "Diğer" category metadata

4. **Given** the category badge component renders
   **When** passed a category ID
   **Then** it displays the icon and label with correct color styling
   **And** supports size variants: `sm`, `default`

5. **Given** the category select component renders
   **When** user opens dropdown
   **Then** all 6 categories are listed with icons and labels
   **And** selection updates the form state

## Tasks / Subtasks

- [x] 1. Create Category Metadata Configuration

  - [x] Create `src/config/categories.ts`
  - [x] Define `CategoryMetadata` interface extending existing `Category` type
  - [x] Export `CATEGORY_METADATA` constant with all 6 categories
  - [x] Implement `categories.get(id)` helper with "other" fallback
  - [x] Implement `categories.all()` for listing
  - [x] Implement `categories.options()` for Select component

- [x] 2. Create CategoryBadge Component

  - [x] Create `src/components/ui/category-badge.tsx`
  - [x] Use `forwardRef` pattern (shadcn consistency)
  - [x] Support `size` prop: `sm` (14px icon) | `default` (16px icon)
  - [x] Apply OKLCH color from metadata as background/text

- [x] 3. Create CategoryIcon Component

  - [x] Create `src/components/ui/category-icon.tsx`
  - [x] Render dynamic LucideIcon based on category
  - [x] Support `size` and `className` props

- [x] 4. Create CategorySelect Component

  - [x] Create `src/components/forms/category-select.tsx`
  - [x] Wrap shadcn Select (`@/components/ui/select`)
  - [x] List all categories with icons using `categories.options()`
  - [x] Controlled component with `value` and `onValueChange` props

- [x] 5. Unit Tests
  - [x] Create `src/config/categories.test.ts` (16 tests)
    - [x] Test: `should return correct metadata for each category`
    - [x] Test: `should fallback to "other" for unknown ID`
    - [x] Test: `should list all 6 categories`
  - [x] Create `src/components/ui/category-badge.test.tsx` (9 tests)
    - [x] Test: `should render icon and label`
    - [x] Test: `should apply size variant`
  - [x] Create `src/components/forms/category-select.test.tsx` (9 tests, 2 skipped)
    - [x] Test: `should display selected value` (all 6 categories)
    - [x] Test: Interaction tests skipped (jsdom Radix limitation)

## Dev Notes

### Technical Requirements

**Category Metadata Schema:**

```typescript
// src/config/categories.ts
import { Category } from "@/types/common";
import {
  Tv,
  Briefcase,
  Wrench,
  GraduationCap,
  HeartPulse,
  Archive,
  type LucideIcon,
} from "lucide-react";

export interface CategoryMetadata {
  id: Category;
  label: string;
  icon: LucideIcon;
  color: string; // OKLCH value
  colorClass: string; // Tailwind class for backgrounds
}

export const CATEGORY_METADATA: Record<Category, CategoryMetadata> = {
  entertainment: {
    id: "entertainment",
    label: "Eğlence",
    icon: Tv,
    color: "oklch(0.75 0.15 320)",
    colorClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  productivity: {
    id: "productivity",
    label: "İş",
    icon: Briefcase,
    color: "oklch(0.65 0.15 260)",
    colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  tools: {
    id: "tools",
    label: "Araçlar",
    icon: Wrench,
    color: "oklch(0.7 0.12 180)",
    colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  education: {
    id: "education",
    label: "Eğitim",
    icon: GraduationCap,
    color: "oklch(0.75 0.15 85)",
    colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  health: {
    id: "health",
    label: "Sağlık",
    icon: HeartPulse,
    color: "oklch(0.7 0.15 165)",
    colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  other: {
    id: "other",
    label: "Diğer",
    icon: Archive,
    color: "oklch(0.6 0.05 250)",
    colorClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

// Helper object with methods
export const categories = {
  get: (id?: Category | string): CategoryMetadata =>
    CATEGORY_METADATA[id as Category] ?? CATEGORY_METADATA.other,
  all: (): CategoryMetadata[] => Object.values(CATEGORY_METADATA),
  options: () =>
    Object.entries(CATEGORY_METADATA).map(([id, meta]) => ({
      value: id,
      label: meta.label,
      icon: meta.icon,
    })),
};
```

**CategoryBadge Pattern:**

```typescript
// src/components/ui/category-badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { categories } from "@/config/categories";
import type { Category } from "@/types/common";

interface CategoryBadgeProps {
  categoryId?: Category;
  size?: "sm" | "default";
  className?: string;
}

export const CategoryBadge = React.forwardRef<
  HTMLSpanElement,
  CategoryBadgeProps
>(({ categoryId, size = "default", className }, ref) => {
  const category = categories.get(categoryId);
  const Icon = category.icon;
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        category.colorClass,
        className
      )}
    >
      <Icon size={iconSize} />
      {category.label}
    </span>
  );
});
CategoryBadge.displayName = "CategoryBadge";
```

**CategorySelect Pattern:**

```typescript
// src/components/forms/category-select.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/config/categories";
import type { Category } from "@/types/common";

interface CategorySelectProps {
  value?: Category;
  onValueChange: (value: Category) => void;
  placeholder?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = "Kategori seç...",
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.options().map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <option.icon size={16} />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Architecture Compliance

**File Locations (creates new `/config` folder):**

- Config: `src/config/categories.ts`
- Config Test: `src/config/categories.test.ts`
- Badge: `src/components/ui/category-badge.tsx`
- Badge Test: `src/components/ui/category-badge.test.tsx`
- Select: `src/components/forms/category-select.tsx`
- Select Test: `src/components/forms/category-select.test.tsx`

**Type Safety:**

- Strictly type keys using `Category` type from `src/types/common.ts`
- Use `satisfies Record<Category, CategoryMetadata>` for exhaustiveness check

**Existing Types (DO NOT MODIFY):**

```typescript
// src/types/common.ts - Already exists
export const CategorySchema = z.enum([
  "entertainment",
  "productivity",
  "tools",
  "education",
  "health",
  "other",
]);
export type Category = z.infer<typeof CategorySchema>;
```

### Previous Story Patterns to Follow

From Story 2.1 (Subscription Zustand Slice):

- Use Vitest with `describe`/`it` blocks
- Test naming: `should ...` pattern
- Use `beforeEach` to reset state between tests
- Use strict TypeScript (no `any`)

### Testing Approach

```typescript
// src/config/categories.test.ts
import { describe, it, expect } from "vitest";
import { categories, CATEGORY_METADATA } from "./categories";

describe("categories", () => {
  describe("get", () => {
    it("should return correct metadata for each category", () => {
      const result = categories.get("entertainment");
      expect(result.label).toBe("Eğlence");
      expect(result.icon).toBeDefined();
    });

    it("should fallback to other for unknown ID", () => {
      const result = categories.get("invalid" as any);
      expect(result.id).toBe("other");
      expect(result.label).toBe("Diğer");
    });

    it("should fallback to other for undefined", () => {
      const result = categories.get(undefined);
      expect(result.id).toBe("other");
    });
  });

  describe("all", () => {
    it("should return all 6 categories", () => {
      expect(categories.all()).toHaveLength(6);
    });
  });

  describe("options", () => {
    it("should return value/label pairs for Select", () => {
      const options = categories.options();
      expect(options[0]).toHaveProperty("value");
      expect(options[0]).toHaveProperty("label");
    });
  });
});
```

### References

- `docs/epics.md` - Story 2.2 (line 602-616)
- `docs/architecture.md` - Naming Patterns (line 670-708)
- `docs/ux-design-specification.md` - Component Strategy (line 1030-1180)
- `src/types/common.ts` - Existing CategorySchema
- `src/types/subscription.ts` - categoryId usage

## Dev Agent Record

### Context Reference

- `src/types/common.ts` (Base ENUM - DO NOT MODIFY)
- `src/types/subscription.ts` (categoryId field)
- `src/components/ui/select.tsx` (shadcn Select to wrap)
- `src/components/ui/badge.tsx` (styling reference)

### Agent Model Used

Antigravity (Google DeepMind) + Quality Competition Review

### Completion Notes List

- [x] `src/config/` folder created
- [x] Category metadata with Turkish labels defined
- [x] CategoryBadge with size variants implemented
- [x] CategoryIcon standalone component added
- [x] CategorySelect using shadcn Select implemented
- [x] All tests passing (config + components)
- [x] Dark mode colors verified via colorClass

### Validation Summary

```
✅ npm run lint: 0 errors
✅ npm run build: SUCCESS
✅ npm run test: 148 passed | 5 skipped (153 total)
```

### File List

**New Files:**

- `src/config/categories.ts` (Category metadata + helpers)
- `src/config/categories.test.ts` (16 tests)
- `src/components/ui/category-badge.tsx` (Badge component)
- `src/components/ui/category-badge.test.tsx` (9 tests)
- `src/components/ui/category-icon.tsx` (Icon component)
- `src/components/ui/category-icon.test.tsx` (9 tests) - **Added in code review**
- `src/components/forms/category-select.tsx` (Select wrapper + accessibility fix)
- `src/components/forms/category-select.test.tsx` (9 tests, 2 skipped)

**Modified Files (Code Review Fixes):**

- `src/components/forms/category-select.tsx` - aria-label eklendi (accessibility)
- `src/components/features/subscription/subscription-dialogs.test.tsx` - act() warning fix

## Change Log

- 2025-12-18: Story created - ready-for-dev
- 2025-12-18: Implementation complete - all tasks done, 34 new tests
- 2025-12-18: Status → review (awaiting code review)
- 2025-12-20: Code Review completed - fixed 4 issues:
  - H1: Added missing CategoryIcon unit tests (9 tests)
  - M1: Fixed React act() warning in DeletionCelebration test
  - L2: Added aria-label to CategorySelect for accessibility
  - Status → done
