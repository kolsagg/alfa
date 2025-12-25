# Story 8.6: Settings - Data Section

Status: Completed

## Story

As a **user**,
I want **to export my subscription data as a JSON backup file and import previously exported backups**,
so that **I can safeguard my data and restore it if needed**.

## Background

Story 8.2 implemented the Settings page with a "Veri Yönetimi" (Data Management) section containing a placeholder. This story implements the full data export/import functionality as defined in Epic 5 Stories 5.1-5.3.

### Key Features:

- **Export:** Download all subscription data as `subtracker-backup-{date}.json` with version tracking.
- **Import:** Upload and validate JSON backup, with a detailed preview before data replacement.
- **Validation:** Zod schema validation ensuring data integrity and prevent device-specific state conflicts.
- **Safety:** Auto-backup toggle and "Danger Zone" confirmation before wiping current data.

## Acceptance Criteria

### AC1: Data Section UI Layout

- **Given** the user navigates to the "Veri Yönetimi" section in Settings
- **When** they view the data options
- **Then** the section displays:
  1. **"Dışa Aktar" (Export)** button with Download icon.
  2. **"İçe Aktar" (Import)** button with Upload icon.
  3. Last backup date indicator: "Son yedek: {date}".
- **And** the layout follows the existing Settings visual language.
- **And** buttons provide clear visual feedback during processing.

### AC2: JSON Export Functionality (NFR15)

- **Given** the user clicks "Dışa Aktar"
- **When** export is triggered
- **Then** a JSON file is generated containing:
  - `version`: Backup format version (e.g., "1.0").
  - `storeVersions`: Map of internal store versions (e.g., `{ subscriptions: 2, settings: 4 }`).
  - `exportDate`: ISO 8601 timestamp.
  - `subscriptions`: Array of all subscriptions.
  - `settings`: Whitelisted user preferences (theme, notification timing).
- **And** the file is named `subtracker-backup-{YYYY-MM-DD}.json`.
- **And** if the resulting file exceeds 5MB, a warning toast is shown (NFR15).
- **And** `lastBackupDate` is updated in `settings-store`.

### AC3: JSON Import & Security Whitelisting

- **Given** the user selects a JSON file for import
- **When** validation runs
- **Then** the system MUST **ignore** browser-dependent or device-specific fields:
  - `notificationPermission`, `notificationPermissionDeniedAt`
  - `onboardingCompleted`
  - `lastIOSPromptDismissed`
- **And** only user-configured preferences are merged.

### AC4: Detailed Import Preview & Validation

- **Given** a JSON file is parsed
- **When** validation succeeds
- **Then** a "Tehlike Bölgesi" (Danger Zone) themed confirmation modal appears:
  - Content: SHOWS count and the name of the **most recent subscription** in the backup.
  - Warning: "Bu işlem mevcut verilerinizin üzerine yazacaktır." (This will overwrite your current data.)
- **And** if the backup contains 0 subscriptions, a critical error is shown.
- **And** if `storeVersions` in backup are higher than the app's current version, import is rejected with "Görünen o ki daha yeni bir uygulama versiyonundan yedek yüklemeye çalışıyorsunuz."

### AC5: Data Replacement & Safety Net

- **Given** the user confirms import
- **When** "Mevcut verileri yedekle" is checked
- **Then** an auto-backup file `subtracker-pre-import-{timestamp}.json` is downloaded BEFORE the store is updated.
- **And** `useSubscriptionStore` and `useSettingsStore` are updated with whitelisted data.

## Tasks / Subtasks

- [x] **Task 1: i18n & Terminology (AC: #1, #4)**

  - [x] 1.1 Add data section strings to `src/lib/i18n/settings.ts`.
  - [x] 1.2 Include: EXPORT_BUTTON, IMPORT_BUTTON, LAST_BACKUP_LABEL, CONFIRM_TITLE, CONFIRM_DANGER_NODE, VERSION_MISMATCH_ERROR.

- [x] **Task 2: Backup Schema & Whitelisting (AC: #2, #3, #4)**

  - [x] 2.1 Create `src/types/backup.ts` with `BackupSchema`.
  - [x] 2.2 Define `SETTINGS_WHITELIST` array to filter out browser-specific fields.
  - [x] 2.3 Add refinement to Zod to reject backups with 0 subscriptions.

- [x] **Task 3: Export/Import Logic (AC: #2, #4, #6)**

  - [x] 3.1 Implement `exportBackup()` in `src/lib/backup/export-data.ts`.
  - [x] 3.2 Implement `parseAndValidateBackup()` in `src/lib/backup/import-data.ts` including version check.
  - [x] 3.3 Add NFR15 size check (>5MB) for both operations.
  - [x] 3.4 Ensure `URL.revokeObjectURL(url)` is called to prevent memory leaks.

- [x] **Task 4: DataSettings UI & Dialog (AC: #1, #4, #5)**

  - [x] 4.1 Create `src/components/features/settings/data-settings.tsx`.
  - [x] 4.2 Create `src/components/features/settings/import-confirm-dialog.tsx` with "Danger Zone" styling.
  - [x] 4.3 Integrate into `settings-page.tsx`.

- [x] **Task 5: Testing & Quality (AC: #7)**

  - [x] 5.1 Unit tests for schema validation and whitelisting.
  - [x] 5.2 Integration tests for the full "Select -> Preview -> Wipe -> Load" flow.
  - [x] 5.3 Verify memory safety (Blob URL revocation).

- [x] **Task 6: Post-Review Refinement (Adversarial Fixes)**
  - [x] 6.1 Move direct store mutations to `importSubscriptions` and `mergeSettings` actions.
  - [x] 6.2 Improve button feedback locking for 2s success/error periods.
  - [x] 6.3 Centralize `BACKUP_SIZE_THRESHOLD` in types.

## Dev Notes

### 🛠️ Configuration & Types

```typescript
// src/types/backup.ts
export const BACKUP_FORMAT_VERSION = "1.0";

// Whitelist of settings safe to move between devices
export const SETTINGS_IMPORT_WHITELIST = [
  "theme",
  "notificationsEnabled",
  "notificationDaysBefore",
  "notificationTime",
] as const;

export const BackupSchema = z.object({
  version: z.string(),
  storeVersions: z.object({
    subscriptions: z.number(),
    settings: z.number(),
  }),
  exportDate: z.string().datetime(),
  subscriptions: z.array(SubscriptionSchema).min(1, "Yedek dosyası boş olamaz"),
  settings: SettingsSchema.partial().optional(),
});
```

### 📥 Import Logic with Version Check (Task 3.2)

```typescript
// Important: Check backup store versions against current store versions
const CURRENT_VERSIONS = {
  subscriptions: 2, // From subscription-store.ts
  settings: 4, // From settings-store.ts
};

// If backup.storeVersions.subscriptions > CURRENT_VERSIONS.subscriptions -> REJECT
```

### 🎨 UI: Danger Zone Styling (Task 4.2)

Use `destructive` colors for the Import Confirmation Dialog to emphasize that data will be replaced.

```tsx
<DialogHeader>
  <DialogTitle className="text-destructive flex items-center gap-2">
    <AlertTriangle className="h-5 w-5" />
    {SETTINGS_STRINGS.CONFIRM_TITLE}
  </DialogTitle>
</DialogHeader>
```

### ⚠️ Critical Implementation Notes

1. **Security:** NEVER import `notificationPermission`. The new device must trigger its own permission flow.
2. **Blob Safety:** Always `URL.revokeObjectURL` in a `setTimeout` or after the anchor click to ensure the browser has finished the download.
3. **NFR15:** 5MB is roughly 5.2 million characters in a JSON string. Use `new TextEncoder().encode(jsonString).length` for accurate byte count.

## File List

### New Files

- `src/types/backup.ts` - Backup schema, version constants, whitelisting definitions
- `src/types/backup.test.ts` - Schema validation and whitelisting tests
- `src/lib/backup/index.ts` - Backup module barrel export
- `src/lib/backup/export-data.ts` - Export functionality with version tracking
- `src/lib/backup/export-data.test.ts` - Export unit tests with memory safety verification
- `src/lib/backup/import-data.ts` - Import validation with version check
- `src/lib/backup/import-data.test.ts` - Import validation unit tests
- `src/components/ui/checkbox.tsx` - Radix UI Checkbox component
- `src/components/features/settings/data-settings.tsx` - Main DataSettings component
- `src/components/features/settings/data-settings.test.tsx` - DataSettings integration tests
- `src/components/features/settings/import-confirm-dialog.tsx` - Danger Zone dialog
- `src/components/features/settings/import-confirm-dialog.test.tsx` - Dialog tests

### Modified Files

- `src/lib/i18n/settings.ts` - Added comprehensive Turkish i18n strings for data section
- `src/pages/settings-page.tsx` - Integrated DataSettings component, added import
- `src/pages/settings-page.test.tsx` - Updated tests for DataSettings, added store mocks
- `docs/sprint-artifacts/sprint-status.yaml` - Story status update
- `package.json` - Added @radix-ui/react-checkbox dependency
- `src/stores/subscription-store.ts` - Added `importSubscriptions` action
- `src/stores/settings-store.ts` - Added `mergeSettings` action

## Change Log

| Date       | Change Description                                                |
| ---------- | ----------------------------------------------------------------- |
| 2025-12-25 | Story implemented - Full data export/import functionality with UI |
| 2025-12-25 | Refined store actions and UI locking after adversarial review     |

## Dev Agent Record

### Context Reference

- `src/stores/subscription-store.ts` (v2)
- `src/stores/settings-store.ts` (v4)
- `docs/architecture.md` (NFR15 compliance)

### Implementation Plan

1. ✅ Added Turkish i18n strings for all data section UI elements
2. ✅ Created comprehensive backup schema with Zod validation
3. ✅ Implemented settings whitelisting (AC3) and blacklisting
4. ✅ Built export functionality with version tracking and NFR15 size warning
5. ✅ Built import validation with version compatibility check
6. ✅ Created DataSettings UI component with export/import buttons
7. ✅ Created ImportConfirmDialog with Danger Zone styling
8. ✅ Integrated auto-backup option before import (AC5)
9. ✅ Added comprehensive test coverage (unit + integration)
10. ✅ Verified memory safety with Blob URL revocation

### Completion Notes

- All 5 Acceptance Criteria satisfied
- 690 tests passing, 57 test files
- NFR15 compliance: 5MB size warning implemented
- Security: Device-specific fields properly blacklisted from import
- Memory safety: Blob URLs are revoked after download with setTimeout

### Agent Model Used

Antigravity (Google DeepMind)
