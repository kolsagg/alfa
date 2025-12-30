# Story 9.2: Value Proposition Slides

Status: done

## Story

As a **first-time user**,
I want **to see 3 visually engaging slides explaining SubTracker's value (track subscriptions, see upcoming payments, control spending)**,
so that **I understand the app's purpose and feel motivated to add my first subscription**.

## Background

Story 9.1 created the onboarding architecture (`OnboardingCarousel`, `useOnboardingState`). This story fills it with content—3 Slides highlighting key value propositions:

1. **Control:** Aboneliklerini Kontrol Altına Al
2. **Visibility:** Yaklaşan Ödemeleri Gör
3. **Insights:** Harcamalarını Takip Et

### Strategic Intent:

- **Value Delivery:** Establish trust by showing exactly how the app solves "subscription shock".
- **Funnel Analytics:** Track engagement per slide to optimize the onboarding experience.
- **Zero Friction:** Use icon-based visuals to keep the bundle size minimal and loading instant.

## Acceptance Criteria

### AC1: Slide Content & Illustration

- [x] Render 3 sequential slides with Turkish copy (Titles: Control, Visibility, Insights).
- [x] Use **Icon Compositions** (lucide-react) for illustrations. **NO external assets.**
- [x] Illustrations must use `text-primary` with `motion-safe` animations (pulse/bounce).
- [x] **Optimization:** Animations must ONLY run on the _active_ slide to save battery/resources.

### AC2: i18n & Cleanup

- [x] All text sourced from `src/lib/i18n/onboarding.ts` (Keys: `SLIDE_X_TITLE`, `SLIDE_X_DESCRIPTION`).
- [x] **Mandate:** Remove all `PLACEHOLDER_*` keys introduced in Story 9.1.

### AC3: Event Logging (Funnel Analysis)

- [x] Trigger `onboarding_step_viewed` event with `step_number` and `step_title` on every slide change.
- [x] Log event via `EventLogger` (from Epic 7 infrastructure).

### AC4: Accessibility (Focus Management)

- [x] On slide change, programmatically move focus to the new slide's `h2` title.
- [x] Ensure `aria-live="polite"` announces the full content of the current slide.

### AC5: Responsive Scaling

- [x] Illustrations must scale proportionally for different screen sizes (min-height preserved, no overflow on iPhone SE).
- [x] Center content with `max-w-md mx-auto`.

## Tasks / Subtasks

- [x] **Task 1: i18n Refactor** (AC: 2)

  - [x] 1.1 Add 3-slide content keys (Control/Visibility/Insights).
  - [x] 1.2 DELETE all Story 9.1 placeholders to prevent technical debt.

- [x] **Task 2: OnboardingIllustration Component** (AC: 1, 5)

  - [x] 2.1 Create `src/components/features/onboarding/onboarding-illustration.tsx`.
  - [x] 2.2 Implement 3 variants (control, calendar, chart) using icon compositions.
  - [x] 2.3 Ensure animations are `isActive` prop-dependent.
  - [x] 2.4 Apply responsive scaling (Icon sizes: 48px mobile / 64px desktop).

- [x] **Task 3: Slide Configuration & State** (AC: 3, 4)

  - [x] 3.1 Create `Slide` interface for type-safe config.
  - [x] 3.2 Update `OnboardingCarousel` to trigger `EventLogger.log()` on slide change.
  - [x] 3.3 Implement `useEffect` for programmatic focus on slide title.

- [x] **Task 4: Integration & UX Polish** (AC: all)

  - [x] 4.1 Map slide config to `OnboardingStep` instances via `createOnboardingSteps()`.
  - [x] 4.2 Verify "Başlayalım!" button logic on last slide transitions correctly to Dashboard.

- [x] **Task 5: Validation**
  - [x] 5.1 Unit test `OnboardingIllustration` for all variants (15 tests).
  - [x] 5.2 Integration test: Verify events logged for slides (4 tests in carousel).
  - [x] 5.3 Accessibility check: Title focus on navigation (1 test).

## Dev Notes

### 🏗️ Type Safety: Slide Interface

```typescript
interface Slide {
  id: string;
  titleKey: keyof OnboardingStrings;
  descriptionKey: keyof OnboardingStrings;
  variant: "control" | "visibility" | "insights";
}
```

### 📁 File Structure

```
src/components/features/onboarding/
├── onboarding-illustration.tsx   # New: Composed icons
├── onboarding-illustration.test.tsx
├── slide-config.tsx               # New: Data driven configuration
└── ...
```

### 🧪 Critical Metrics

- **Bundle Impact:** Must stay < 2KB (gzipped) for onboarding visuals.
- **TBT (Total Blocking Time):** 0ms impact on slide transitions.

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/9-1-onboarding-component-architecture.md` (Foundation story)
- `src/lib/i18n/onboarding.ts` (i18n patterns)
- `src/lib/event-logger.ts` (EventLogger from Epic 7)

### Agent Model Used

Antigravity (Claude)

### Debug Log References

None - implementation proceeded without blockers.

### Completion Notes

- ✅ Created `OnboardingIllustration` component with 3 variants (control/visibility/insights) using lucide-react icon compositions
- ✅ Illustrations use `text-primary` color and `motion-safe:animate-*` CSS animations
- ✅ Animations are `isActive` prop-dependent for battery optimization
- ✅ Responsive sizing: h-40/w-40 mobile → h-48/w-48 desktop (via Tailwind responsive classes)
- ✅ Added SLIDE_1/2/3_TITLE and SLIDE_1/2/3_DESCRIPTION keys to onboarding.ts
- ✅ Removed all PLACEHOLDER\_\* keys from i18n to prevent technical debt
- ✅ Created `slide-config.tsx` with type-safe Slide interface and `createOnboardingSteps()` helper
- ✅ Added `onboarding_step_viewed` event type to EventTypeSchema
- ✅ Integrated EventLogger into OnboardingCarousel with step_number and step_title metadata
- ✅ Added `titleRef` to OnboardingStep for programmatic focus management (tabIndex=-1, focus:outline-none)
- ✅ Updated OnboardingGate to use real slide content with animation state management
- ✅ Added `onStepChange` callback prop to OnboardingCarousel for parent state updates
- ✅ 1201 tests pass, build successful
- ✅ **Review Fixes Applied:**
  - Added missing animation delay/duration utility classes to `App.css`.
  - Memoized `createOnboardingSteps` in `OnboardingGate` for performance.
  - Replaced generic colors in illustrations with theme-aware `destructive` and `chart-2`.
  - Added `aria-controls` for improved carousel accessibility.
  - Fixed integration test mocking in `onboarding-gate.test.tsx`.

### File List

#### New Files

- `src/components/features/onboarding/onboarding-illustration.tsx`
- `src/components/features/onboarding/onboarding-illustration.test.tsx`
- `src/components/features/onboarding/slide-config.tsx`

#### Modified Files

- `src/lib/i18n/onboarding.ts` - Added SLIDE*X_TITLE/DESCRIPTION keys, removed PLACEHOLDER*\* keys
- `src/types/event-log.ts` - Added onboarding_step_viewed event type
- `src/components/features/onboarding/onboarding-carousel.tsx` - Added EventLogger integration, titleRef, onStepChange prop
- `src/components/features/onboarding/onboarding-carousel.test.tsx` - Added event logging and focus management tests
- `src/components/features/onboarding/onboarding-step.tsx` - Added titleRef prop with tabIndex=-1
- `src/components/features/onboarding/index.ts` - Added exports for illustration and slide-config
- `src/components/layout/onboarding-gate.tsx` - Updated to use createOnboardingSteps with real content
- `src/components/layout/onboarding-gate.test.tsx` - Added createOnboardingSteps mock
- `docs/sprint-artifacts/sprint-status.yaml` - Story status updates

## Change Log

- 2025-12-30: Story implementation started
- 2025-12-30: Story implementation complete - All 5 tasks finished, 1201 tests pass, build successful
- 2025-12-30: Adversarial code review completed and all findings fixed.
