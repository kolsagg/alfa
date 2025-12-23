# Story 4.8: Missed Notifications Recovery

Status: done
Review Status: ✅ Passed
Last Updated: 2025-12-24

## Story

As a **user**,
I want **missed notifications to be shown on next app open**,
so that **I don't miss important payment reminders even if the app wasn't running**.

## Acceptance Criteria

### AC1: Missed Notification Detection

**Given** app was closed or backgrounded when notifications should have fired
**When** user opens the app OR returns to the app (`visibilitychange` to `visible`)
**Then** missed notifications are detected by comparing:

- `schedule.scheduledFor` vs current time
- `schedule.notifiedAt === undefined` (never shown)
- `scheduledFor < now` (scheduled time has passed)
  **And** only entries where the payment is still upcoming (not overdue) are considered missed
  **And** detection uses `lastNotificationCheck` (v3 settings field) for recovery context

### AC2: Missed Notifications Toast Display

**Given** missed notifications are detected
**When** the app mounts OR becomes visible
**Then** a toast notification shows: "{{count}} ödeme hatırlatmasını kaçırdınız" (using i18n)
**And** toast uses `info` variant with Bell icon
**And** toast includes action button "Görüntüle"
**And** clicking "Görüntüle" setting the `uiStore.dateFilter` to a comma-separated list of ALL unique missed payment dates
**And** toast auto-dismisses after 8 seconds (longer duration for actionable content)

### AC3: Missed Notifications Clearing

**Given** missed notifications toast is shown
**When** user acknowledges (clicks "Görüntüle" or toast dismisses)
**Then** all missed notification entries are marked as `notifiedAt: now`
**And** this prevents duplicate missed notification toasts on subsequent opens
**And** `lastNotificationCheck` is updated to current ISO timestamp

### AC4: Last Notification Check Tracking

**Given** the app performs its scheduled notification cycle
**When** `handleMissedNotifications` completes OR `checkAndDispatchNotifications` runs
**Then** `lastNotificationCheck` in settings store is updated to current ISO timestamp
**And** the lifecycle hook ensures recovery logic triggers and MARKS entries before dispatching browser notifications to prevent race conditions

### AC5: Edge Case: No Missed Notifications

**Given** no pending notifications have passed their scheduled time
**When** user opens the app
**Then** no toast is shown
**And** normal notification dispatch flow continues
**And** `lastNotificationCheck` is still updated

### AC6: Edge Case: Overdue Payments Excluded

**Given** a scheduled notification's `paymentDueAt` is in the past (payment already happened)
**When** missed notification check runs
**Then** that entry is NOT counted as "missed" (it's stale)
**And** stale entries should be cleaned up from schedule

## Tasks / Subtasks

- [x] **Task 1: Settings Store Extension (AC: #4)**

  - [x] [1.1] Verify `lastNotificationCheck: string | undefined` exists in `src/stores/settings-store.ts` (v3+)
  - [x] [1.2] Add action `updateLastNotificationCheck()` if not present
  - [x] [1.3] Ensure consistency with `v4` migration (verified: v4 exists, handles permission denial fields)

- [x] **Task 2: i18n String Additions**

  - [x] [2.1] Add to `src/lib/i18n/notifications.ts`:
    - `MISSED_NOTIFICATIONS_TOAST`: "{{count}} ödeme hatırlatmasını kaçırdınız"
    - `MISSED_NOTIFICATIONS_ACTION`: "Görüntüle"
  - [x] [2.2] Export strings for use in hook

- [x] **Task 3: Create Missed Notifications Detection Hook (AC: #1, #2, #3)**

  - [x] [3.1] Create `src/hooks/use-missed-notifications-recovery.ts` (Implemented as .tsx)
  - [x] [3.2] Implement `getMissedNotifications()` helper:
    - Filter schedule entries where: `!notifiedAt && scheduledFor < now && paymentDueAt >= startOfToday`
  - [x] [3.3] Implement `handleMissedNotifications()`:
    - If missed.length > 0, show toast with count
    - Mark entries as notified via `markBatchAsNotified`
    - Update `lastNotificationCheck`
  - [x] [3.4] Handle toast action: set `uiStore.setDateFilter` to earliest missed payment date
  - [x] [3.5] Create `src/hooks/use-missed-notifications-recovery.test.ts` (Implemented as .test.tsx)

- [x] **Task 4: Lifecycle Integration (AC: #1, #4, #5)**

  - [x] [4.1] Modify `src/hooks/use-notification-lifecycle.ts` to trigger recovery on mount AND visibility change
  - [x] [4.2] Ensure `handleMissedNotifications` runs/completes before `checkAndDispatchNotifications`
  - [x] [4.3] Update `lastNotificationCheck` after dispatch cycles
  - [x] [4.4] Implement `cleanupStaleEntries()` helper to purge overdue payments from store
  - [x] [4.5] Add tests to `use-notification-lifecycle.test.ts` (Updated to .test.tsx)

- [x] **Task 5: Validation & Reliability (AC: #6)**
  - [x] [5.1] Update `handleMissedNotifications` to log "missed_recovery" via `logReliabilityBatch`
  - [x] [5.2] Test missed detection with various counts (1, 3, 10 missed)
  - [x] [5.3] Test stale entry exclusion and cleanup
  - [x] [5.4] Test multi-date filter action ("Görüntüle" click)
  - [x] [5.5] Verify full regression passes

## Dev Notes

### 🏗️ Architecture: Recovery Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      User Opens App                             │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          useNotificationLifecycle (App mount)            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      useMissedNotificationsRecovery (RUNS FIRST)         │  │
│  │                                                           │  │
│  │  1. Triggers on mount AND visibilitychange                │  │
│  │  2. Get pending entries from NotificationScheduleStore    │  │
│  │  3. Filter: scheduledFor < now && !notifiedAt             │  │
│  │  4. Filter: paymentDueAt >= startOfToday (not stale)      │  │
│  │  5. If missed → Show toast + Mark batch + Log Reliability │  │
│  │  6. Update lastNotificationCheck                          │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Normal Dispatch Cycle (Story 4.4)               │  │
│  │    checkAndDispatchNotifications() continues              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 📂 File Structure

```
src/
├── hooks/
│   ├── use-missed-notifications-recovery.ts      # NEW: Recovery logic
│   ├── use-missed-notifications-recovery.test.ts # NEW: Tests
│   └── use-notification-lifecycle.ts             # MODIFIED: Integration
├── lib/
│   ├── i18n/
│   │   └── notifications.ts                      # MODIFIED: i18n strings
│   └── notification-scheduling.ts                # MODIFIED: Cleanup function
├── stores/
│   ├── notification-schedule-store.ts            # Reference for schedule access
│   └── settings-store.ts                         # VERIFY: lastNotificationCheck
└── services/
    └── notification-dispatcher.ts                # Reference for dispatch flow
```

### ⚠️ Critical Implementation Notes

1. **Order of Operations**: Missed notification check MUST run before `checkAndDispatchNotifications()` to prevent:

   - Racing where missed entries are dispatched as "new" notifications
   - Duplicate notifications (one as missed toast, one as browser notification)

2. **Stale Entry Definition**: An entry is stale if:

   ```typescript
   isBefore(parseISO(entry.paymentDueAt), startOfToday);
   ```

   This means the payment has already occurred, making the reminder irrelevant.

3. **Toast Duration**: Use 8000ms (8 seconds) for the missed notifications toast since it has an action button. Standard toasts use 4000ms.

4. **Batch Marking**: Use existing `markBatchAsNotified()` from `notification-schedule-store.ts` to efficiently mark all missed entries.

5. **Multi-Date Filter**: Toast action should join unique `paymentDueAt` dates with commas. `filterByDate` (from Story 4.7) already handles this format.

6. **PWA Backgrounding**: Recovery logic must trigger on `visibilitychange` to handle users returning to a persistent app instance.

7. **Reliability Logging**: Log missed recoveries to track system effectiveness in offline/closed scenarios.

### 🔧 Existing Code References

- **NotificationScheduleStore**: `src/stores/notification-schedule-store.ts`

  - `getPendingNotifications()`: Returns entries where `!notifiedAt`
  - `markBatchAsNotified(subscriptionIds)`: Marks multiple entries at once
  - `schedule: NotificationScheduleEntry[]`: Has `scheduledFor`, `paymentDueAt`, `notifiedAt`

- **SettingsStore**: `src/stores/settings-store.ts` (v4)

  - `lastNotificationCheck: string | null`: Last ISO timestamp of notification check
  - `setLastNotificationCheck(date: string)`: Update action (verify exists)

- **NotificationLifecycle Hook**: `src/hooks/use-notification-lifecycle.ts`

  - Already handles visibility-based dispatch
  - Need to integrate missed recovery into mount/visibility cycle

- **Notification Dispatcher**: `src/services/notification-dispatcher.ts`

  - `checkAndDispatchNotifications()`: Current dispatch logic
  - `syncNotificationPermissions()`: Permission sync

- **i18n Strings**: `src/lib/i18n/notifications.ts`

  - Existing pattern for notification strings

- **UI Store**: `src/stores/ui-store.ts`
  - `setDateFilter(date: string | null)`: For filtering by payment date

### 🧪 Testing Strategy

```typescript
// Test scenarios for use-missed-notifications-recovery.test.ts
describe("getMissedNotifications", () => {
  it("should return entries where scheduledFor < now and !notifiedAt");
  it("should exclude entries where paymentDueAt is in the past (stale)");
  it("should return empty array if all entries are notified");
  it("should return empty array if no entries match criteria");
});

describe("handleMissedNotifications", () => {
  it("should show toast with count when missed > 0");
  it("should NOT show toast when missed === 0");
  it("should mark all missed entries as notified");
  it("should update lastNotificationCheck");
  it("should trigger date filter on action click");
});

describe("cleanupStaleEntries", () => {
  it("should remove entries where paymentDueAt < startOfToday");
  it("should preserve entries with future payment dates");
  it("should handle empty schedule gracefully");
});
```

### 📊 Previous Story Learnings

**From Story 4.3 (Notification Scheduling Logic):**

- `NotificationScheduleEntry` schema includes `paymentDueAt` for recovery context
- `lastCalculatedAt` tracks when schedule was last computed
- Debouncing prevents rapid recalculations

**From Story 4.4 (Notification Display and Handling):**

- `checkAndDispatchNotifications()` handles actual browser notification display
- Reliability logging exists for debugging

**From Story 4.5 (Grouped Notifications):**

- `markBatchAsNotified()` efficiently marks multiple entries
- Date-based grouping pattern established

**From Story 4.7 (Graceful Degradation):**

- `isPushNotificationActive()` utility for checking notification state
- `useImminentPayments()` hook for imminent payment calculation
- Date filter integration with `uiStore.setDateFilter`

### 🔗 Cross-Story Dependencies

- **Depends on**: Stories 4.1, 4.2, 4.3, 4.4, 4.5, 4.7 (all completed)
- **Uses**: `NotificationScheduleStore`, `SettingsStore`, `UiStore`, toast system
- **Final story**: This completes Epic 4 (Notification System)

---

## File List

### New Files

- `src/hooks/use-missed-notifications-recovery.tsx` - Recovery hook implementation
- `src/hooks/use-missed-notifications-recovery.test.tsx` - Unit tests

### Modified Files

- `src/lib/i18n/notifications.ts` - Add MISSED*NOTIFICATIONS*\* strings
- `src/hooks/use-notification-lifecycle.ts` - Integrate recovery check
- `src/hooks/use-notification-lifecycle.test.tsx` - Extended tests
- `src/services/notification-dispatcher.ts` - Export logReliabilityBatch
- `src/stores/settings-store.ts` - Verify/add updateLastNotificationCheck action
- `docs/sprint-artifacts/sprint-status.yaml` - Update status

---

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-4.8`
- `docs/architecture.md#Offline-Notification-Recovery`
- `docs/sprint-artifacts/4-3-notification-scheduling-logic.md` (Schedule foundation)
- `docs/sprint-artifacts/4-4-notification-display-and-handling.md` (Dispatch reference)
- `docs/sprint-artifacts/4-7-graceful-degradation-for-denied-unavailable.md` (Date filter, i18n patterns)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

| Date       | Change                                                        |
| ---------- | ------------------------------------------------------------- |
| 2025-12-23 | Story file created - ready for dev                            |
| 2025-12-23 | Code Review - Low issues fixed (dead code, doc discrepancies) |
