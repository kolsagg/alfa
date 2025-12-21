# Story 3.2: Timeline View (Upcoming Payments)

Status: done

## Story

As a **kullanıcı**,
I want **yaklaşan ödemelerimi kronolojik sırada görmek**,
so that **finansal planlamalarımı daha iyi yapabileyim**.

## Acceptance Criteria

### AC1: Chronological Payment List

**Given** kullanıcının abonelikleri var
**When** timeline'ı görüntüler
**Then** ödemeler yakınlık sırasına göre (en yakın önce) listelenir
**And** her item şunları gösterir: abonelik ismi, tutar, tarih, kalan gün sayısı, kategori badge
**And** liste smooth scroll ile 60fps performans sağlar

### AC2: Past Due Highlighting

**Given** vadesi geçmiş abonelikler var
**When** timeline render edilir
**Then** past due items listenin EN ÜSTÜNDE ayrı bir section olarak gösterilir
**And** past due items kırmızı/urgent renk ile vurgulanır
**And** "X gün gecikti" şeklinde negatif gün gösterimi yapılır

### AC3: Empty State

**Given** kullanıcının hiç aboneliği yok
**When** timeline'ı görüntüler
**Then** "Yaklaşan ödeme yok" mesajı gösterilir
**And** mesaj friendly ve encouraging tonunda olur

### AC4: Date & Timezone Handling

**Given** timeline tarih hesaplamaları yapılır
**When** farklı timezone'larda kullanıcılar var
**Then** tüm hesaplamalar kullanıcının local timezone'una göre yapılır
**And** Istanbul, UTC, PST timezone'ları için unit test yazılır
**And** DST (Daylight Saving Time) geçişleri doğru handle edilir

### AC5: Performance

**Given** kullanıcının 100+ aboneliği var
**When** timeline render edilir
**Then** initial render <100ms içinde tamamlanır
**And** scroll performansı 60fps'i korur
**And** DevTools Performance tab ile doğrulanabilir

### AC6: Accessibility

**Given** timeline render edildi
**When** kullanıcı screen reader kullanır
**Then** her item için anlamlı aria-label sağlanır (örn: "Netflix, 99 TL, 3 gün sonra")
**And** focus order mantıklı (past due → upcoming)
**And** keyboard navigation desteklenir

### AC7: Today Edge Case

**Given** ödeme tarihi bugün olan abonelik var
**When** timeline render edilir
**Then** 0 gün = "Bugün" olarak gösterilir
**And** upcoming section'da ama `--color-critical` renkte vurgulanır

## Tasks / Subtasks

- [x] **Task 1: Timeline Calculation Utils (AC: #1, #2, #4, #7)**

  - [x] 1.1 Create `src/lib/timeline-utils.ts` with `getUpcomingPayments()` function
  - [x] 1.2 Implement `getDaysUntilPayment(date)` helper (positive = upcoming, negative = past due, 0 = today)
  - [x] 1.3 Implement `sortByPaymentDate(subscriptions)` (past due first, then chronological)
  - [x] 1.4 Create `src/lib/timeline-utils.test.ts` with timezone scenarios

- [x] **Task 2: TimelineItem Component (AC: #1, #6)**

  - [x] 2.1 Create `src/components/features/timeline/timeline-item.tsx`
  - [x] 2.2 Display: name, amount (formatCurrency), date (format from date-fns), days remaining, CategoryBadge
  - [x] 2.3 Add urgency styling (use existing urgency color system from index.css)
  - [x] 2.4 Implement aria-label with full context

- [x] **Task 3: Timeline Container (AC: #1, #2, #3, #5, #7)**

  - [x] 3.1 Create `src/components/features/timeline/timeline-view.tsx`
  - [x] 3.2 Separate sections: "Gecikmiş" (past due) + "Yaklaşan" (upcoming)
  - [x] 3.3 Empty state when no subscriptions
  - [x] 3.4 Skeleton loading state

- [x] **Task 4: Integration (AC: #1)**

  - [x] 4.1 Add Timeline section to `src/App.tsx` (below SpendingSummary)
  - [x] 4.2 Connect to subscription-store
  - [x] 4.3 Test real-time updates when subscriptions change

- [x] **Task 5: Unit Tests (AC: #4, #5, #7)**
  - [x] 5.1 Test `getDaysUntilPayment` with past/future/today dates
  - [x] 5.2 Test sorting logic (past due first)
  - [x] 5.3 Test timezone handling (mock different TZ)
  - [x] 5.4 Test component rendering with various data scenarios
  - [x] 5.5 Test "today" edge case (0 days)

## Dev Notes

### Architecture Compliance

- **Location:** `src/components/features/timeline/`
- **Utilities:** Date logic in `src/lib/timeline-utils.ts`
- **Reuse:** `formatCurrency` from `@/lib/formatters`, `CategoryBadge` from `@/components/ui/category-badge`

### Technical Specs

#### Date Library Usage (date-fns)

```typescript
import { differenceInDays, startOfDay, isBefore, format } from "date-fns";
import { tr } from "date-fns/locale";

// CRITICAL: Use startOfDay for accurate day boundaries
const today = startOfDay(new Date());
const paymentDate = startOfDay(new Date(subscription.nextPaymentDate));

// CRITICAL: Signature is (laterDate, earlierDate)
const daysUntil = differenceInDays(paymentDate, today);
// Positive = upcoming, Negative = past due, 0 = today

// Date formatting for display
format(paymentDate, "d MMM", { locale: tr }); // "21 Ara"
```

#### Subscription Type Reference

```typescript
// nextPaymentDate is stored as ISO string, MUST parse before use
const paymentDate = new Date(subscription.nextPaymentDate);
```

#### Urgency Color System

```typescript
// Use CSS variables from index.css
const URGENCY_THRESHOLDS = {
  subtle: 7, // 7+ days: --color-subtle
  attention: 3, // 3-7 days: --color-attention
  urgent: 1, // 1-3 days: --color-urgent
  critical: 0, // 0 or past: --color-critical
} as const;

// TailwindCSS v4 usage pattern:
// className="bg-[var(--color-urgent)]"
// OR inline: style={{ backgroundColor: 'var(--color-critical)' }}
```

### Previous Story Learnings (3.1)

- `formatCurrency` centralized at `@/lib/formatters.ts` - REUSE IT
- Zustand store patterns established - follow same selector pattern
- Skeleton component exists at `@/components/ui/skeleton.tsx`
- Grid layout pattern: `grid grid-cols-1 gap-4` for mobile-first

### Testing Checklist (Critical Path)

- [x] Past due items always appear first
- [x] Days calculation accurate across timezones
- [x] Empty state renders correctly
- [x] "Bugün" shows for 0 days
- [x] 60fps scroll with 50+ items
- [x] `startOfDay` used for accurate day boundaries

### References

- [Source: docs/epics.md#Story 3.2] - Acceptance criteria
- [Source: docs/architecture.md#Urgency System] - Color palette
- [Source: src/lib/formatters.ts] - Currency formatting
- [Source: src/stores/subscription-store.ts] - Data source
- [Source: src/components/features/subscription/subscription-card.tsx] - CategoryBadge usage example

## Dev Agent Record

### Context Reference

- Story: docs/sprint-artifacts/3-2-timeline-view-upcoming-payments.md

### Agent Model Used

Claude Sonnet 4

### Debug Log References

- Build/Lint/Test all passing: 242 tests (33 new)

### Completion Notes List

- All 7 ACs implemented and verified
- Timeline utils with `getDaysUntilPayment`, `formatDaysRemaining`, `getUrgencyLevel`, `sortByPaymentDate`
- TimelineItem with urgency styling, CategoryBadge, aria-label
- TimelineView with past due/upcoming sections, empty state, skeleton loading
- Integrated into App.tsx between SpendingSummary and SubscriptionList
- 22 timeline-utils tests + 11 component tests passing

### File List

**Files Created:**

- `src/components/features/timeline/timeline-view.tsx`
- `src/components/features/timeline/timeline-item.tsx`
- `src/components/features/timeline/timeline-view.test.tsx`
- `src/components/features/timeline/index.ts`
- `src/lib/timeline-utils.ts`
- `src/lib/timeline-utils.test.ts`

**Files Modified:**

- `src/App.tsx` - Added TimelineView import and component

**Files to Reference (Read-only):**

- `src/stores/subscription-store.ts`
- `src/types/subscription.ts`
- `src/lib/formatters.ts`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/category-badge.tsx`
- `src/index.css`
