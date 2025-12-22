# Story 4.3: Notification Scheduling Logic

Status: Done

## Story

As a **system**,
I want **to schedule notifications based on subscription data**,
so that **users are reminded before payments**.

> **⚠️ Scope Note:** This story is responsible for **CALCULATING** and **STORING** the schedule. It DOES NOT handle the actual _display_ or _firing_ of notifications (that is Story 4.4).

## Acceptance Criteria

### AC1: Notification Scheduling Based on Settings

**Given** user has subscriptions and notifications enabled (`notificationsEnabled: true`, `notificationPermission: "granted"`)
**When** the app calculates notification schedule
**Then** notifications are scheduled for X days before each payment (user configurable via `notificationDaysBefore`)
**And** notification time matches user preference (`notificationTime`, e.g., "09:00")
**And** schedule is computed on app load and on subscription/settings changes

### AC2: Schedule Recalculation on Changes

**Given** an active notification schedule exists
**When** subscriptions change (add/update/delete)
**Then** schedule recalculates automatically
**And** when notification settings change (days before, time, enabled toggle)
**Then** schedule recalculates automatically
**And** recalculation is debounced (max 1x per 500ms) to prevent rapid updates

### AC3: Schedule Persistence

**Given** a notification schedule has been calculated
**When** user closes and reopens the app
**Then** schedule is persisted in localStorage for recovery
**And** schedule schema includes: `{ subscriptionId, scheduledFor, paymentDueAt, notifiedAt? }`
**And** persistence key follows naming convention: `subtracker-notification-schedule` (prod) / `subtracker-notification-schedule-dev` (dev)

### AC4: DST and Timezone Handling

**Given** user is in Europe/Istanbul timezone
**When** schedule crosses DST transition (March/October)
**Then** scheduled times remain at user-specified local time (e.g., 09:00 stays 09:00)
**And** schedule logic uses date-fns with proper timezone handling
**And** leap year dates (Feb 29) are handled correctly

### AC5: Newly Added Subscriptions with Imminent Payments

**Given** user enables notifications and adds a new subscription
**When** the next payment is within `notificationDaysBefore` (e.g., payment in 2 days, daysBefore=3)
**Then** notification is scheduled for today at user's preferred time
**And** if today's time has passed, notification schedules for next available slot (tomorrow at preferred time or immediately set to `new Date()` if urgent/overdue)

### AC6: Foreground-Only Constraint

**Given** this is a pure client-side PWA without service worker push
**When** notifications are scheduled
**Then** they only fire when app/PWA tab is open or in background (browser-dependent)
**And** clear documentation in code notes this limitation
**And** this is explicitly a foreground-based scheduling (no server push)

### AC7: Unit Testing Requirements

**Given** the notification scheduling logic
**When** tests are run
**Then** the following must be covered:

- Schedule calculation for various `notificationDaysBefore` values (1, 3, 7, 30)
- Recalculation triggers (subscription CRUD, settings change)
- DST transitions with Europe/Istanbul timezone
- Leap year edge cases
- Imminent payment handling (< daysBefore remaining)
- Schedule persistence and recovery

## Tasks / Subtasks

- [x] **Task 1: Define NotificationSchedule Types (AC: #3)**

  - [x] 1.1 Create `src/types/notification-schedule.ts`
  - [x] 1.2 Define `NotificationScheduleEntry` Zod schema: `{ subscriptionId, scheduledFor, paymentDueAt, notifiedAt? }`
  - [x] 1.3 Define `NotificationSchedule` as array type
  - [x] 1.4 Export types with `z.infer<>`

- [x] **Task 2: Create Scheduling Utility Functions (AC: #1, #4, #5)**

  - [x] 2.1 Create `src/lib/notification-scheduling.ts`
  - [x] 2.2 Implement `calculateScheduledTime(nextPaymentDate, daysBefore, notifyTime)`
  - [x] 2.3 Handle DST with date-fns `set()` + timezone consideration
  - [x] 2.4 Implement `calculateNotificationSchedule(subscriptions, settings)`
  - [x] 2.5 Handle imminent payments: if payment within daysBefore, schedule for soonest valid slot
  - [x] 2.6 Only include active subscriptions with future payment dates
  - [x] 2.7 Create `src/lib/notification-scheduling.test.ts` with comprehensive coverage

- [x] **Task 3: Create NotificationSchedule Store (AC: #2, #3)**

  - [x] 3.1 Create `src/stores/notification-schedule-store.ts`
  - [x] 3.2 Implement `useNotificationScheduleStore` with persist middleware
  - [x] 3.3 State: `schedule: NotificationScheduleEntry[]`, `lastCalculatedAt: string`
  - [x] 3.4 Actions: `updateSchedule(entries)`, `markAsNotified(subscriptionId)`, `clearSchedule()`
  - [x] 3.5 Add version 1 with migration placeholder
  - [x] 3.6 Create `src/stores/notification-schedule-store.test.ts`

- [x] **Task 4: Create Schedule Sync Hook (AC: #2)**

  - [x] 4.1 Create `src/hooks/use-notification-schedule-sync.ts`
  - [x] 4.2 Subscribe to `useSubscriptionStore` and `useSettingsStore` changes
  - [x] 4.3 Debounce recalculation (500ms)
  - [x] 4.4 Check preconditions: `notificationsEnabled && notificationPermission === "granted"`
  - [x] 4.5 On precondition fail, clear schedule
  - [x] 4.6 Create `src/hooks/use-notification-schedule-sync.test.ts`

- [x] **Task 5: Integrate with App (AC: #1, #6)**

  - [x] 5.1 Add `useNotificationScheduleSync()` hook call in `App.tsx` or `DashboardLayout.tsx`
  - [x] 5.2 Add console logging for schedule updates (dev only)
  - [x] 5.3 Add JSDoc documenting foreground-only limitation

- [x] **Task 6: Update Notification Config (AC: #5)**
  - [x] 6.1 Add `DEFAULT_NOTIFICATION_TIME: "09:00"` to `NOTIFICATION_CONFIG`
  - [x] 6.2 Add `SCHEDULE_DEBOUNCE_MS: 500` to `NOTIFICATION_CONFIG`

## Dev Notes

### 🏗️ Architecture: Foreground-Only Scheduling

**CRITICAL**: This is NOT a server-push notification system. SubTracker uses foreground-based scheduling:

1. Schedule is calculated when app is open
2. Notifications fire only when browser tab is open/background (browser-dependent)
3. Service worker handles caching, NOT notification dispatch
4. Story 4.8 will handle "missed notifications" recovery on app open

```
┌────────────────────────────────────────────────────────┐
│                    User Opens App                       │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         useNotificationScheduleSync()           │   │
│  │    Subscribes to: SubscriptionStore, Settings   │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │        calculateNotificationSchedule()          │   │
│  │    Input: subscriptions[], settings             │   │
│  │    Output: NotificationScheduleEntry[]          │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │       NotificationScheduleStore (persisted)     │   │
│  │    schedule[], lastCalculatedAt                 │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
│           Story 4.4: Notification Display              │
└────────────────────────────────────────────────────────┘
```

### 📂 File Structure

```
src/
├── types/
│   └── notification-schedule.ts (new)
├── lib/
│   ├── notification-scheduling.ts (new)
│   └── notification-scheduling.test.ts (new)
├── stores/
│   ├── notification-schedule-store.ts (new)
│   └── notification-schedule-store.test.ts (new)
├── hooks/
│   ├── use-notification-schedule-sync.ts (new)
│   └── use-notification-schedule-sync.test.ts (new)
├── config/
│   └── notifications.ts (modified)
└── App.tsx (modified - hook integration)
```

### ⚠️ Critical Implementation Notes

1. **ALWAYS check preconditions** before scheduling:

   - `notificationsEnabled === true` (master toggle)
   - `notificationPermission === "granted"` (browser permission)
   - If either is false, schedule should be empty

2. **Debounce recalculation** to prevent excessive updates during rapid changes

3. **Filter subscriptions** before scheduling:

   - Only `isActive === true`
   - Only future `nextPaymentDate`

4. **Schedule format**:

   ```typescript
     subscriptionId: string; // UUID of subscription
     scheduledFor: string; // ISO datetime when notification should fire
     paymentDueAt: string; // ISO datetime of the actual payment (for recovery context)
     notifiedAt?: string; // ISO datetime when notification was actually shown
   }
   ```

5. **DST Handling**: Use date-fns `set()` to set time components, which respects local timezone:

   ```typescript
   import { set, subDays } from "date-fns";

   function calculateScheduledTime(
     nextPaymentDate: string,
     daysBefore: number,
     notifyTime: string // "HH:mm"
   ): Date {
     const [hours, minutes] = notifyTime.split(":").map(Number);
     const paymentDate = new Date(nextPaymentDate);
     const notifyDate = subDays(paymentDate, daysBefore);
     return set(notifyDate, { hours, minutes, seconds: 0, milliseconds: 0 });
   }
   ```

6. **Imminent Payment Logic**:
   - If `scheduledFor < now`, schedule for:
     - Today at `notifyTime` if that time hasn't passed
     - Otherwise, schedule for next check (Story 4.4 will handle immediate display)

### 🔧 Existing Code to Reference

- **Settings Store:** `src/stores/settings-store.ts` (v4)

  - `notificationsEnabled: boolean`
  - `notificationDaysBefore: number` (1-30)
  - `notificationTime: string` (HH:mm, validated)
  - `notificationPermission: "default" | "granted" | "denied"`

- **Subscription Store:** `src/stores/subscription-store.ts` (v2)

  - `subscriptions: Subscription[]`
  - `getSubscriptions(): Subscription[]`

- **Timeline Utils:** `src/lib/timeline-utils.ts`

  - `getDaysUntilPayment()` - can be reused for relative calculations
  - `getUpcomingPayments()` - returns sorted upcoming subscriptions

- **Config:** `src/config/notifications.ts`

  - `NOTIFICATION_CONFIG.IMMINENT_PAYMENT_DAYS: 3`

- **Create Store Pattern:** `src/stores/create-store.ts`
  - Use this wrapper for consistent store creation with persistence

### 🧪 Testing Strategy

```typescript
// Test scenarios for notification-scheduling.test.ts
describe("calculateScheduledTime", () => {
  it("should schedule X days before payment at specified time");
  it("should handle DST spring forward (March)");
  it("should handle DST fall back (October)");
  it("should handle Feb 29 leap year");
  it("should handle month boundary (Jan 3 payment, 5 days before = Dec 29)");
});

describe("calculateNotificationSchedule", () => {
  it("should return empty array if notificationsEnabled is false");
  it("should return empty array if permission is not granted");
  it("should only include active subscriptions");
  it("should only include future payments");
  it("should handle multiple subscriptions");
  it("should handle imminent payment (< daysBefore remaining)");
});

// Test scenarios for notification-schedule-store.test.ts
describe("NotificationScheduleStore", () => {
  it("should persist schedule to localStorage");
  it("should update schedule");
  it("should mark entry as notified");
  it("should clear schedule");
  it("should recover from localStorage on reload");
});

// Test scenarios for use-notification-schedule-sync.test.ts
describe("useNotificationScheduleSync", () => {
  it("should recalculate when subscriptions change");
  it("should recalculate when settings change");
  it("should debounce rapid changes");
  it("should clear schedule when notifications disabled");
  it("should clear schedule when permission denied");
});
```

### Previous Story Learnings (4.2)

- **Rejection over Fallback:** Invalid data is rejected with `console.warn`, not silently fixed
- **Store Version:** SettingsStore is at v4, maintain pattern for new stores
- **Centralized Config:** Use `NOTIFICATION_CONFIG` from `src/config/notifications.ts`
- **Test Coverage:** Maintain 100% test coverage for critical paths

### Git History Context (Last 5 Commits)

- `c97ee43` feat(story-4.2): Browser Notification Permission Flow + Settings Sheet
- `8b74891` fix(epic-3): iOS Safari crypto.randomUUID() compatibility + retrospective
- `4aff561` feat(epic-3): complete stories 3.4 & 3.5 - subscription list & category breakdown
- Story 4.1 established notification settings slice with daysBefore, time, enabled toggle

### Dependency Note

This story is a **foundation** for:

- **Story 4.4:** Notification Display and Handling (consumes schedule)
- **Story 4.5:** Grouped Notifications (extends schedule with grouping)
- **Story 4.8:** Missed Notifications Recovery (uses lastCalculatedAt)

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-4.3`
- `docs/architecture.md#Cross-Cutting-Concerns` (Notification Permission Management)
- `docs/sprint-artifacts/4-1-notification-settings-slice.md` (Settings foundation)
- `docs/sprint-artifacts/4-2-browser-notification-permission-flow.md` (Permission handling)

### Adversarial Validation (2025-12-22)

- **Reviewer:** Sm (Adversarial Validator)
- **Status:** **PASSED with IMPROVEMENTS**
- **Findings:**
  - Added `paymentDueAt` to schema for handling "which payment cycle" context (Critical for Story 4.8).
  - Clarified scope to explicitly exclude notification _dispatching_ (Story 4.4).
  - Defined "immediately" for imminent payments as `new Date()` scheduling.

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Debug Log References

- Lint warnings fixed: unused imports in test file
- Test timeout issues resolved by removing async/waitFor with fake timers

### Completion Notes

**Implementation Summary (2025-12-22):**

1. **Types:** Created `NotificationScheduleEntry` schema with `subscriptionId`, `scheduledFor`, `paymentDueAt`, and optional `notifiedAt` using Zod validation.

2. **Scheduling Utils:** Implemented `calculateScheduledTime()` with DST-safe date-fns `set()` and `handleImminentPayment()` for past scheduled times. `calculateNotificationSchedule()` filters active subscriptions with future payments.

3. **Store:** Created `useNotificationScheduleStore` with persist middleware, including `updateSchedule()`, `markAsNotified()`, `clearSchedule()`, and query methods.

4. **Sync Hook:** Implemented `useNotificationScheduleSync()` with 500ms debounce, automatic recalculation on store changes, and precondition checks (notificationsEnabled && permission === "granted").

5. **App Integration:** Hook integrated in `App.tsx` with JSDoc documenting foreground-only limitation.

6. **Config:** Added `DEFAULT_NOTIFICATION_TIME` and `SCHEDULE_DEBOUNCE_MS` to `NOTIFICATION_CONFIG`.

**Test Coverage:** 44 new tests (23 scheduling utils, 13 store, 8 hook)

**Full Regression:** 451 tests passed, 0 failed

### File List

- `src/types/notification-schedule.ts` (new)
- `src/lib/notification-scheduling.ts` (new)
- `src/lib/notification-scheduling.test.ts` (new)
- `src/stores/notification-schedule-store.ts` (new)
- `src/stores/notification-schedule-store.test.ts` (new)
- `src/hooks/use-notification-schedule-sync.ts` (new)
- `src/hooks/use-notification-schedule-sync.test.ts` (new)
- `src/config/notifications.ts` (modified)
- `src/App.tsx` (modified)
