# Story 1.4: iOS PWA Detection and Guidance Component

Status: Ready for Review

## Story

As an **iOS Safari user**,
I want **clear instructions on how to install the app**,
So that **I can enable full PWA features including notifications**.

## Acceptance Criteria

1. **Given** a user visits from iOS Safari (not standalone PWA)
   **When** they interact with the app
   **Then** a guidance modal appears explaining "Add to Home Screen"
   **And** the modal includes step-by-step screenshot instructions (Share -> Add to Home Screen)

2. **Given** the user dismisses the modal
   **When** they visit again within 7 days
   **Then** the modal is NOT shown (unless they clear storage)

3. **Given** 7 days have passed since dismissal
   **When** the user visits again (and still not installed)
   **Then** the modal reappears

4. **Given** the user is already in standalone PWA mode
   **When** they open the app
   **Then** no guidance modal is shown

## Tasks / Subtasks

- [x] **Task 1: iOS Detection Logic** (AC: #1, #4)

  - [x] 1.1 Create `src/hooks/use-ios-pwa-detection.ts` hook.
  - [x] 1.2 Implement logic to detect iOS (iPhone/iPad/iPod).
  - [x] 1.3 Detect "standalone" mode (navigator.standalone or matchMedia).
  - [x] 1.4 Detect if the browser is Safari (and not Chrome/Firefox on iOS).

- [x] **Task 2: Guidance UI Component** (AC: #1)

  - [x] 2.1 Create `src/components/ui/ios-install-guidance.tsx` using `Dialog` (shadcn/ui).
  - [x] 2.2 Design a step-by-step visual guide (Share icon -> Scroll down -> Add to Home Screen).
  - [x] 2.3 Use `generate_image` or high-quality icons to represent iOS UI elements.

- [x] **Task 3: Persistence & Frequency Control** (AC: #2, #3)

  - [x] 3.1 Update `settings-store.ts` to include `lastIOSPromptDismissed` (timestamp).
  - [x] 3.2 Implement logic to check if 7 days have passed.
  - [x] 3.3 Add `dismissIOSPrompt` action to the store.

- [x] **Task 4: Integration** (AC: #1)

  - [x] 4.1 integrate `IOSInstallGuidance` into `App.tsx` (wrapped by ThemeProvider).
  - [x] 4.2 Ensure it doesn't conflict with other modals.

- [x] **Task 5: Testing** (AC: #1, #2, #3, #4)
  - [x] 5.1 Unit test `use-ios-pwa-detection.ts` with User Agent mocks.
  - [x] 5.2 Test the 7-day logic in isolation.
  - [x] 5.3 Manual: Verify on iOS Simulator or real device (if possible).

## Dev Notes

### Detection Snippet

```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone =
  window.navigator.standalone ||
  window.matchMedia("(display-mode: standalone)").matches;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
```

### UX Requirements

- 44x44px touch targets.
- Clear, high-contrast instructions.
- Tabular figures for step numbers.

## File List

- `src/hooks/use-ios-pwa-detection.ts` (New)
- `src/components/ui/ios-install-guidance.tsx` (New)
- `src/stores/settings-store.ts`
- `src/App.tsx`
- `src/tests/ios-detection.test.ts` (New)

## Change Log

- **Status Update:** backlog -> in-progress
- **Feature:** iOS PWA Installation Guidance
