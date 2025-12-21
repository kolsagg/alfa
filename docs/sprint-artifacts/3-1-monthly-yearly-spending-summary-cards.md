# Story 3.1: Monthly/Yearly Spending Summary Cards

Status: done

## Story

As a **kullanıcı**,
I want **toplam aylık ve yıllık abonelik harcamamı dashboard'da görmek (para birimi çevrimi dahil)**,
so that **tekrar eden maliyetlerimi gerçek TRY değeri üzerinden bir bakışta anlayabileyim**.

## Acceptance Criteria

### AC1: Summary Cards Display

**Given** kullanıcının abonelikleri var
**When** dashboard'u görüntüler
**Then** iki summary card görüntülenir:

- Toplam Aylık harcama kartı
- Toplam Yıllık (tahmini) harcama kartı
  **And** kartlar hero numbers stilinde görüntülenir (48px, bold, tabular-nums)
  **And** kartlar responsive grid içinde yerleşir (mobile: stacked, desktop: side-by-side)
  **And** veriler yüklenirken Skeleton state görüntülenir

### AC2: Currency Handling & Conversion

**Given** kullanıcının TRY, USD ve EUR birimlerinden abonelikleri var
**When** toplam hesaplanır
**Then** sistem tüm birimleri TRY'ye (Primary Currency) dönüştürerek toplar
**And** dönüşüm için güncel kurlar kullanılır (Exchange Rate API - 24h cache)
**And** mixed currencies varsa toplamın yanında "(USD/EUR kurları dahil)" notu görünür
**And** API erişilemezse fallback olarak hardcoded kurlar kullanılır (örn: 1 USD = 35 TRY, 1 EUR = 37 TRY)

### AC3: Real-Time Update

**Given** kullanıcı yeni abonelik ekler, düzenler veya siler
**When** subscription store güncellenir
**Then** summary cards anında güncellenir (re-render)

### AC4: Empty State

**Given** kullanıcının hiç aboneliği yok
**When** dashboard'u görüntüler
**Then** summary cards "₺0" gösterir
**And** mevcut EmptyState (no subscriptions) görünürlüğünü etkilemez

### AC5: Calculation Accuracy (Formula-Based)

**Given** farklı periyotlarda abonelikler
**When** aylık eşdeğer hesaplanır
**Then** şu formüller uygulanır:

- **Weekly:** `amount * 4.33` (52 hafta / 12 ay)
- **Monthly:** `amount * 1`
- **Yearly:** `amount / 12`
- **Custom:** `amount * (30 / customDays)`
  **And** Yıllık Toplam = `Aylık Toplam * 12`

### AC6: Accessibility & Typography

**Given** summary cards render edildi
**When** kullanıcı verileri inceler
**Then** tüm sayılar `font-variant-numeric: tabular-nums` ile dikey hizada sabit kalır
**And** kartlar `aria-label` (örn: "Toplam Aylık Harcama") içerir

## Tasks / Subtasks

- [x] **Task 1: Utilities & Reuse (AC: #2, #5)**

  - [x] 1.1 Move `formatCurrency` from `src/components/features/subscription/utils.ts` to `src/lib/formatters.ts` for global reuse
  - [x] 1.2 Create `src/lib/spending-calculations.ts` for period conversion logic
  - [x] 1.3 Implement `calculateMonthlyEquivalent(sub, rates)` with currency conversion

- [x] **Task 2: FX Rates Management (AC: #2)**

  - [x] 2.1 Create `src/stores/fx-store.ts` for exchange rate caching
  - [x] 2.2 Implement fetch logic (Exchangerate-API) with 24h local persistence
  - [x] 2.3 Define fallback rates for offline/error scenarios

- [x] **Task 3: Create Summary Components (AC: #1, #6)**

  - [x] 3.1 Create `src/components/features/spending/summary-card.tsx` (Hero styling)
  - [x] 3.2 Implement `SummaryCardSkeleton` using shadcn/ui skeleton
  - [x] 3.3 Create `src/components/features/spending/spending-summary.tsx` (Grid container)

- [x] **Task 4: Integration (AC: #3, #4)**

  - [x] 4.1 Update `src/App.tsx` to include `SpendingSummary`
  - [x] 4.2 Ensure re-renders trigger on `fx-store` or `subscription-store` changes

- [x] **Task 5: Unit Tests (AC: #5, #2)**
  - [x] 5.1 Test 4.33 multiplier for weekly subs
  - [x] 5.2 Test conversion accuracy (e.g., $10 + 100₺ assuming 35 rate = 450₺)
  - [x] 5.3 Test custom period (e.g., 10 day period = 3x monthly)
  - [x] 5.4 Test skeleton visibility during hydration

## Dev Notes

### Architecture Compliance

- **Location:** `src/components/features/spending/`
- **Utilities:** Global formatters in `src/lib/`, spending logic in `src/lib/`

### Technical Specs & Formulas

- **Tabular Nums:** CSS `font-variant-numeric: tabular-nums` zorunludur (sayıların zıplamasını önlemek için).
- **Weekly Factor:** `4.33` (date-fns `differenceInWeeks` kullanmak yerine sabit çarpan MVP için yeterlidir).
- **Zustand:** `fx-store` persist edilmeli (24h cache kuralı için updatedAt timestamp tutulmalı).

### Testing Checklist (Critical Path)

- [x] Mixed currencies correctly summed in TRY.
- [x] Weekly subs \* 4.33 check.
- [x] 0 items display ₺0.
- [x] Skeleton renders when store is loading.

### References

- [Source: docs/ux-design-specification.md#FX API] - Exchangerate-API & 24h cache spec
- [Source: docs/epics.md#Story 3.1] - Acceptance criteria foundation
- [Source: src/components/features/subscription/utils.ts] - Reusable formatters

## Dev Agent Record

### Context Reference

- Story: docs/sprint-artifacts/3-1-monthly-yearly-spending-summary-cards.md

### Agent Model Used

Claude Sonnet 4

### Debug Log References

- Code review applied: Fixed aria-label, typography size, task completion status

### Completion Notes List

- All ACs implemented and verified
- formatCurrency centralized to src/lib/formatters.ts
- FX store with 24h cache and fallback rates
- 209 tests passing (build/lint/test all green)

### File List

**Files Created:**

- `src/components/features/spending/spending-summary.tsx`
- `src/components/features/spending/spending-summary.test.tsx`
- `src/components/features/spending/summary-card.tsx`
- `src/components/features/spending/summary-card.test.tsx`
- `src/components/features/spending/index.ts`
- `src/lib/spending-calculations.ts`
- `src/lib/spending-calculations.test.ts`
- `src/lib/formatters.ts`
- `src/stores/fx-store.ts`
- `src/components/ui/skeleton.tsx`
- `.env.example`

**Files Modified:**

- `src/App.tsx` - Add SpendingSummary to dashboard
- `src/components/features/subscription/subscription-form.tsx` - Import change
- `src/components/features/subscription/subscription-card.tsx` - Import change
- `src/components/features/subscription/delete-confirmation-dialog.tsx` - Import change
- `src/components/features/subscription/subscription-detail-dialog.tsx` - Import change
- `src/components/features/subscription/utils.ts` - Removed duplicate formatCurrency

**Files to Reference (Read-only):**

- `src/stores/subscription-store.ts`
- `src/types/subscription.ts`
- `src/index.css`
