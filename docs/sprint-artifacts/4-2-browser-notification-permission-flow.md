# Story 4.2: Browser Notification Permission Flow

Status: Done

## Story

As a **user**,
I want **to grant notification permission when I enable notifications in settings**,
so that **I can receive payment reminders before my subscriptions renew**.

## Acceptance Criteria

### AC1: Settings Toggle Triggers Permission Request

**Given** user has not granted notification permission (`notificationPermission: "default"`)
**When** they toggle "Enable Notifications" ON in Settings
**Then** the browser's native permission prompt appears
**And** no duplicate prompts are shown if one is already pending

### AC2: Permission Granted Flow

**Given** user clicks "Allow" on the browser permission prompt
**When** permission is granted
**Then** `notificationPermission` updates to `"granted"` in SettingsStore
**And** a success toast shows: "Bildirimler aktif! Ödeme hatırlatıcıları artık size gönderilecek."
**And** the settings UI updates to show enabled state (green indicator/checkmark)

### AC3: Permission Denied Flow

**Given** user clicks "Block" or "Deny" on the browser permission prompt
**When** permission is denied
**Then** `notificationPermission` updates to `"denied"` in SettingsStore
**And** `notificationPermissionDeniedAt` is set to current ISO timestamp
**And** an info toast shows: "Bildirimleri daha sonra tarayıcı ayarlarından açabilirsiniz."
**And** the settings UI shows disabled state with recovery guidance (steps to enable in browser settings)

### AC4: Graceful Degradation Banner (Dashboard)

**Given** notifications are denied (`notificationPermission: "denied"`)
**When** user views the dashboard
**Then** a persistent banner appears: "Bildirimler kapalı — Tarayıcı ayarlarından açabilirsiniz."
**And** banner includes an "info" icon for accessibility (not color-only)
**And** banner shows for first 7 days after `notificationPermissionDeniedAt`
**And** after 7 days, banner only shows if a payment is imminent (≤3 days - uses `getUrgencyLevel`)
**And** user can click "Bir daha gösterme" to permanently hide banner (sets `notificationBannerDismissedAt`)

### AC5: iOS Safari Detection and PWA Guidance

**Given** user is on iOS Safari (not standalone PWA mode)
**When** they try to enable notifications
**Then** a modal appears instead of browser permission: "Bildirimler için Ana Ekrana Ekle"
**And** modal contains step-by-step instructions with Safari icon references
**And** modal has "Kurdum" and "Sonra" buttons
**And** detection uses `window.matchMedia('(display-mode: standalone)')` + user-agent check

### AC6: Permission Already Granted State

**Given** user has already granted permission in a previous session
**When** they view notification settings
**Then** toggle shows enabled state
**And** no permission request is triggered
**And** "Bildirimler aktif ✓" indicator is visible

### AC7: Browser Without Notification Support

**Given** user's browser does not support Notification API
**When** they view notification settings
**Then** toggle is disabled with explanation: "Bu tarayıcı bildirimleri desteklemiyor."
**And** graceful degradation applies: `CountdownHero` adds a "Persistent Alert Badge" and "Pulse Animation" for imminent payments to emphasize awareness without push notifications.

## Tasks / Subtasks

- [x] **Task 1: Notification Toggle Component (AC: #1, #2, #3, #6, #7)**

  - [x] 1.1 Create `src/components/features/NotificationSettings/notification-toggle.tsx`
  - [x] 1.2 Use Switch from shadcn/ui with proper labeling
  - [x] 1.3 Integrate with `useSettingsStore` for `notificationsEnabled` and `notificationPermission`
  - [x] 1.5 Handle permission request on toggle ON when permission is "default"
  - [x] 1.6 Handle "denied" state: show toast/popover with "How to enable" browser-specific instructions
  - [x] 1.7 Handle already-granted state (no prompt needed)
  - [x] 1.8 Handle unsupported browser (disabled toggle with explanation)
  - [x] 1.9 Add loading state during permission request
  - [x] 1.10 Create `src/components/features/NotificationSettings/notification-toggle.test.tsx`

- [x] **Task 2: Permission Request Integration (AC: #1, #2, #3)**

  - [x] 2.1 Extend `src/lib/notification-permission.ts` with `requestAndUpdatePermission()` function
  - [x] 2.2 Function should update SettingsStore with result and `notificationPermissionDeniedAt` if denied
  - [x] 2.3 Show appropriate toast based on result
  - [x] 2.4 Return boolean for success/failure for UI state
  - [x] 2.5 Update `src/lib/notification-permission.test.ts` with new tests

- [x] **Task 3: Graceful Degradation Banner (AC: #4)**

  - [x] 3.1 Create `src/components/features/NotificationBanner/notification-banner.tsx`
  - [x] 3.2 Implement `shouldShowNotificationBanner(settings, nextPayment)` helper logic
  - [x] 3.3 Visibility logic: IsDenied && (!Dismissed) && (Within7Days || ImminentPayment)
  - [x] 3.4 Add "Bir daha gösterme" functionality (persist in SettingsStore)
  - [x] 3.5 Use accessible design (icon + text, not color only)
  - [x] 3.6 Integrate into `DashboardLayout`
  - [x] 3.7 Create `src/components/features/NotificationBanner/notification-banner.test.tsx`

- [x] **Task 4: iOS PWA Modal (AC: #5)**

  - [x] 4.1 Refactor `src/components/ui/ios-install-guidance.tsx` to support `triggeredBySettings` mode
  - [x] 4.2 Update UI to show step-by-step instructions with Safari share icon references
  - [x] 4.3 "Kurdum" button → re-check standalone mode → close if PWA
  - [x] 4.4 "Sonra" button → dismiss (save timestamp for 7-day snooze)
  - [x] 4.5 Ensure detection uses `window.matchMedia('(display-mode: standalone)')`
  - [x] 4.6 Create/Update `src/components/ui/ios-install-guidance.test.tsx`

- [x] **Task 5: Settings Page Integration (AC: #1, #6)** _(Partial - components ready, no Settings page in app yet)_

  - [x] 5.1 Add `NotificationToggle` component ready for Settings page integration
  - [x] 5.2 Show permission status indicator (granted/denied/default) - implemented in NotificationToggle
  - [N/A] 5.3 Add "Notification time" picker (existing from 4.1) - requires Settings page
  - [N/A] 5.4 Add "Days before" selector (existing from 4.1) - requires Settings page

- [x] **Task 6: Store Extensions (AC: #4)**
  - [x] 6.1 Add `notificationBannerDismissedAt: string | undefined` to SettingsSchema
  - [x] 6.2 Add `notificationPermissionDeniedAt: string | undefined` to SettingsSchema
  - [x] 6.3 Add `dismissNotificationBanner()` action to SettingsStore
  - [x] 6.4 Increment schema version to 4 with migration logic for new fields
  - [x] 6.5 Update `src/types/settings.ts` with new fields
  - [x] 6.6 Update `src/stores/settings-store.test.ts` with migration tests

## Dev Notes

### 🏗️ Architecture: Just-in-Time Permission Pattern

This story implements the "Just-in-Time Permission" pattern from UX spec:

1. DON'T ask for permission on first app load
2. DO ask when user explicitly enables notifications in settings (contextual)
3. Result: Higher permission grant rates due to context

#### 📊 Permission State Matrix

| Store State (`notificationPermission`) | Browser State (`Notification.permission`) | Action on Toggle ON                | UI Feedback                                        |
| -------------------------------------- | ----------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| `"default"`                            | `"default"`                               | `Notification.requestPermission()` | Success Toast or Recovery Info                     |
| `"granted"`                            | `"granted"`                               | No action                          | "Bildirimler aktif ✓" indicator                    |
| `"denied"`                             | `"denied"`                                | No action                          | Show "How to enable" settings guide                |
| `"default"`                            | `"denied"` (out of sync)                  | No action                          | Show "How to enable" settings guide + Update Store |

**Graceful Degradation Logic:**
`showBanner = isDenied && !isDismissed && (isWithin7Days || isImminent)`

- `isWithin7Days`: Current time - `notificationPermissionDeniedAt` < 7 days
- `isImminent`: `getUrgencyLevel(nextPayment) === "urgent" || "critical"` (≤3 days)

### 📂 File Structure

```
src/
├── components/features/
│   ├── NotificationSettings/
│   │   ├── notification-toggle.tsx
│   │   ├── notification-toggle.test.tsx
│   │   └── index.ts
│   ├── NotificationBanner/
│   │   ├── notification-banner.tsx
│   │   ├── notification-banner.test.tsx
│   │   └── index.ts
│   └── IOSInstallPrompt/
│       ├── ios-install-prompt.tsx (refactored)
│       ├── ios-install-prompt.test.tsx
│       └── index.ts
├── lib/
│   ├── notification-permission.ts (modified)
│   └── notification-permission.test.ts (modified)
├── stores/
│   ├── settings-store.ts (modified - v4)
│   └── settings-store.test.ts (modified)
└── types/
    └── settings.ts (modified)
```

### ⚠️ Critical Implementation Notes

1. **NEVER** show permission prompt on app load.
2. **DO** use `Notification.requestPermission()` only from direct user interaction.
3. **DENIAL TRACKING**: Always set `notificationPermissionDeniedAt` when browser returns "denied".
4. **SAFARI MODAL**: Visual cues MUST refer to the Share icon 📤 (rectangle with arrow up) at the bottom of the screen.
5. **BANNER SENSITIVITY**: Banner must disappear immediately when permission becomes "granted".

### 🔧 Existing Code to Reference

- **Permission Helper:** `src/lib/notification-permission.ts` - Already has `requestNotificationPermission()` and toast logic
- **iOS Detection:** `src/hooks/use-ios-pwa-detection.ts` - Has `detectIOSSafariNonStandalone()`
- **Settings Store:** `src/stores/settings-store.ts` - v3 with notification settings from Story 4.1
- **iOS Prompt:** `src/components/features/IOSInstallPrompt/` - Existing component to extend or reference

### 🧪 Testing Strategy

```typescript
// Test scenarios for notification-toggle.test.tsx
describe("NotificationToggle", () => {
  it("should request permission when toggled ON with default permission");
  it("should NOT request permission when already granted");
  it("should show iOS modal when on iOS Safari");
  it("should disable toggle when Notification API unavailable");
  it("should update store on permission result");
  it("should show loading state during permission request");
});

// Test scenarios for notification-banner.test.tsx
describe("NotificationBanner", () => {
  it("should show when permission denied");
  it("should hide after 7 days if no imminent payment");
  it("should show after 7 days if payment within 3 days");
  it('should hide permanently when "Bir daha gösterme" clicked');
  it("should include accessible icon (not color-only)");
});
```

### 🎨 UX Requirements from ux-design-specification.md

**Banner Design:**
| State | Color | Icon | Behavior |
|-------|-------|------|----------|
| Denied | Warning yellow/amber | ⚠️ info | Dismissible |
| iOS non-PWA | Info blue | 📱 phone | Persistent until installed |

**Accessibility:**

- 44x44px touch targets on all buttons
- Icon + text for status (not color alone)
- `aria-live="polite"` for banner updates

### Previous Story Learnings (4.1)

- **Validation Pattern:** All settings updates go through Zod validation
- **Rejection over Fallback:** Invalid data is rejected, not silently fixed
- **Store Version:** Currently at v3, this story bumps to v4
- **Test Coverage:** 25 tests in settings-store.test.ts - maintain coverage

### Git History Context (Last 5 Commits)

- `8b74891` iOS Safari crypto.randomUUID() compatibility + retrospective
- `4aff561` Stories 3.4 & 3.5 - subscription list & category breakdown
- Previous epic 3 work focused on dashboard and analytics

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-4.2`
- `docs/architecture.md#Cross-Cutting-Concerns` (Notification Permission Management)
- `docs/ux-design-specification.md#Just-in-Time-Permission-Flow`
- `docs/sprint-artifacts/4-1-notification-settings-slice.md` (Previous story)

### Agent Model Used

Antigravity v1.0

### Debug Log References

- Lint: 0 errors, 1 warning (pre-existing TanStack Virtual issue)
- Build: Success
- Tests: 400 passed, 3 skipped (50+ new tests added for Story 4.2)

### Completion Notes

- ✅ **Task 6 (Store)**: Schema v4 with `notificationPermissionDeniedAt`, `notificationBannerDismissedAt`, `dismissNotificationBanner()` action, migration logic
- ✅ **Task 2 (Permission)**: `requestAndUpdatePermission()` with toast feedback, `isNotificationSupported()`, `getBrowserNotificationPermission()` helpers
- ✅ **Task 1 (Toggle)**: NotificationToggle component with permission request, iOS detection, loading states, accessibility support (11 tests)
- ✅ **Task 3 (Banner)**: NotificationBanner with 7-day visibility logic, imminent payment check, permanent dismissal (12 tests)
- ✅ **Task 4 (iOS Modal)**: IOSInstallGuidance refactored with `triggeredBySettings` mode, "Kurdum"/"Sonra" buttons (11 tests)
- ✅ **Task 5 (Integration)**: NotificationBanner integrated into DashboardLayout; NotificationToggle ready for future Settings page
- ⚠️ **Note**: No Settings page exists in app yet. Task 5.3/5.4 (time/days pickers) marked N/A - components are ready for future Settings page implementation.

### File List

- `src/components/features/NotificationSettings/notification-toggle.tsx` (new)
- `src/components/features/NotificationSettings/notification-toggle.test.tsx` (new)
- `src/components/features/NotificationSettings/index.ts` (new)
- `src/components/features/NotificationBanner/notification-banner.tsx` (new)
- `src/components/features/NotificationBanner/notification-banner.test.tsx` (new)
- `src/components/features/NotificationBanner/utils.ts` (modified - uses NOTIFICATION_CONFIG)
- `src/components/features/NotificationBanner/index.ts` (new)
- `src/components/features/settings/settings-sheet.tsx` (new - Party Mode consensus)
- `src/components/features/settings/index.ts` (new)
- `src/components/ui/sheet.tsx` (new - shadcn component)
- `src/components/ui/ios-install-guidance.tsx` (modified - added triggeredBySettings mode, uses NOTIFICATION_CONFIG)
- `src/components/ui/ios-install-guidance.test.tsx` (new)
- `src/components/layout/dashboard-layout.tsx` (modified - added NotificationBanner, SettingsSheet, BottomNav handler)
- `src/components/layout/dashboard-layout.test.tsx` (new - integration tests)
- `src/components/dashboard/countdown-hero.tsx` (modified - AC7 graceful degradation badge)
- `src/components/dashboard/countdown-hero.test.tsx` (modified - AC7 tests)
- `src/config/notifications.ts` (new - centralized notification config)
- `src/hooks/use-ios-pwa-detection.ts` (modified - uses NOTIFICATION_CONFIG)
- `src/lib/notification-permission.ts` (modified - added requestAndUpdatePermission, helpers)
- `src/lib/notification-permission.test.ts` (modified - 11 new tests)
- `src/stores/settings-store.ts` (modified - v3 → v4)
- `src/stores/settings-store.test.ts` (modified - 5 new tests)
- `src/types/settings.ts` (modified - 2 new fields)
- `docs/epics.md` (modified - added Epic 8)

### Change Log

- 2025-12-22: Story created by create-story workflow - comprehensive developer guide for browser notification permission flow
- 2025-12-22: Story implementation complete - all 6 tasks done, 50+ new tests, schema v4, NotificationToggle/Banner components ready
- 2025-12-22: Code review completed with following fixes:
  - ✅ AC7 Graceful Degradation: Added "Alert" badge + ring pulse to CountdownHero for imminent payments without notifications
  - ✅ Notification Toggle Sync: Added toast warning when permission revoked externally
  - ✅ Dashboard Integration Test: Added notification banner visibility tests
  - ✅ Centralized Config: Created `src/config/notifications.ts` for constants
  - ✅ iOS Guidance Path: Changed hardcoded path to use NOTIFICATION_CONFIG.ASSETS
  - ✅ Persistent Success State: NotificationToggle shows "İzin verildi" when granted
  - ✅ Settings Sheet: Created SettingsSheet component (Party Mode consensus) with NotificationToggle integration
  - ✅ Bottom Nav: Connected navigation handler to open SettingsSheet
  - ✅ Epic 8: Added Navigation & Settings Infrastructure epic to backlog
