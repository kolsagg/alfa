# Story 8.8: Wallet Route

Status: done

## Story

As a **user**,
I want **to access a dedicated Wallet page through the bottom navigation**,
so that **I can see a clear integration point for future card management features (Epic 6)**.

## Background

Epic 8 implements the full routing infrastructure with React Router v7. This story completes the navigation infrastructure by enhancing the Wallet page from a placeholder to a properly structured page ready for Epic 6 integration.

### Target State:

- Structured `WalletPage` matching dashboard/settings layout patterns (`px-4 pt-2`, `space-y-6`).
- EmptyState component using project-standard styling (rounded cards, muted backgrounds).
- Localized strings via a dedicated i18n file.
- Document title updates synchronized with the active route.

## Acceptance Criteria

### AC1: Enhanced Wallet Page Layout

- **Given** the user navigates to the Wallet page
- **When** the page renders
- **Then** it displays a header with title "Cüzdan" and a descriptive subheader.
- **And** the layout matches established patterns: `div className="space-y-6"`, page-level `h1`.

### AC2: Standardized Empty State

- **Given** no cards exist in the store (Epic 6 backlog)
- **When** the Wallet page renders
- **Then** a `WalletEmptyState` component displays:
  - Centered `Wallet` icon (48x48px).
  - Title: "Henüz kart eklenmedi".
  - Description: High-level purpose of card management.
  - Badge: "Yakında" (Coming Soon) using `@/components/ui/badge`.
- **And** it reuses or matches styling from `src/components/layout/empty-state.tsx` (e.g., `rounded-2xl border border-border/30 bg-muted/20`).

### AC3: i18n Integration

- **Given** localized strings are required
- **When** the page renders
- **Then** all text is sourced from `src/lib/i18n/wallet.ts`.
- **And** keys include: `WALLET_TITLE`, `WALLET_DESCRIPTION`, `EMPTY_TITLE`, `EMPTY_DESCRIPTION`, `COMING_SOON_BADGE`.

### AC4: Accessibility & SEO

- **Given** the user is on the Wallet page
- **When** the page is loaded
- **Then** `document.title` updates to "Cüzdan | SubTracker".
- **And** the heading hierarchy is correct (`<h1>` for "Cüzdan").
- **And** interactive elements have `data-testid` for reliable testing.

## Tasks / Subtasks

- [x] **Task 1: i18n Strategy Implementation**
  - [x] 1.1 Create `src/lib/i18n/wallet.ts` with all required strings (WALLET_TITLE, WALLET_DESCRIPTION, etc.)
- [x] **Task 2: Wallet EmptyState Component**
  - [x] 2.1 Create `src/components/features/wallet/wallet-empty-state.tsx`.
  - [x] 2.2 Implement UI using `src/components/ui/badge.tsx` and standard layout patterns (rounded containers, centered text).
- [x] **Task 3: Page Refactoring**
  - [x] 3.1 Overwrite `src/pages/wallet-page.tsx` with structured layout.
  - [x] 3.2 Add page-level `data-testid="wallet-page"`.
- [x] **Task 4: Quality & Testing**
  - [x] 4.1 Create `src/pages/wallet-page.test.tsx`.
  - [x] 4.2 **CRITICAL:** Add test case verifying `document.title` changes on navigation.
  - [x] 4.3 Verify accessibility compliance (ARIA labels, heading levels).
- [x] **Task 5: Exports**
  - [x] 5.1 Add barrel export in `src/components/features/wallet/index.ts`.

## Dev Notes

### 📊 Epic 6 Integration Point

This story is structural. **Do NOT implement card CRUD or card stores.** Epic 6 will integrate with this page later. The page should be "static" for now, always showing the empty state.

### 🎨 Styling & Component Reuse

- **Badge:** Use `import { Badge } from "@/components/ui/badge"`.
- **Empty State:** Reference `src/components/layout/empty-state.tsx` for visual and spacing consistency.
- **Header:** Title should be `text-2xl font-bold`.

## Dev Agent Record

### Implementation Plan

Story 8.8 implementation focused on creating a structured Wallet page ready for Epic 6 integration:

1. Created dedicated i18n file (`wallet.ts`) with all required Turkish strings
2. Built `WalletEmptyState` component matching project patterns from `empty-state.tsx`
3. Refactored `WalletPage` with proper layout, i18n integration, and document.title sync
4. Added comprehensive tests for both component and page (20 tests total)
5. Created barrel exports for clean module structure

### Completion Notes

✅ **All tasks completed successfully:**

- i18n: 5 string keys (WALLET_TITLE, WALLET_DESCRIPTION, EMPTY_TITLE, EMPTY_DESCRIPTION, COMING_SOON_BADGE)
- WalletEmptyState: Project-standard styling with Wallet icon, Coming Soon badge
- WalletPage: Structured layout matching dashboard/settings patterns
- Testing: 20 tests passing (8 for component, 12 for page)
- Full regression: 744 tests passing, no regressions
- Build: Successful with dedicated chunk (wallet-page-UIGht9m1.js)
- Lint: 0 errors/warnings

**Key implementation decisions:**

- Used `useEffect` for document.title update to ensure client-side sync
- Icon size set to 48x48px (`h-12 w-12`) as specified in AC2
- Reused glow effect pattern from main empty-state component for visual consistency
- All text properly sourced from i18n, no hardcoded strings

### Review Resolution (AI)

✅ **Addressed 5 findings from adversarial review:**

- **H1 & M2:** Implemented `useEffect` cleanup to restore `document.title` on unmount.
- **H2:** Added missing `px-4 pt-2` layout classes to match target state patterns.
- **M1 & M3:** Expanded test coverage to verify title restoration (21 tests total) and used explicit `ReactElement` imports.
- **L1 & L2:** Cleaned up test mocks and clarified component documentation.
- **Status:** Verified with both component and page integration tests + full regression suite.

## File List

### New Files

- `src/lib/i18n/wallet.ts`
- `src/components/features/wallet/wallet-empty-state.tsx`
- `src/components/features/wallet/wallet-empty-state.test.tsx`
- `src/components/features/wallet/index.ts`
- `src/pages/wallet-page.test.tsx`

### Modified Files

- `src/pages/wallet-page.tsx`

## Change Log

- 2025-12-25: Story created and validated for competitive excellence.
- 2025-12-25: Implementation completed - all 5 tasks done, 20 tests passing, ready for review.
- 2025-12-25: Adversarial code review completed. Fixed 2 HIGH and 3 MEDIUM issues (document title restoration, layout pattern compliance, test quality). All 21 tests passing. Status set to "done".
