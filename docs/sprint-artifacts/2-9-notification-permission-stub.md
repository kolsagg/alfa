# Story 2.9: Notification Permission Stub

Status: done

## Story

**As a** developer,
**I want** a notification permission integration point,
**So that** Epic 4 (Notification System) can build on an existing, context-aware user flow.

## Acceptance Criteria

1.  **Given** the user adds their **first** subscription
    **When** the subscription is saved successfully
    **Then** a "Just-in-Time" notification prompt MUST appear.

2.  **One-Time Trigger (CRITICAL):**

    - Prompt MUST only appear **ONCE** per user lifetime.
    - Check: `notificationPermission === "default"` (never asked before).
    - After prompt is shown/dismissed, this flow should NOT trigger again.
    - **FIX (Review):** Added `hasSeenNotificationPrompt` flag to SettingsStore to ensure strict compliance even if all subscriptions are deleted and re-added.

3.  **The Prompt Content:**

    - Message: "{{Subscription Name}} için ödeme hatırlatıcısı kurulsun mu?"
    - Action Button: "Evet, Bildirim Gönder"
    - Cancel Button: "Şimdi Değil"

4.  **Interaction Flow:**

    - **When** user taps "Evet, Bildirim Gönder"
    - **Then** the browser `Notification.requestPermission()` MUST be triggered.
    - **And** the result (`granted`, `denied`, or `default`) MUST be stored in `SettingsStore` via `setNotificationPermission()`.

5.  **Graceful Degradation:**

    - **When** permission is `denied`
    - **Then** a subtle message MUST appear: "Bildirimleri daha sonra Ayarlar'dan açabilirsiniz."
    - **And** user is NOT blocked from continuing.

6.  **iOS Safari Handling (CRITICAL):**

    - **Given** the app is running in iOS Safari (not PWA mode)
    - **When** the prompt is triggered
    - **Then** it MUST NOT call `Notification.requestPermission()` (will fail/no-op).
    - **Instead**, show message: "Bildirimler için lütfen uygulamayı Ana Ekrana ekleyin."
    - **Use:** `detectIOSSafariNonStandalone()` from `src/hooks/use-ios-pwa-detection.ts`.

7.  **Testability:**
    - The stub MUST be testable in isolation without a real service worker.
    - Mock `Notification.requestPermission` in tests.
    - Mock `detectIOSSafariNonStandalone()` for iOS-specific tests.

## Tasks / Subtasks

- [x] **Task 1: Toast-Based Prompt Implementation** (RECOMMENDED APPROACH)
- [x] **Task 2: Permission Logic Helper**
- [x] **Task 3: Trigger Integration (EXACT LOCATION)**
- [x] **Task 4: iOS PWA Detection Integration**
- [x] **Task 5: Testing & Validation**

- [x] **Review Follow-ups (AI)**
  - [x] [AI-Review][HIGH] Add `hasSeenNotificationPrompt` flag to SettingsStore for strict One-Time compliance.
  - [x] [AI-Review][MEDIUM] Improve `setTimeout` trigger logic with unified check in `handleSuccess`.
  - [x] [AI-Review][MEDIUM] Refactor iOS detection call consistency.

## Dev Notes

### 🏗️ Architecture: Just-in-Time Permission Pattern

User research shows that asking for permissions in context (right after adding a subscription) leads to much higher acceptance rates than asking on boot.

**This story is a STUB for Epic 4.** It establishes the permission request flow but does NOT implement scheduling or advanced settings.

### 📱 iOS Constraint (CRITICAL)

iOS only supports the Web Push API if the app is **added to the home screen (PWA mode)** and the user is on iOS 16.4+.

### 🛠️ Technical Implementation Details (Updated)

**Permission Storage:**

- `notificationPermission`: "default" | "granted" | "denied"
- `hasSeenNotificationPrompt`: boolean (New)

**One-Time Protection Log:**

- The prompt sets `hasSeenNotificationPrompt = true` immediately upon appearance, ensuring it never returns regardless of store state or subscription deletions.

## Dev Agent Record

### Context Reference

- `docs/epics.md` / `docs/architecture.md` / `src/hooks/use-ios-pwa-detection.ts` / `src/stores/settings-store.ts`

### Senior Developer Review (AI) - 2025-12-21

**Outcome: Approved (with fixes)**

- **Findings:** Identified 2 High, 4 Medium findings during implementation audit.
- **Fixes Applied:**
  - Added `hasSeenNotificationPrompt` to `SettingsStore` and schema.
  - Updated `AddSubscriptionDialog` to use the new flag.
  - Enhanced unit tests to cover the flag logic.
  - Refactored iOS detection call for consistency.

### Completion Notes

- ✅ Created `src/lib/notification-permission.ts` (helper + prompt).
- ✅ Created `src/lib/notification-permission.test.ts` (11 tests).
- ✅ Integrated prompt in `AddSubscriptionDialog` with 400ms delay.
- ✅ Added persistent flag to `SettingsStore` for one-time trigger compliance.
- ✅ All regression tests passing (199 passed).

### File List

- `src/lib/notification-permission.ts`
- `src/lib/notification-permission.test.ts`
- `src/components/features/subscription/add-subscription-dialog.tsx`
- `src/hooks/use-ios-pwa-detection.ts`
- `src/stores/settings-store.ts`
- `src/types/settings.ts`
- `docs/sprint-artifacts/sprint-status.yaml`

### Agent Model Used

Antigravity v1.0
