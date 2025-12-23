# Story 4.6: iOS PWA Install Prompt

Status: done

## Story

As an **iOS user**,
I want **clear guidance to install the PWA when I try to enable notifications**,
so that **I can receive payment reminders on my iOS device**.

## Acceptance Criteria

### AC1: iOS Safari Detection

**Given** user is browsing on iOS Safari (not in standalone PWA mode)
**When** they try to enable notifications in settings
**Then** the system detects iOS Safari using `navigator.standalone` and `display-mode: standalone` media query
**And** detects Safari via user-agent pattern `/^((?!chrome|android|crios|fxios).)*safari/i`

### AC2: Install Guidance Modal

**Given** iOS Safari detection returns true (non-standalone)
**When** user toggles notifications ON
**Then** a modal appears with title "Bildirimler için Ana Ekrana Ekle"
**And** modal includes explanation: "Notifications require installing the app"
**And** modal content is in user's preferred language (Turkish default, English fallback)

### AC3: Step-by-Step Visual Instructions

**Given** install guidance modal is open
**When** user views the instructions
**Then** instructions show numbered steps with:

- Step 1: "Safari'de 'Paylaş' simgesine dokunun" with Share icon (📤)
- Step 2: "'Ana Ekrana Ekle' seçeneğini seçin" with PlusSquare icon
  **And** a guidance image/screenshot is displayed at `NOTIFICATION_CONFIG.ASSETS.IOS_GUIDANCE`
  **And** icons use lucide-react (Share, PlusSquare) for consistent styling

### AC4: "I've Installed It" Button

**Given** user sees the install guidance modal
**When** they click "Kurdum" button
**Then** system re-checks `detectIOSSafariNonStandalone()`
**And** if now in standalone mode, modal auto-closes
**And** if still in Safari, dismisses with 7-day snooze and toast feedback from locale constants

### AC5: "Remind Me Later" Button

**Given** user sees the install guidance modal
**When** they click "Sonra" button
**Then** `lastIOSPromptDismissed` is set to current ISO timestamp
**And** modal closes
**And** modal won't reappear for `NOTIFICATION_CONFIG.IOS_PROMPT_RESIDENCY_DAYS` (7 days)

### AC6: Auto-Dismiss on Install Detection

**Given** install guidance modal is open (in either "Automatic" or "Settings" mode)
**When** app detects transition to standalone PWA mode
**Then** the change is detected via `matchMedia('(display-mode: standalone)')` change listener OR `visibilitychange` focus event
**And** modal automatically dismisses without user interaction
**And** a success toast is shown using localized strings

### AC7: Locale-Aware Content

**Given** user opens the install guidance modal
**When** modal renders
**Then** all text content, including toasts, uses Turkish (primary)
**And** strings are sourced from a centralized i18n constants file
**And** generic icons (lucide-react) are used instead of locale-specific screenshots
**And** future English localization is supported via i18n-ready structure

## Tasks / Subtasks

- [x] **Task 1: Intelligent Auto-Dismiss Listener (AC: #6)**

  - [x] 1.1 Implement a `useEffect` in `IOSInstallGuidance` that initializes a `matchMedia('(display-mode: standalone)')` listener
  - [x] 1.2 Add a secondary check on `visibilitychange` to ensure dismissal if the app resumes directly in PWA mode
  - [x] 1.3 When transition is detected, call `handleClose()` and clear state
  - [x] 1.4 Show success toast using `INSTALL_SUCCESS` string from the new i18n file
  - [x] 1.5 Implement comprehensive test cases for auto-dismissal triggered by both media query change and visibility change
  - [x] 1.6 Ensure the listener is properly cleaned up on unmount or when `isOpen` changes

- [x] **Task 2: Enhanced Feedback on Install Check (AC: #4)**

  - [x] 2.1 Update `handleInstallConfirm` to show a localized toast if `detectIOSSafariNonStandalone()` still returns true
  - [x] 2.2 Use `INSTALL_PENDING_GUIDANCE` string for the error toast
  - [x] 2.3 Keep modal open to allow user to try again
  - [x] 2.4 Implement unit tests verifying toast feedback when install check fails

- [x] **Task 3: Locale-Ready Text Infrastructure (AC: #7)**

  - [x] 3.1 Create `src/lib/i18n/ios-install-guidance.ts` containing all modal strings (Title, Description, Steps, Buttons, Toasts)
  - [x] 3.2 Add Turkish constants and include English translations as comments for future-proofing
  - [x] 3.3 Update `IOSInstallGuidance` to import all UI text and toast messages from this locale file
  - [x] 3.4 Implement a validation test ensuring that no hardcoded Turkish strings remain in the component

- [x] **Task 4: Accessibility Compliance (AC: #3)**
  - [x] 4.1 Update the `Dialog` configuration to ensure proper `aria-labelledby` and `aria-describedby` references
  - [x] 4.2 Add `aria-live="polite"` to the step container to announce visual changes to screen readers
  - [x] 4.3 Verify all interactive elements (buttons, close icon) have minimum 44x44px touch targets
  - [x] 4.4 Verify keyboard focus management (Escape to close, focus trap) is fully functional

## Dev Notes

### 🏗️ Architecture: Core Guardrails

This story extends the existing `IOSInstallGuidance` component (which already handles basic detection and display).

**Key Implementation Pattern:**

```typescript
useEffect(() => {
  if (!isOpen) return;
  const mediaQuery = window.matchMedia("(display-mode: standalone)");

  const checkInstall = (e?: MediaQueryListEvent | Event) => {
    if (mediaQuery.matches) {
      toast.success(IOS_STRINGS.TOAST_SUCCESS);
      handleClose();
    }
  };

  // 1. Media Query Listener (modern + fallback)
  mediaQuery.addEventListener?.("change", checkInstall) ||
    mediaQuery.addListener?.(checkInstall);

  // 2. Focus Check (robustness for OS-level app switching)
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkInstall();
  });

  return () => {
    mediaQuery.removeEventListener?.("change", checkInstall) ||
      mediaQuery.removeListener?.(checkInstall);
    window.removeEventListener("visibilitychange", checkInstall);
  };
}, [isOpen, handleClose]);
```

### 📂 File Structure (Targets)

- `src/components/ui/ios-install-guidance.tsx` - **(Modify)** Add auto-dismiss logic and i18n integration
- `src/lib/i18n/ios-install-guidance.ts` - **(New)** Centralized strings
- `src/components/ui/ios-install-guidance.test.tsx` - **(Modify)** Add Story 4.6 regression and edge-case tests

### 🧪 Testing Strategy

1. **Auto-Dismiss:** Mock `matchMedia` and trigger 'change' event. Verify `handleClose` and `toast.success` calls.
2. **Visibility Check:** Mock `document.visibilityState` and trigger `visibilitychange`.
3. **i18n:** Verify `screen.getByText` calls use exported constants from the new lib file.
4. **Residency:** Ensure the 7-day snooze logic in `useIOSPWADetection` remains intact during these changes.

### Previous Story Learnings

- **Story 4.2:** Established the `triggeredBySettings` property. Ensure this logic isn't broken when adding the auto-dismiss listener.
- **Story 1.4:** Standardized `NOTIFICATION_CONFIG.IOS_PROMPT_RESIDENCY_DAYS`. Always reference this config for snooze timing.

---

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-4.6`
- `docs/ux-design-specification.md#iOS-Install-Prompt`
- `src/components/ui/ios-install-guidance.tsx`

### Implementation Plan

Story 4.6 implements iOS PWA install prompt enhancements with:

1. **Auto-dismiss listener** using matchMedia API and visibilitychange event
2. **Enhanced feedback** via toast messages for install check results
3. **Centralized i18n** with all strings in a dedicated locale file
4. **Accessibility compliance** with proper ARIA attributes and touch targets

### Debug Log

- No issues encountered during implementation
- All 23 tests pass for ios-install-guidance.test.tsx
- Full regression suite passes (493/493 tests)
- Lint passes with 0 warnings

### File List

**New Files:**

- `src/lib/i18n/ios-install-guidance.ts` - Centralized i18n strings

**Modified Files:**

- `src/components/ui/ios-install-guidance.tsx` - Added auto-dismiss, toast feedback, i18n integration, ARIA attributes
- `src/components/ui/ios-install-guidance.test.tsx` - Comprehensive Story 4.6 tests

### Change Log

- 2025-12-23: Story 4.6 implementation complete
  - Implemented auto-dismiss via matchMedia and visibilitychange (AC#6)
  - Added toast feedback for install check (AC#4)
  - Created centralized i18n file with Turkish strings (AC#7)
  - Enhanced accessibility with ARIA attributes and 44px touch targets (AC#3)
  - Added 23 comprehensive tests covering all acceptance criteria

### Completion Notes

- 2025-12-23: Initial story created.
- 2025-12-23: Validated and optimized - added `visibilitychange` check, i18n toast integration, and implementation pattern guards for LLM Dev Agent.
- 2025-12-23: **Story 4.6 COMPLETE** - All 4 tasks and all acceptance criteria satisfied. 23 unit tests pass, full regression suite (493 tests) passes, lint clean.
- 2025-12-23: **Code Review Fixes**: Adhered strictly to AC4 by ensuring modal dismisses with 7-day snooze if install check fails in Safari. Fixed `toast.info` availability in tests. Updated `handleInstallConfirm` dependency array.
