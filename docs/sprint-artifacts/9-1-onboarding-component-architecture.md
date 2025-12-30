# Story 9.1: Onboarding Component Architecture

Status: Ready for Review

## Story

As a **developer**,
I want **a robust onboarding component architecture (OnboardingCarousel, OnboardingStep, useOnboardingState)**,
so that **Epic 9 stories can build on a consistent, extensible foundation for the user onboarding experience**.

## Background

Party Mode tartışmasında (2025-12-29) tespit edildi: Mevcut onboarding sadece PWA kurulum rehberi sunuyor. Kullanıcı uygulamanın değer önerisini anlamadan boş dashboard ile karşılaşıyor. "Value-First Onboarding" + "Template-Assisted First Subscription" yaklaşımı benimsendi.

Bu story, Epic 9'un temelini oluşturan component architecture'ı kurar. Sonraki story'ler (9.2-9.5) bu foundation üzerine inşa edilecek.

### Target State:

- `OnboardingCarousel` - 3-4 slide'lık görsel tanıtım container'ı (skip edilebilir)
- `OnboardingStep` - Tekil slide component'i (title, description, illustration)
- `useOnboardingState` hook - localStorage persistence + state management
- i18n integration - Tüm string'ler ayrı dosyada
- Accessibility - Keyboard navigation, screen reader support

## Acceptance Criteria

### AC1: useOnboardingState Hook

- **Given** the onboarding hook is initialized
- **When** it reads from localStorage
- **Then** it returns `{ hasCompletedOnboarding: boolean, currentStep: number }`
- **And** `onboarding_completed: true` persist ediliyorsa `hasCompletedOnboarding: true` döner
- **And** `markComplete()`, `setStep(n)`, `reset()` action'ları mevcut
- **And** storage key: `subtracker-onboarding` (env-aware: `-dev` suffix for development)
- **And** hook, component re-render minimize edecek şekilde selector pattern kullanır
- **And** state is validated using Zod schema on rehydration (Architecture compliance)

### AC2: OnboardingStep Component

- **Given** a step configuration is provided
- **When** the component renders
- **Then** it displays:
  - Title (h2, `text-2xl font-bold`)
  - Description (p, `text-muted-foreground`)
  - Illustration slot (React node, centered)
- **And** layout uses `flex flex-col items-center justify-center` with min-height
- **And** respects `prefers-reduced-motion` for any animations
- **And** has `data-testid="onboarding-step"` for testing

### AC3: OnboardingCarousel Component

- **Given** steps array is provided (min 1, max 5)
- **When** the carousel renders
- **Then** it displays current step with pagination dots
- **And** "İleri" button advances to next step
- **And** "Atla" button skips entire onboarding, marks complete
- **And** on last step, button becomes "Başlayalım!" and marks complete
- **And** keyboard navigation: ArrowLeft/ArrowRight changes steps
- **And** swipe gestures work on touch devices (optional, nice-to-have)
- **And** has `data-testid="onboarding-carousel"` for testing

### AC4: Conditional Rendering Integration

- **Given** onboarding is not completed
- **When** user opens the app for the first time
- **Then** `OnboardingCarousel` renders INSTEAD of the dashboard
- **And** it renders as a standalone full-screen view (No Header, No Bottom Nav)
- **And** it uses full viewport height (`min-h-screen`)

- **Given** onboarding is completed
- **When** user opens the app
- **Then** normal dashboard renders (no onboarding)

### AC5: Accessibility & Responsiveness

- **Given** a user with screen reader
- **When** navigating the carousel
- **Then** step changes are announced via `aria-live="polite"`
- **And** pagination dots have proper `aria-label` ("Adım 1/3")
- **And** buttons have clear accessible names

- **Given** mobile viewport
- **When** rendering
- **Then** content is centered and readable (max-w-md mx-auto)
- **And** touch targets are minimum 44x44px

### AC6: i18n Integration

- **Given** localized strings are required
- **When** the component renders
- **Then** all text is sourced from `src/lib/i18n/onboarding.ts`
- **And** keys include: `SKIP_BUTTON`, `NEXT_BUTTON`, `START_BUTTON`, `STEP_INDICATOR`
- **And** step content strings are passed as props (content from 9.2)

## Tasks / Subtasks

- [x] **Task 1: Create useOnboardingState Hook** (AC: 1)

  - [x] 1.1 Create `src/hooks/use-onboarding-state.ts`
  - [x] 1.2 Implement localStorage persistence with schema version
  - [x] 1.3 Add `hasCompletedOnboarding`, `currentStep`, `markComplete()`, `setStep()`, `reset()`
  - [x] 1.4 Add environment-aware storage key (`-dev` suffix)
  - [x] 1.5 Create tests: `src/hooks/use-onboarding-state.test.ts`

- [x] **Task 2: Create i18n File** (AC: 6)

  - [x] 2.1 Create `src/lib/i18n/onboarding.ts`
  - [x] 2.2 Add all required string keys (SKIP_BUTTON, NEXT_BUTTON, START_BUTTON, STEP_INDICATOR)

- [x] **Task 3: Create OnboardingStep Component** (AC: 2, 5)

  - [x] 3.1 Create `src/components/features/onboarding/onboarding-step.tsx`
  - [x] 3.2 Implement props: `title: string`, `description: string`, `illustration: ReactNode`
  - [x] 3.3 Add accessibility attributes
  - [x] 3.4 Create tests: `src/components/features/onboarding/onboarding-step.test.tsx`

- [x] **Task 4: Create OnboardingCarousel Component** (AC: 3, 5)

  - [x] 4.1 Create `src/components/features/onboarding/onboarding-carousel.tsx`
  - [x] 4.2 Implement step navigation (next, skip, complete)
  - [x] 4.3 Add pagination dots with proper ARIA
  - [x] 4.4 Implement keyboard navigation (ArrowLeft/ArrowRight)
  - [x] 4.5 Add `prefers-reduced-motion` support for transitions
  - [x] 4.6 Create tests: `src/components/features/onboarding/onboarding-carousel.test.tsx`

- [x] **Task 5: Barrel Exports** (AC: all)

  - [x] 5.1 Create `src/components/features/onboarding/index.ts`

- [x] **Task 6: App Integration** (AC: 4)
  - [x] 6.1 Update router to conditionally render OnboardingCarousel via OnboardingGate
  - [x] 6.2 Add integration test for first-run scenario

## Dev Notes

### 🏗️ Architecture: Component Hierarchy

```
App.tsx
├── [onboarding not complete] → OnboardingCarousel
│   ├── OnboardingStep (x3-4)
│   └── Pagination + Buttons
└── [onboarding complete] → Dashboard (existing)
```

### 📁 File Locations (MUST FOLLOW)

```
src/
├── hooks/
│   ├── use-onboarding-state.ts
│   └── use-onboarding-state.test.ts
├── lib/i18n/
│   └── onboarding.ts         # NEW
├── components/features/onboarding/
│   ├── onboarding-carousel.tsx
│   ├── onboarding-carousel.test.tsx
│   ├── onboarding-step.tsx
│   ├── onboarding-step.test.tsx
│   └── index.ts
```

### 🎨 Styling Guidelines

- **Color palette:** Use `var(--color-primary)` for accent, `var(--color-muted-foreground)` for description
- **Typography:** Plus Jakarta Sans, hero text `text-2xl font-bold`
- **Spacing:** `space-y-6` between elements, `py-12` for breathing room
- **Touch targets:** Minimum 44x44px for all buttons
- **Reduced motion:** Wrap animations in `@media (prefers-reduced-motion: no-preference)`

### 🧪 Testing Requirements

| Component          | Test Coverage Required               |
| ------------------ | ------------------------------------ |
| useOnboardingState | Persist/load, actions, env-awareness |
| OnboardingStep     | Render props, accessibility          |
| OnboardingCarousel | Navigation, keyboard, skip, complete |
| App integration    | First-run vs returning user          |

### 💡 Implementation Tips

1. **localStorage Pattern:** Follow existing `subtracker-settings` pattern from settings-store.ts
2. **Carousel Animation:** Use CSS transitions, NOT framer-motion (bundle size)
3. **Step Content:** This story creates STRUCTURE only. Step content comes from Story 9.2
4. **Empty Steps:** For testing, use placeholder content (lorem ipsum or simple icons)

### ⚠️ Critical Constraints

- **NO framer-motion:** Use CSS transitions only
- **NO step content:** This story is architecture-only, content from 9.2
- **NO template grid:** Quick-start templates are Story 9.3
- **NO celebration:** Confetti animation is Story 9.4
- **DO NOT break existing EmptyState:** OnboardingCarousel is SEPARATE from the current empty state

### 🔗 Integration Points

| Component    | Location                                | Relationship                     |
| ------------ | --------------------------------------- | -------------------------------- |
| EmptyState   | `src/components/layout/empty-state.tsx` | Preserved, shows post-onboarding |
| useUIStore   | `src/stores/ui-store.ts`                | May need modal triggers (9.3)    |
| QuickAddGrid | `src/components/features/quick-add/`    | Will be reused in 9.3            |

### Project Structure Notes

- **Alignment:** Creates new `src/components/features/onboarding/` folder per architecture.md pattern
- **follows:** kebab-case files, PascalCase exports, co-located tests
- **i18n:** Follows established pattern from `wallet.ts`, `settings.ts`

### References

- [Source: docs/epics.md#Epic-9-User-Onboarding-Experience] Epic definition and story list
- [Source: docs/ux-design-specification.md#Empty-State-Onboarding] Onboarding UX requirements
- [Source: docs/architecture.md#Project-Organization] File structure patterns
- [Source: docs/sprint-artifacts/2-8-empty-state-and-minimal-onboarding.md] Existing empty state implementation
- [Source: docs/sprint-artifacts/8-8-wallet-route.md] i18n and component patterns

## Previous Story Intelligence

### From Story 8.8 (Wallet Route):

- **document.title pattern:** Use `useEffect` for title updates, include cleanup
- **i18n structure:** 5 keys per file, Turkish strings, descriptive key names
- **Test count:** Aim for 15-20 tests covering component + integration
- **Empty state styling:** `rounded-2xl border border-border/30 bg-muted/20`

### From Story 2.8 (Empty State):

- **Centralized modal control:** Use `useUIStore` for any modal triggers, NOT local state
- **Accessibility:** `aria-live="polite"`, `role="status"` for dynamic content
- **Touch targets:** Enforce 44x44px via padding/min-height
- **prefers-reduced-motion:** All animations must have reduced-motion fallback

## Dev Agent Record

### Context Reference

- `docs/epics.md` (Epic 9: User Onboarding Experience)
- `docs/ux-design-specification.md` (Onboarding patterns)
- `docs/architecture.md` (Component patterns, file structure)

### Agent Model Used

Antigravity (Claude)

### Debug Log References

### Completion Notes List

- ✅ Created `useOnboardingState` hook with localStorage persistence, Zod validation, environment-aware storage key (-dev suffix), and useSyncExternalStore for selector pattern
- ✅ Created comprehensive i18n file with Turkish strings and helper functions for interpolation
- ✅ Created `OnboardingStep` component with title, description, illustration slot, accessibility attributes, and reduced-motion support via `motion-safe:` prefix
- ✅ Created `OnboardingCarousel` component with step navigation, pagination dots, keyboard navigation (ArrowLeft/ArrowRight), skip and complete functionality, full accessibility with aria-live regions
- ✅ Created `OnboardingGate` component to conditionally render onboarding (full-screen, no Header/BottomNav) or RootLayout
- ✅ Updated router to use OnboardingGate instead of RootLayout for first-run detection
- ✅ Added CSS animations for onboarding (fade-in, slide-up) with reduced-motion fallback
- ✅ All 77 onboarding-related tests pass
- ✅ Build successful, TypeScript type checking passes

### File List

#### New Files

- `src/hooks/use-onboarding-state.ts`
- `src/hooks/use-onboarding-state.test.ts`
- `src/lib/i18n/onboarding.ts`
- `src/components/features/onboarding/onboarding-step.tsx`
- `src/components/features/onboarding/onboarding-step.test.tsx`
- `src/components/features/onboarding/onboarding-carousel.tsx`
- `src/components/features/onboarding/onboarding-carousel.test.tsx`
- `src/components/features/onboarding/index.ts`
- `src/components/layout/onboarding-gate.tsx`
- `src/components/layout/onboarding-gate.test.tsx`

#### Modified Files

- `src/router/index.tsx` - Updated to use OnboardingGate for conditional onboarding
- `src/router/router.test.tsx` - Added useOnboardingState mock + first-run integration tests
- `src/App.css` - Added onboarding animations (fade-in, slide-up, pb-safe)
- `src/types/event-log.ts` - Added onboarding_completed/skipped event types
- `src/components/layout/onboarding-gate.test.tsx` - Updated to mock logger instead of console
- `src/lib/i18n/onboarding.ts` - Added placeholder track/start strings for AC6 compliance
- `docs/epics.md` - Epic 9 status update
- `docs/sprint-artifacts/sprint-status.yaml` - Story status updates

## Change Log

- 2025-12-29: Story created via create-story workflow with exhaustive context analysis
- 2025-12-30: Story implementation complete - All 6 tasks finished, 77 tests pass, build successful
- 2025-12-30: Code review fixes applied:
  - [M2] Hardcoded Turkish strings in OnboardingGate replaced with i18n imports (AC6 compliance)
  - [M3] Added 3 first-run integration tests to router.test.tsx (Task 6.2 complete)
  - [L1] Replaced console.log with EventLogger for architecture consistency
  - Added onboarding_completed/skipped event types to EventTypeSchema
  - Updated onboarding-gate.test.tsx to use logger mock
  - All 1181 tests pass, build successful

Status: done
