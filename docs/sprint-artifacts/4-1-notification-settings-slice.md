# Story 4.1: Notification Settings Slice

Status: done

## Story

As a **developer**,
I want **a notification settings slice in the store**,
so that **user preferences are persisted and Epic 4 components can access them consistently**.

## Acceptance Criteria

### AC1: Settings Schema Extension

**Given** the notification slice is initialized
**When** I access the store
**Then** settings include:

- `notificationsEnabled` (boolean) — master toggle for the notification system
- `notificationDaysBefore` (number) — days before payment to trigger first alert
- `notificationTime` (string, HH:mm format) — delivery time (e.g., "09:00")
- `notificationPermission` ("default" | "granted" | "denied") — browser API state
- `lastNotificationCheck` (string | undefined) — ISO timestamp of the last system check (needed for Epic 4.8 recovery)
  **And** defaults are: `enabled=true`, `daysBefore=3`, `notifyTime="09:00"`, `lastNotificationCheck=undefined`

### AC2: Persistence & Migration

**Given** existing user data (version 2)
**When** the app rehydrates
**Then** schema version is incremented to **3**
**And** migration function handles:

- `notificationsEnabled` defaults to `true`
- `lastNotificationCheck` defaults to `undefined`
  **And** all settings are persisted to localStorage using the established `SettingsStore` namespace.

### AC3: Store Actions

**Given** the notification settings slice
**When** developer updates settings
**Then** the following actions are available:

- `updateNotificationSettings(updates: Partial<NotificationSettings>)` — consolidated update action
- `setNotificationPermission(permission: NotificationPermission)` — specific setter for API results
  **And** all mutations are validated via Zod before state update.

### AC4: Technical Validation (Zod)

**Given** invalid data is provided
**When** validation runs
**Then** the following rules apply:

- `notificationTime`: Must match `HH:mm` (24h). Fallback to `"09:00"` if corrupted.
- `notificationDaysBefore`: Integer, range [1-30].
- `notificationPermission`: Enum ["default", "granted", "denied"].
  **And** invalid inputs are rejected with `console.warn` without breaking the store.

### AC5: Unit Testing

**Given** the notification settings slice
**When** tests are run
**Then** the following must be covered:

- CRUD for `notificationsEnabled` and `lastNotificationCheck`.
- Migration logic from v2 to v3 (preserving existing settings).
- Validation rejection of invalid time strings (e.g., "25:61").
- Atomic and partial updates via `updateNotificationSettings`.

## Tasks / Subtasks

- [x] **Task 1: Schema Update (AC: #1, #4)**

  - [x] 1.1 Update `src/types/settings.ts` - Add `notificationsEnabled` and `lastNotificationCheck` to `SettingsSchema`.
  - [x] 1.2 Implement strict HH:mm regex validation for `notificationTime`.
  - [x] 1.3 Ensure `Settings` type is updated via Zod inference.

- [x] **Task 2: Store Logic & Migration (AC: #2, #3)**

  - [x] 2.1 Update `src/stores/settings-store.ts`: Add new state fields and actions.
  - [x] 2.2 Implement `updateNotificationSettings` (consolidated update pattern).
  - [x] 2.3 Update `version` to `3`.
  - [x] 2.4 Add migration case for `version < 3` to initialize new fields safely.

- [x] **Task 3: Testing & Verification (AC: #5)**

  - [x] 3.1 Update `src/stores/settings-store.test.ts`.
  - [x] 3.2 Add migration tests: Verify v2 profile becomes valid v3 profile.
  - [x] 3.3 Add validation tests: Verify "24:00" or invalid formats are rejected.
  - [x] 3.4 Run `npm run test` to ensure 0 regressions.

## Dev Notes

### 🏗️ Architecture: Master Toggle Logic

`notificationsEnabled: false` acts as a **system-wide kill-switch**. Future components (Scheduling, Display) MUST check this flag before any background logic, even if browser permission is `granted`.

### 📂 File Structure

- `src/types/settings.ts`: Core schema definition.
- `src/stores/settings-store.ts`: State management and migration.

### 🧪 Integration Hints

Adding `lastNotificationCheck` now prevents a "breaking" schema change later in Epic 4.8. This timestamp should ideally be updated whenever the app performs a background check for missed payments.

### Previous Story Learnings (Consolidated)

- **Settings pattern**: Stick to the existing `createStore` wrapper.
- **Permission Stub**: `hasSeenNotificationPrompt` should remain as-is; it tracks UI state, not system capability.
- **Regression Check**: Always verify that `setTheme` and other unrelated settings still work after migration.

## Dev Agent Record

### Context Reference

- `docs/epics.md`#Story-4.1
- `src/stores/settings-store.ts` (current version 2)
- `docs/sprint-artifacts/epic-3-retrospective.md` (Big 3 discipline)

### Agent Model Used

Antigravity v1.0

### Debug Log References

- Lint: 1 warning (TanStack Virtual - known issue, ignored)
- Build: Success (1,192 KB bundle)
- Tests: 349 passed, 3 skipped, 0 failed

### Completion Notes

- ✅ Added `notificationsEnabled` master toggle with default `true`
- ✅ Added `lastNotificationCheck` for Epic 4.8 forward compatibility
- ✅ Implemented `updateNotificationSettings` consolidated action with Zod validation
- ✅ Added `NotificationSettingsSchema` for partial update validation
- ✅ Strict 24h time validation (HH:mm) with fallback
- ✅ Schema version bumped to v3 with migration from v2
- ✅ 16 new tests added (24 total for settings-store)
- ✅ All 349 tests passing, 0 regressions

### File List

- `src/types/settings.ts` (modified)
- `src/stores/settings-store.ts` (done)
- `src/stores/settings-store.test.ts` (done)

### Change Log

- 2025-12-22: Story 4.1 implementation complete - notification settings slice with v3 schema, master toggle, and comprehensive validation
- 2025-12-22: Senior Developer Review (Adversarial) completed. Fixed inconsistent validation behavior, removed logic duplication in store, and strengthened timestamp validation. Results: 5 issues fixed automatically. Status: done.

## Senior Developer Review (Adversarial)

- **Date:** 2025-12-22
- **Reviewer:** Antigravity (Adversarial Mode)
- **Status:** **PASSED after fixes**

### Findings Summary

- **High:** Inconsistent API behavior (Fallback vs Rejection). FIXED: Standardized on Rejection.
- **Medium:** Validation Logic Duplication. FIXED: Refactored to use central Zod schemas in store actions.
- **Medium:** Weak timestamp validation. FIXED: Added `.datetime()` check for `lastNotificationCheck`.
- **Low:** Action redundancy. FIXED: Legacy setters now route through centralized validation.

### Verification

- 25 tests in `settings-store.test.ts` (all passed).
- Total tests: 350 passed (after adding `lastNotificationCheck` validation test).
- Build & Lint: Success.
