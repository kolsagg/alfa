# Story 4.7: Graceful Degradation for Denied/Unavailable

Status: Done

## Story

As a **user who denied notifications or is on an unsupported platform**,
I want **alternative awareness methods when push notifications are unavailable**,
so that **I don't miss payments even without native browser notifications**.

## Acceptance Criteria

### AC1: Persistent "Notifications Off" Banner

**Given** notifications are denied (`notificationPermission: "denied"`) OR unsupported (`Notification.permission === undefined`)
**When** user views the dashboard
**Then** a persistent banner appears with localized text from `notifications.banner.denied`
**And** banner uses warning visual style (amber/yellow) with AlertTriangle icon
**And** banner has a "Bir daha gösterme" dismiss button for permanent hiding
**And** IF the iOS Install Guidance modal is active, the banner is suppressed (Modal has priority)

### AC2: Time-Based Banner Visibility

**Given** notifications were denied
**When** less than 7 days have passed since `notificationPermissionDeniedAt`
**Then** banner shows on every dashboard visit (regardless of payment status)

**Given** more than 7 days have passed since denial
**When** user visits dashboard
**Then** banner only shows if a payment is imminent (≤3 days from `NOTIFICATION_CONFIG.IMMINENT_PAYMENT_DAYS`)

### AC3: Permanent Banner Dismissal

**Given** user sees the notifications-off banner
**When** they click "Bir daha gösterme" (X button)
**Then** `notificationBannerDismissedAt` is set to current ISO timestamp
**And** banner never shows again (until settings reset/import)

### AC4: Countdown Hero Enhanced Visual Emphasis

**Given** notifications are denied OR unavailable
**When** a payment is imminent (≤3 days, matching `IMMINENT_PAYMENT_DAYS`)
**Then** CountdownHero displays:

- A "Persistent Alert Badge" showing localized "notifications.hero.noPush" with AlertTriangle icon
- A subtle ring pulse animation (`ring-2 ring-primary/20 ring-offset-2`)
  **And** badge uses `urgent` color scheme (coral/red)
  **And** animations respect `prefers-reduced-motion` (no animation, just bold border)

### AC5: In-App Imminent Payment Badge Count

**Given** notifications are denied or unavailable
**When** user views the dashboard
**Then** a badge shows count of imminent payments (≤3 days) in the Header
**And** badge uses `role="status"` and `aria-label` for screen readers
**And** badge uses attention/urgent color based on the most urgent payment level
**And** tapping the badge automatically sets the UI `dateFilter` to show these payments

### AC6: Unsupported Browser Handling

**Given** user's browser does not support Notification API
**When** they view notification settings
**Then** toggle is disabled with explanation: "Bu tarayıcı bildirimleri desteklemiyor."
**And** graceful degradation features (AC4-AC5) are active
**And** no permission request is attempted

## Tasks / Subtasks

- [x] **Task 1: Shared Logic & i18n Preparation**

  - [x] [1.1] Create `src/lib/notification/utils.ts` with `isPushNotificationActive()` helper:
        `notificationsEnabled && notificationPermission === 'granted' && isNotificationSupported()`
  - [x] [1.2] Add localized strings to `src/lib/i18n/notifications.ts`:
    - `BANNER_DENIED`: "Bildirimler kapalı — Tarayıcı ayarlarından açabilirsiniz."
    - `HERO_NO_PUSH`: "Push Yok"
    - `BADGE_ARIA_LABEL`: "Yaklaşan ödemeler: {{count}}" (for ARIA)
  - [x] [1.3] Implement `useImminentPayments()` hook in `src/hooks/use-imminent-payments.ts` using a memoized selector to calculate count and threshold.

- [x] **Task 2: Refine NotificationBanner (AC1-AC3)**

  - [x] [2.1] Update `shouldShowNotificationBanner()` in `src/components/features/NotificationBanner/utils.ts` to include unsupported check.
  - [x] [2.2] Modify `NotificationBanner.tsx` to use the new i18n keys instead of hardcoded strings.
  - [x] [2.3] Add priority logic: return `null` if iOS modal is active.

- [x] **Task 3: CountdownHero Polish (AC4)**

  - [x] [3.1] Refactor `isPushActive` in `src/components/dashboard/countdown-hero.tsx` to use the shared util from Task 1.1.
  - [x] [3.2] Update Alert Badge text to use i18n strings (`NOTIFICATION_STRINGS.HERO_NO_PUSH`).
  - [x] [3.3] Implement `prefers-reduced-motion` support using `useReducedMotion` hook.

- [x] **Task 4: Imminent Payments Badge (AC5)**

  - [x] [4.1] Create `src/components/features/ImminentPaymentsBadge/imminent-payments-badge.tsx`.
  - [x] [4.2] Implement `role="status"` and dynamic attention/urgent styling.
  - [x] [4.3] Integration: Tapping uses `uiStore.setDateFilter` with the earliest imminent date.
  - [x] [4.4] Add to `DashboardLayout` Header (only visible when `!isPushActive`).

- [x] **Task 5: Validation & Tests**
  - [x] [5.1] Add unit tests for `useImminentPayments` hook (8 tests).
  - [x] [5.2] Add unit tests for `ImminentPaymentsBadge` (ARIA and Click handlers - 11 tests).
  - [x] [5.3] Verify the "suppress banner if iOS prompt visible" logic in integration tests.
- [x] **Review Follow-ups (AI)**
  - [x] Integrate i18n into NotificationToggle for AC6
  - [x] Refactor NotificationToggle to use isPushNotificationActive utility
  - [x] Enhance ImminentPaymentsBadge to filter multiple dates
  - [x] Correct missing files in story File List

## Dev Notes

### 🏗️ Architecture: Awareness Fallback

We treat "Push" as the primary channel and "In-App UI" as the fallback.
The system should never show redundant warnings: If the user is being prompted to "Install to Home Screen" (iOS), we don't nag them about "Notifications Denied" on the dashboard simultaneously.

### 📂 Revised Structure

```
src/
├── hooks/
│   └── use-imminent-payments.ts       # NEW: Shared selector logic
│   └── use-imminent-payments.test.ts  # NEW: Tests
├── lib/
│   ├── i18n/
│   │   └── notifications.ts           # NEW: Notification i18n strings
│   └── notification/
│       ├── utils.ts                   # NEW: Shared push status checks
│       └── utils.test.ts              # NEW: Tests
├── components/features/
│   ├── ImminentPaymentsBadge/         # NEW: Header count badge
│   │   ├── imminent-payments-badge.tsx
│   │   ├── imminent-payments-badge.test.tsx
│   │   └── index.ts
│   └── NotificationBanner/            # Updated: i18n + priorities
├── components/dashboard/
│   └── countdown-hero.tsx             # Updated: shared util + reduced motion
└── components/layout/
    └── header.tsx                     # Updated: ImminentPaymentsBadge integration
```

### ⚠️ Critical Implementation Notes

1. **Reuse dateFilter**: AC5 click triggers the same filtering logic implemented in Story 4.5 via `uiStore.setDateFilter`.
2. **Selector Performance**: `useImminentPayments` uses `useMemo` to prevent Header re-renders on timer ticks.
3. **i18n first**: Used centralized `src/lib/i18n/notifications.ts` pattern (project doesn't use react-i18next).
4. **Accessibility**: ImminentPaymentsBadge uses `role="status"` and `aria-label` for screen readers.

### 🧪 Testing Strategy

- **Accessibility Test**: Verified screen reader output for `ImminentPaymentsBadge`.
- **Clock Mocking**: Tested 7-day visibility logic in `shouldShowNotificationBanner` with mocked system time.
- **Reduced Motion**: Tested animation suppression when `prefers-reduced-motion` is preferred.

---

## File List

### New Files

- `src/lib/notification/utils.ts` - Shared push notification state utilities
- `src/lib/notification/utils.test.ts` - Unit tests for notification utils
- `src/lib/i18n/notifications.ts` - Centralized notification i18n strings
- `src/hooks/use-imminent-payments.ts` - Hook for imminent payment calculation
- `src/hooks/use-imminent-payments.test.ts` - Unit tests for imminent payments hook
- `src/components/features/ImminentPaymentsBadge/imminent-payments-badge.tsx` - Badge component
- `src/components/features/ImminentPaymentsBadge/imminent-payments-badge.test.tsx` - Badge tests
- `src/components/features/ImminentPaymentsBadge/index.ts` - Barrel export

### Modified Files

- `src/components/features/NotificationBanner/utils.ts` - Added unsupported browser check and iOS modal priority
- `src/components/features/NotificationBanner/notification-banner.tsx` - Added i18n and iOS modal suppression
- `src/components/features/NotificationBanner/notification-banner.test.tsx` - Extended tests for Story 4.7
- `src/components/dashboard/countdown-hero.tsx` - Refactored to use shared util, added reduced motion
- `src/components/dashboard/countdown-hero.test.tsx` - Extended tests for reduced motion
- `src/components/features/NotificationSettings/notification-toggle.tsx` - Updated to use i18n and shared notification utilities
- `src/components/features/subscription/subscription-list.tsx` - Updated to handle multi-date filtering logic and UI
- `src/lib/subscription-list-utils.ts` - Added multi-date support for filterByDate
- `src/components/layout/header.tsx` - Added ImminentPaymentsBadge integration
- `src/components/layout/dashboard-layout.test.tsx` - Added mocks for proper testing
- `src/components/features/NotificationSettings/notification-toggle.tsx` - Updated to use i18n and shared notification utilities
- `docs/sprint-artifacts/sprint-status.yaml` - Updated status
- `src/components/features/subscription/subscription-list.tsx` - Updated to handle multi-date filtering logic and UI
- `src/lib/subscription-list-utils.ts` - Added multi-date support for filterByDate
- `src/stores/ui-store.ts` - Date filter storage
- `src/components/ui/ios-install-guidance.tsx` - Standalone detection logic
- `src/lib/notification-permission.ts` - Browser permission helpers
- `src/services/notification-dispatcher.ts` - Scheduling orchestration
- `src/stores/notification-schedule-store.ts` - Schedule persistence

---

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-4.7`
- `docs/sprint-artifacts/4-5-grouped-notifications-same-day.md` (Filtering logic)
- `src/config/notifications.ts`

### Agent Model Used

Gemini Antigravity (2025-12-23)

### Implementation Plan

1. Created shared utilities and i18n strings (Task 1)
2. Updated NotificationBanner for unsupported browsers and iOS modal priority (Task 2)
3. Refactored CountdownHero to use shared utils and added prefers-reduced-motion support (Task 3)
4. Created ImminentPaymentsBadge component with full accessibility (Task 4)
5. Added comprehensive unit tests covering all acceptance criteria (Task 5)

### Completion Notes

✅ **All acceptance criteria verified:**

- AC1: Persistent banner with localized text, warning style, and dismiss button
- AC2: Time-based visibility logic (7 days since denial → imminent payment check)
- AC3: Permanent banner dismissal via `notificationBannerDismissedAt`
- AC4: CountdownHero alert badge with prefers-reduced-motion support
- AC5: ImminentPaymentsBadge in Header with urgency colors and filter integration
- AC6: Unsupported browser handling included in visibility logic

**Test Summary:**

- 69 tests specific to this story, all passing
- 530 total tests passing, full regression suite green
- Lint checks passing

---

## Change Log

| Date       | Change                                              |
| ---------- | --------------------------------------------------- |
| 2025-12-23 | Story implementation complete - All tasks completed |

---

## Status

Status: Done
