# Story 3.5: Category Breakdown Visualization

Status: done

## Story

As a **kullanıcı**,
I want **kategorilere göre harcama dağılımını görmek**,
so that **param nereye gittiğini anlayabileyim**.

## Acceptance Criteria

### AC1: Visual Breakdown Display

**Given** kullanıcının birden fazla kategoride abonelikleri var
**When** analytics bölümünü görüntüler
**Then** her kategori için yüzde ve tutar gösterilir
**And** CSS progress bar kullanılarak görselleştirilir (60fps transition)
**And** her kategori şunları içerir: isim, ikon, toplam tutar, yüzde
**And** rakamlar `tabular-nums` ile hizalı gösterilir
**And** kategoriler yüzde değerine göre sıralanır (en yüksek önce)

### AC2: Category Filtering Integration

**Given** kullanıcı breakdown'da bir kategoriye tıklar
**When** kategori seçilir
**Then** Dashboard state'i güncellenir ve SubscriptionList o kategoriye filtrelenir
**And** breakdown'da seçili kategori görsel olarak (highlight/border) belirtilir
**And** "Tümü" seçeneği veya tekrar tıklama filtreyi sıfırlar

### AC3: Single Category Handling

**Given** kullanıcının sadece 1 kategoride abonelikleri var
**When** dashboard render edilir
**Then** CategoryBreakdown bileşeni render edilmez (null döner)
**And** gereksiz görsel kalabalık önlenir

### AC4: Accessibility

**Given** breakdown görüntüleniyor
**When** kullanıcı screen reader kullanır
**Then** her kategori için aria-valuenow, aria-valuemin (0), aria-valuemax (100) sağlanır
**And** progress bar sadece renk değil, metin etiketleri (`%X`, `Y TL`) ile bilgi verir
**And** kategori öğeleri klavye (Tab/Enter) ile seçilebilir
**And** 44x44px minimum touch target korunur

### AC5: Multi-Currency Support

**Given** kullanıcının TRY ve USD abonelikleri karışık
**When** breakdown hesaplanır
**Then** para birimleri ayrı gruplanır (Group by Currency)
**And** her para birimi grubu kendi içinde %100'e tamamlanır

## Tasks / Subtasks

- [x] **Task 1: Category Calculation Utilities (AC: #1, #5)**

  - [x] 1.1 Create `src/lib/category-breakdown-utils.ts`
  - [x] 1.2 Implement `calculateCategoryBreakdown` with multi-currency support
  - [x] 1.3 Reuse `getUniqueCategoryIds` from `subscription-list-utils.ts`
  - [x] 1.4 Handle edge cases (0 amount, same percentage sorting)
  - [x] 1.5 Create `category-breakdown-utils.test.ts`

- [x] **Task 2: CategoryBreakdown Component (AC: #1, #3, #4)**

  - [x] 2.1 Implement `CategoryBreakdown` using atomic CSS for bars
  - [x] 2.2 Use `Icons[name as keyof typeof Icons]` pattern for reliable icon rendering
  - [x] 2.3 Apply `tabular-nums` to all currency and percentage displays
  - [x] 2.4 Implement `transition-all duration-300` for bar width changes
  - [x] 2.5 Ensure component returns `null` if categories.length <= 1

- [x] **Task 3: Dashboard Integration (AC: #2)**

  - [x] 3.1 Lift `selectedCategory` state to `src/App.tsx` or `Dashboard` layout
  - [x] 3.2 Update `SubscriptionList` to receive `categoryId` as prop and sync with its internal filter
  - [x] 3.3 Ensure bidirectional sync (List dropdown change updates Breakdown highlight)

- [x] **Task 4: Testing & Accessibility (AC: #4)**

  - [x] 4.1 Create `category-breakdown.test.tsx`
  - [x] 4.2 Mock `scrollIntoView` and `PointerEvent` for JSDOM
  - [x] 4.3 Verify ARIA attributes and keyboard selection
  - [x] 4.4 Test multi-currency rendering logic

## Dev Notes

### Architecture Compliance

- **Pattern:** Parent State Lifting (Dashboard → List & Breakdown)
- **Standard:** Use OKLCH colors from `subscription.color` property
- **Utility Reuse:** Extends `src/lib/subscription-list-utils.ts` logic

### Technical Implementation

#### Multi-Currency Schema

```typescript
export interface CategoryBreakdownItem {
  categoryId: string;
  total: number;
  currency: string;
  percentage: number;
}

// Grouped result for UI
export type BreakdownResult = Record<string, CategoryBreakdownItem[]>;
```

#### Icon Rendering Pattern (CRITICAL)

Replicate Story 3.4 pattern to avoid "missing icon" crashes:

```typescript
import * as Icons from "lucide-react";
const IconComponent =
  (Icons[iconName as keyof typeof Icons] as LucideIcon) || Icons.CreditCard;
```

#### Progress Bar Animation (Tailwind v4)

Use `transition-[width] duration-300 ease-in-out` on the internal bar div.

### Critical Implementation Warnings

#### ⚠️ PREVENT WHEEL REINVENTION

Do NOT create a new currency formatter. Use `formatCurrency` from `@/lib/formatters`.

#### ⚠️ ACCESSIBILITY (COLOR-ONLY)

Bar colors MUST NOT be the only way to distinguish categories. Labels and Icons are mandatory in AC1/AC4.

#### ⚠️ PERFORMANCE

Use `useMemo` for `calculateCategoryBreakdown` to prevent expensive recalculations on every keystroke in other parts of the dashboard.

### Previous Story Learnings (3.4)

- JSDOM requires `window.Element.prototype.hasPointerCapture` stub for Radix UI interactions during integration tests.
- Sorting should be aware of Turkish locale if category names are sorted alphabetically.

### Dependencies

- `@tanstack/react-virtual` (Already installed, used in List but not needed for Breakdown)
- `lucide-react` (Internal icons)

### References

- [Source: docs/epics.md#Story 3.5]
- [Source: src/lib/subscription-list-utils.ts] - Reuse category logic
- [Source: src/components/features/subscription/subscription-list.tsx] - Sync target
- [Source: src/lib/formatters.ts] - Currency handling

## Dev Agent Record

### Context Reference

- Story: docs/sprint-artifacts/3-5-category-breakdown-visualization.md

### Agent Model Used

Antigravity (Implementation Mode)

### Debug Log References

- Build: ✅ Successful (npm run build)
- Lint: ✅ 0 errors (1 expected TanStack Virtual warning)
- Tests: ✅ 333 passed (10 new CategoryBreakdown tests)

### Completion Notes

- ✅ Implemented `calculateCategoryBreakdown` with multi-currency support and percentage calculation (Corrected for sum=100)
- ✅ Created `CategoryBreakdown` component with CSS progress bars (no external chart library)
- ✅ Integrated with App.tsx using parent state lifting for bidirectional category sync
- ✅ Updated `SubscriptionList` to accept external category filter props (Fixed sync logic)
- ✅ Added comprehensive test suite (10 tests) covering ARIA, keyboard nav, multi-currency
- ✅ Component returns null for single category (AC3 compliant)
- ✅ Used `tabular-nums` for aligned numbers, `transition-[width]` for smooth animations

### File List

**Files Created:**

- `src/lib/category-breakdown-utils.ts`
- `src/lib/category-breakdown-utils.test.ts`
- `src/components/features/analytics/category-breakdown.tsx`
- `src/components/features/analytics/category-breakdown.test.tsx`

**Files Modified:**

- `package.json` - Added `@tanstack/react-virtual`
- `package-lock.json` - Updated dependencies
- `src/App.tsx` - Added CategoryBreakdown, lifted selectedCategory state
- `src/components/features/subscription/subscription-list.tsx` - Added external filter props interface
- `src/components/features/subscription/subscription-list.test.tsx` - Fixed lint errors (unused imports, types)

## Senior Developer Review (AI)

### Outcome: Blocked → Approve (Pending Verification)

**Date:** 2025-12-22
**Summary:** Implementation is functionally complete but required fixes for cross-component filter synchronization and floating-point rounding errors in analytics.

### Action Items

- [x] **[HIGH]** Fix filter sync bug where prop `null` falls back to internal state.
- [x] **[HIGH]** Fix percentage rounding error to ensure 100% total per currency.
- [x] **[MEDIUM]** Update File List to include `package.json` changes.
- [x] **[MEDIUM]** Add tie-breaker sorting to breakdown result items.
- [x] **[LOW]** Sort currency groups alphabetically for visual stability.
