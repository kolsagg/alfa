# Story 5.4: Weekly Backup Reminder

Status: done

## Story

As a **user**,
I want **periodic reminders to backup my data**,
So that **I don't forget and lose everything**.

## Background

Epic 8 Story 8.6 implemented the core export/import functionality. The `lastBackupDate` field already exists in `settings-store.ts` and is updated when the user exports data. This story adds a reminder system that prompts users who haven't backed up in 7+ days.

### Existing Infrastructure:

- `lastBackupDate` field in `settings-store.ts` (string, ISO datetime, optional)
- `setLastBackupDate()` action in settings store
- `exportBackup()` function in `src/lib/backup/export-data.ts`
- `DataSettings` component in `src/components/features/settings/data-settings.tsx`

## Acceptance Criteria

### AC1: Backup Reminder Detection

- **Given** the user has exported data before (`lastBackupDate` exists)
- **And** the user has at least one active subscription
- **When** it's been 7+ days since `lastBackupDate`
- **And** the user opens the app or navigates to Dashboard
- **Then** a non-intrusive reminder banner appears at the top of the dashboard

### AC2: Reminder UI

- **Given** the backup reminder is triggered
- **When** the banner displays
- **Then** it shows: "Son yedeğinizin üzerinden 7 gün geçti" (It's been a week since your last backup)
- **And** includes a "Şimdi Yedekle" (Backup Now) button
- **And** includes a "Daha Sonra Hatırlat" (Remind Me Later) button
- **And** includes a "Bir Daha Gösterme" (Don't remind me again) option
- **And** uses `bg-warning/10 border-warning` styling to draw attention without being intrusive

### AC3: Backup Now Action

- **Given** the user clicks "Şimdi Yedekle"
- **When** the action is triggered
- **Then** `exportBackup()` is called from `src/lib/backup/export-data.ts`
- **And** on success, `lastBackupDate` is updated automatically (already implemented in exportBackup)
- **And** the reminder banner dismisses
- **And** a success toast appears: "Yedek başarıyla oluşturuldu"

### AC4: Remind Me Later Action

- **Given** the user clicks "Daha Sonra Hatırlat"
- **When** the action is triggered
- **Then** the banner dismisses for this session
- **And** `backupReminderDismissedAt` is set to current timestamp in settings store
- **And** reminder reappears after 24 hours (not on next page load)

### AC5: Don't Remind Me Action

- **Given** the user clicks "Bir Daha Gösterme"
- **When** the action is triggered
- **Then** `backupReminderDisabled` is set to `true` in settings store
- **And** the reminder never appears again on the Dashboard
- **And** the user can re-enable this later from Settings -> Veri Yönetimi

### AC6: First-Time User Handling

- **Given** the user has never exported data (`lastBackupDate` is undefined)
- **When** the user has at least one subscription
- **And** 7 days have passed since the **creation date of the oldest subscription**
- **Then** a softer prompt appears on Dashboard: "Verilerinizi yedeklemeyi düşünün"

### AC8: Settings UI Re-activation

- **Given** the user is in Settings -> Veri Yönetimi
- **When** they view the data options
- **Then** a toggle/switch for "Yedek Hatırlatıcıları" (Backup Reminders) is visible
- **And** it accurately reflects the `backupReminderDisabled` state
- **And** toggling it immediately updates the store

### AC9: Dashboard Layout Priority

- **Given** both the iOS Install Prompt and the Backup Reminder are active
- **When** the Dashboard renders
- **Then** the `IOSInstallPrompt` (if applicable) takes visual precedence (renders above)
- **And** `BackupReminderBanner` renders below it
- **And** both banners remain dismissible independently

### AC10: Testing & Quality

- **Given** the implementation
- **When** `npm run lint && npm run build && npm test -- --run` executes
- **Then** all checks pass
- **And** unit tests verify:
  - Reminder appears after 7+ days
  - Reminder respects disabled state
  - "Remind Later" delays for 24 hours
  - Export triggers lastBackupDate update
  - Banner dismiss states persist

## Tasks / Subtasks

- [x] **Task 1: Settings Store Extension (AC: #4, #5)**

  - [x] 1.1 Add `backupReminderDismissedAt: z.string().datetime().optional()` to SettingsSchema
  - [x] 1.2 Add `backupReminderDisabled: z.boolean().default(false)` to SettingsSchema
  - [x] 1.3 Add `setBackupReminderDismissed()` action to settings-store
  - [x] 1.4 Add `setBackupReminderDisabled()` action to settings-store
  - [x] 1.5 Bump settings-store version to 5 with migration
  - [x] 1.6 Add unit tests for new actions

- [x] **Task 2: i18n Strings (AC: #2, #3)**

  - [x] 2.1 Add backup reminder strings to `src/lib/i18n/settings.ts`:
    - `BACKUP_REMINDER_TITLE`
    - `BACKUP_REMINDER_DESCRIPTION`
    - `BACKUP_NOW_BUTTON`
    - `REMIND_LATER_BUTTON`
    - `DONT_REMIND_BUTTON`
    - `BACKUP_SUCCESS_TOAST`
    - `FIRST_BACKUP_SUGGESTION`

- [x] **Task 3: BackupReminderBanner Component (AC: #1, #2, #3, #4, #5)**

  - [x] 3.1 Create `src/components/features/backup/backup-reminder-banner.tsx`
  - [x] 3.2 Implement reminder logic hook `useBackupReminder()`:
    - Check `lastBackupDate` vs current time (7+ days)
    - Check `backupReminderDisabled` flag
    - Check `backupReminderDismissedAt` (24h cooldown)
  - [x] 3.3 Implement banner UI with three action buttons
  - [x] 3.4 Export backup on "Şimdi Yedekle" click
  - [x] 3.5 Apply `bg-warning/10 border border-warning rounded-lg` styling
  - [x] 3.6 Add animation: `motion-safe:animate-in fade-in slide-in-from-top-2`

- [x] **Task 4: Dashboard Integration (AC: #1, #6)**

  - [x] 4.1 Import `BackupReminderBanner` in `src/pages/dashboard-page.tsx`
  - [x] 4.2 Render banner at top of dashboard content (after header, before main content)
  - [x] 4.3 Conditionally render based on `useBackupReminder()` hook result

- [x] **Task 6: Settings UI Integration (AC: #8)**

  - [x] 6.1 Update `src/components/features/settings/data-settings.tsx` to include a toggle for `backupReminderDisabled`
  - [x] 6.2 Ensure i18n support for the new toggle labels
  - [x] 6.3 Verify state sync between banner dismiss/disable and settings toggle

- [x] **Task 7: Testing & Validation (AC: #10)**
  - [x] 7.1 Create `src/components/features/backup/backup-reminder-banner.test.tsx`
  - [x] 7.2 Test reminder visibility logic (7+ days + subscription count check)
  - [x] 7.3 Test "Backup Now" triggers export
  - [x] 7.4 Test "Remind Later" respects 24h cooldown
  - [x] 7.5 Test "Don't Remind" disables permanently
  - [x] 7.6 Run Big 3: `npm run lint && npm run build && npm test -- --run`

## Dev Notes

### 🏗️ Architecture: Component Structure

```
src/
├── components/
│   └── features/
│       └── backup/
│           ├── backup-reminder-banner.tsx    ← NEW (Primary)
│           ├── backup-reminder-banner.test.tsx ← NEW
│           └── index.ts                       ← NEW (barrel export)
├── hooks/
│   └── use-backup-reminder.ts                ← NEW (logic hook)
│   └── use-backup-reminder.test.ts           ← NEW
├── stores/
│   └── settings-store.ts                     ← MODIFY (add fields + actions)
├── lib/
│   └── i18n/
│       └── settings.ts                       ← MODIFY (add strings)
└── pages/
    └── dashboard-page.tsx                    ← MODIFY (integrate banner)
```

### ⚙️ Settings Store Changes

```typescript
// Add to SettingsSchema (types/settings.ts)
backupReminderDismissedAt: z.string().datetime().optional(),
backupReminderDisabled: z.boolean().default(false),

// Add to settings-store.ts
setBackupReminderDismissed: () =>
  set({ backupReminderDismissedAt: new Date().toISOString() }),

setBackupReminderDisabled: (disabled: boolean) =>
  set({ backupReminderDisabled: disabled }),
```

### 🪝 useBackupReminder Hook Logic

```typescript
// hooks/use-backup-reminder.ts
export function useBackupReminder() {
  const { lastBackupDate, backupReminderDisabled, backupReminderDismissedAt } =
    useSettingsStore();

  const shouldShowReminder = useMemo(() => {
    // 1. Permanent disable check
    if (backupReminderDisabled) return false;

    // 2. Data existence check: must have at least one subscription
    if (subscriptions.length === 0) return false;

    // 3. Recently dismissed check (24h cooldown)
    if (backupReminderDismissedAt) {
      const dismissedAt = new Date(backupReminderDismissedAt);
      const hoursSinceDismiss = differenceInHours(new Date(), dismissedAt);
      if (hoursSinceDismiss < 24) return false;
    }

    // 4. Threshold Logic
    if (lastBackupDate) {
      // 7+ days since last backup
      const lastBackup = new Date(lastBackupDate);
      return differenceInDays(new Date(), lastBackup) >= 7;
    } else {
      // Soft prompt: 7+ days since earliest subscription creation
      const oldestSubDate = getOldestSubscriptionDate(subscriptions); // helper needed
      return differenceInDays(new Date(), oldestSubDate) >= 7;
    }
  }, [
    subscriptions,
    lastBackupDate,
    backupReminderDisabled,
    backupReminderDismissedAt,
  ]);

  return { shouldShowReminder };
}
```

### 📐 Design Tokens

- Warning background: `bg-warning/10` (or `bg-amber-50 dark:bg-amber-900/20`)
- Warning border: `border-warning` (or `border-amber-400`)
- Button primary: existing Button variant="default"
- Button secondary: Button variant="ghost"
- Text: `text-warning-foreground` or `text-amber-800 dark:text-amber-200`

### ⚠️ Critical Implementation Notes

1. **Big 3 Mandatory:** Run `npm run lint && npm run build && npm test -- --run` before marking done
2. **Store Version Bump:** Increment settings-store version from 4 to 5
3. **Migration Required:** Add migration for new fields with defaults
4. **No Blocking:** Banner should not block user interaction
5. **Animation Respect:** Use `motion-safe:` prefix for animations

### 📊 Previous Story Learnings

- Story 8.6 established backup export pattern - reuse `exportBackup()`
- i18n strings centralized in `lib/i18n/settings.ts`
- Settings store uses Zod validation for all updates

### 🔗 Dependencies

- **Depends On:** Story 8.6 (Data Section) ✅ DONE
- **Depends On:** Epic 4 (Settings Store v4) ✅ DONE
- **Blocked By:** None
- **Blocks:** None

---

## Dev Agent Record

### Context Reference

- `src/stores/settings-store.ts` (v4)
- `src/lib/backup/export-data.ts`
- `src/components/features/settings/data-settings.tsx`
- `docs/epics.md#Story-5.4`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**New Files:**

- `src/components/features/backup/backup-reminder-banner.tsx`
- `src/components/features/backup/backup-reminder-banner.test.tsx`
- `src/components/features/backup/index.ts`
- `src/hooks/use-backup-reminder.ts`
- `src/hooks/use-backup-reminder.test.ts`

**Modified Files:**

- `src/types/settings.ts` (add backupReminderDismissedAt, backupReminderDisabled)
- `src/stores/settings-store.ts` (add actions, bump to v5)
- `src/stores/settings-store.test.ts` (add action and migration tests)
- `src/lib/i18n/settings.ts` (add reminder strings)
- `src/pages/dashboard-page.tsx` (integrate banner)
- `src/components/features/settings/data-settings.tsx` (add toggle)

---

## Change Log

| Date       | Change                                 |
| ---------- | -------------------------------------- |
| 2025-12-25 | Story created - Weekly Backup Reminder |
