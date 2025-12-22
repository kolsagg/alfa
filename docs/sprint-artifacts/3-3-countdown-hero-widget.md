# Story 3.3: Countdown Hero Widget

Status: done

## Story

As a **kullanıcı**,
I want **bir sonraki ödememde dramatik bir geri sayım görmek**,
so that **yaklaşan masraflardan her zaman haberdar olayım**.

## Acceptance Criteria

### AC1: Hero Display

**Given** kullanıcının en az bir aboneliği var
**When** dashboard'u görüntüler
**Then** Countdown Hero en yakın ödemeyi gösterir:

- Abonelik ismi ve icon (ilk harf avatar)
- Tutar (formatCurrency)
- Geri sayım (gün, saat, dakika)
- Urgency level görselleştirmesi

### AC2: Crescendo Urgency System

**Given** Countdown Hero render edilir
**When** kalan süre farklı eşiklerde
**Then** aşağıdaki urgency seviyeleri uygulanır:

- 7+ gün: subtle (muted colors, small text, `--color-subtle`)
- 3-7 gün: attention (colored badge, `--color-attention`)
- 24 saat: urgent (pulsing animation, warning icon, `--color-urgent`)
- <1 saat: critical (red alert, dramatic pulse, shows seconds, `--color-critical`)

### AC3: Real-time Updates

**Given** Countdown Hero gösteriliyor
**When** zaman ilerliyor
**Then** geri sayım her dakika güncellenir
**And** <1 saat kaldığında her saniye güncellenir

### AC4: Animation & Motion

**Given** urgency level "urgent" veya "critical"
**When** component render edilir
**Then** pulse/attention animation uygulanır
**And** `prefers-reduced-motion: reduce` ayarı animate devre dışı bırakır

### AC5: Empty State

**Given** kullanıcının hiç aboneliği yok
**When** dashboard'u görüntüler
**Then** placeholder görüntülenir: "--:--:--" ve "Henüz abonelik yok"

### AC6: Accessibility

**Given** Countdown Hero render edildi
**When** screen reader kullanıcısı erişir
**Then** anlamlı aria-label sağlanır (örn: "Netflix, 99 TL, 3 gün 12 saat sonra")
**And** live region ile güncellemeler announce edilir
**And** animasyonlar `prefers-reduced-motion` respecter

### AC7: Filter & Tie-breaking (Disaster Prevention)

**Given** kullanıcı abonelik listesine sahip
**When** en yakın ödeme hesaplanır
**Then** sadece `isActive: true` olan abonelikler dikkate alınır
**And** aynı tarihe sahip birden fazla abonelik varsa, daha pahalı olan (tutarı yüksek) başa gelir (tie-breaking)

### AC8: Timer Stability

**Given** Hero widget aktif
**When** kullanıcı tab değiştirir veya cihazı uyku moduna alır
**Then** tab tekrar aktif olduğunda (`visibilitychange`) geri sayım otomatik yenilenir
**And** timer hesaplaması her zaman o anki gerçek `new Date()` üzerinden yapılır (drift prevention)

## Tasks / Subtasks

- [x] **Task 1: Countdown Logic Utils (AC: #1, #3, #7)**

  - [x] 1.1 Create `src/lib/countdown-utils.ts` with `getTimeRemaining(date)` returning days, hours, minutes, seconds
  - [x] 1.2 Implement `getNextPayment(subscriptions)` (CRITICAL: `isActive: true` filter + amount-based tie-breaking)
  - [x] 1.3 Implement `formatCountdownDisplay(time, urgency)` for display formatting
  - [x] 1.4 Create `src/lib/countdown-utils.test.ts` with edge cases and timezone scenarios (Istanbul, PST, UTC)

- [x] **Task 2: CountdownHero Component (AC: #1, #2, #5, #6, #8)**

  - [x] 2.1 Replace placeholder `src/components/dashboard/countdown-hero-placeholder.tsx` with full implementation
  - [x] 2.2 Add subscription name, icon (first letter avatar), amount display
  - [x] 2.3 Add countdown display (DD:HH:MM or HH:MM:SS when <1h)
  - [x] 2.4 Implement urgency-based styling using CSS variables
  - [x] 2.5 Add aria-label and `aria-live` region (announce every minute, but NOT every second to avoid spam)
  - [x] 2.6 Implement `visibilitychange` listener to refresh timer on tab focus
  - [x] 2.7 Keep empty state for no subscriptions

- [x] **Task 3: Animations (AC: #2, #4)**

  - [x] 3.1 Add pulse animation CSS in `src/index.css`
  - [x] 3.2 Implement `@media (prefers-reduced-motion: reduce)` fallback
  - [x] 3.3 Apply animations based on urgency level

- [x] **Task 4: Real-time Updates (AC: #3, #8)**

  - [x] 4.1 Use `useEffect` with `setInterval` for timer updates
  - [x] 4.2 CRITICAL: Calc remaining time using actual `new Date()` inside interval callback
  - [x] 4.3 Interval: 60000ms (1 min) normally, 1000ms when <1 hour
  - [x] 4.4 Cleanup interval and listeners on unmount

- [x] **Task 5: Integration & Tests (AC: #1, #3, #7)**
  - [x] 5.1 Update App.tsx to use new CountdownHero (replace placeholder)
  - [x] 5.2 Write unit tests for countdown-utils (Istanbul/PST/UTC consistency)
  - [x] 5.3 Write component tests for CountdownHero (including visibilitychange mock)

## Dev Notes

### Architecture Compliance

- **Location:** `src/components/dashboard/countdown-hero.tsx` (replaces placeholder)
- **Utilities:** `src/lib/countdown-utils.ts`
- **Reuse:** `formatCurrency` from `@/lib/formatters`, urgency colors from `index.css`

### Technical Implementation

- Used tick-based approach for timer updates to satisfy React hooks linter
- `useMemo` recalculates `timeRemaining` on each tick increment
- Tick incremented by `setInterval` callback (not synchronous setState in effect)
- `visibilitychange` event triggers tick increment to refresh countdown

### References

- [Source: docs/epics.md#Story 3.3] - Acceptance criteria
- [Source: docs/ux-design-specification.md#Countdown Crescendo] - Urgency tiers
- [Source: docs/architecture.md#Urgency System] - OKLCH colors
- [Source: src/index.css] - Urgency color variables
- [Source: src/lib/timeline-utils.ts] - Urgency patterns

## Dev Agent Record

### Context Reference

- Story: docs/sprint-artifacts/3-3-countdown-hero-widget.md

### Agent Model Used

Claude Sonnet 4

### Debug Log References

- All 26 countdown-utils tests passing
- All 13 countdown-hero tests passing
- 284 total tests passing, 3 skipped

### Completion Notes List

1. Created `countdown-utils.ts` with getTimeRemaining, getNextPayment, formatCountdown, getCountdownUrgency
2. getNextPayment implements active-only filter and amount-based tie-breaking
3. Created CountdownHero component with urgency-based styling and animations
4. Added pulse animations to index.css with prefers-reduced-motion fallback
5. Replaced placeholder in App.tsx
6. Deleted countdown-hero-placeholder.tsx
7. Used tick-based timer approach to satisfy React hooks linter (no setState in effect body)

### File List

**Files Created:**

- `src/lib/countdown-utils.ts`
- `src/lib/countdown-utils.test.ts`
- `src/components/dashboard/countdown-hero.tsx`
- `src/components/dashboard/countdown-hero.test.tsx`

**Files Modified:**

- `src/index.css` - Added countdown-pulse and attention-shake animations with reduced-motion fallback
- `src/App.tsx` - Replaced CountdownHeroPlaceholder with CountdownHero

**Files Deleted:**

- `src/components/dashboard/countdown-hero-placeholder.tsx`
