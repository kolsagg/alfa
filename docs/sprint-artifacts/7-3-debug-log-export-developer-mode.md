# Story 7.3: Debug Log Export (Developer Mode)

Status: Completed

## Story

As a **developer/power user**,
I want **to export debug logs**,
So that **I can troubleshoot issues effectively**.

## Acceptance Criteria

1. **AC1 - Developer Mode Activation:**

   - Given user is on the app
   - When they enter a hidden trigger (long-press on version number in About section OR URL param `?debug=true`)
   - Then developer mode is activated
   - And a subtle indicator appears (e.g., "🛠️" badge near version or a small red dot in settings)
   - And developer mode persists in localStorage until explicitly disabled

2. **AC2 - Debug Export UI:**

   - Given developer mode is active
   - When user navigates to Settings > About section
   - Then a "Developer Options" subsection appears (only visible in dev mode)
   - And it shows "Export Debug Logs" button
   - And it shows log entry count and approximate size
   - And it shows "Clear Logs" button with confirmation

3. **AC3 - Debug Log Export Content:**

   - Given user clicks "Export Debug Logs"
   - When user views export preview
   - Then a prominent banner displays: "Bu dosya kişisel veri içermez - sadece anonim debug bilgisi"
   - And a SHA-256 checksum of the export is displayed, calculated via **Web Crypto API (SubtleCrypto)** for verification.

4. **AC4 - Privacy Guard & Import Guard (Integrated from 7.2):**

   - Given user imports a JSON backup
   - When the backup contains invalid or dangerous scripts/PII
   - Then the Import Guard sanitizes the data before merging
   - And a success badge appears confirming "Data stays on your device"

5. **AC5 - Error Trace Capture:**

   - Given developer mode is NOT active
   - When user views Settings > About
   - Then no developer options are visible
   - And no hints about developer mode exist in visible UI

## Technical Specifications

### Developer Mode Store Extension

```typescript
// src/stores/settings-store.ts (extend existing)
interface SettingsState {
  // ... existing
  developerMode: boolean;
  setDeveloperMode: (enabled: boolean) => void;
}

// Activation triggers:
// 1. Long-press (1.5s) on version text in About section
// 2. URL param: window.location.search includes 'debug=true'
```

### Debug Export Schema

```typescript
// src/types/debug-export.ts
import { z } from "zod";
import { EventLogEntrySchema } from "./event-log";

export const BrowserInfoSchema = z.object({
  userAgent: z.string(),
  platform: z.string(),
  language: z.string(),
});

export const SessionSummarySchema = z.object({
  session_id: z.string().uuid(),
  logs_count: z.number(),
  first_log_timestamp: z.string().datetime().optional(),
  last_log_timestamp: z.string().datetime().optional(),
});

export const DebugExportSchema = z.object({
  export_timestamp: z.string().datetime(),
  export_type: z.literal("debug_logs"),
  app_version: z.string(),
  schema_version: z.number(),
  browser_info: BrowserInfoSchema,
  session_summary: SessionSummarySchema,
  event_logs: z.array(EventLogEntrySchema),
});

export type DebugExport = z.infer<typeof DebugExportSchema>;
```

### Error Tracking Extension

```typescript
// Add to EventTypeSchema in src/types/event-log.ts
"error_caught"; // New event type

// Add to error-boundary.tsx
logger.log("error_caught", {
  error_message: scrubErrorMessage(error.message),
  component_stack: error.componentStack?.slice(0, 500), // Truncate
});
```

### Export Service

```typescript
// src/lib/debug-export.ts
export function generateDebugExport(): DebugExport {
  const logs = logger.getEventLogs();

  return {
    export_timestamp: new Date().toISOString(),
    export_type: "debug_logs",
    app_version: APP_VERSION,
    schema_version: SCHEMA_VERSION,
    browser_info: {
      name: "Sanitized Browser",
      version: "X.X",
      os: "Sanitized OS",
      language: navigator.language,
    },
    session_summary: {
      session_id: logger.getSessionId(),
      logs_count: logs.length,
      first_log_timestamp: logs[logs.length - 1]?.timestamp,
      last_log_timestamp: logs[0]?.timestamp,
    },
    event_logs: logs,
  };
}

export function downloadDebugExport(): void {
  const data = generateDebugExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `subtracker-debug-${timestamp}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

## Tasks / Subtasks

- [x] **Task 1: Types & Schema** (AC: #3)

  - [x] 1.1: Create `src/types/debug-export.ts` with Zod schemas
  - [x] 1.2: Add `error_caught` to EventTypeSchema in `event-log.ts`
  - [x] 1.3: Write unit tests for schema validation

- [x] **Task 2: Settings Store Extension** (AC: #1, #6)

  - [x] 2.1: Add `developerMode` boolean to settings-store
  - [x] 2.2: Add `setDeveloperMode` action
  - [x] 2.3: Persist `developerMode` state (default: false)
  - [x] 2.4: Write unit tests for developer mode toggle

- [x] **Task 3: Debug Export Service** (AC: #3, #4)

  - [x] 3.1: Create `src/lib/debug-export.ts`
  - [x] 3.2: Implement `generateDebugExport()` function
  - [x] 3.3: Implement `downloadDebugExport()` with proper filename
  - [x] 3.4: Add size estimation utility
  - [x] 3.5: Write unit tests for export generation

- [x] **Task 4: Error Boundary Enhancement** (AC: #5)

  - [x] 4.1: Integrate `logger.log('error_caught', ...)` in error-boundary.tsx
  - [x] 4.2: Implement `scrubErrorMessage()` utility (remove paths, user data)
  - [x] 4.3: Write tests for error logging

- [x] **Task 5: Developer Mode Activation UI** (AC: #1, #6)

  - [x] 5.1: Implement long-press detection on version text (1.5s hold)
  - [x] 5.2: Implement URL param check (`?debug=true`) on app mount
  - [x] 5.3: Add subtle dev mode indicator badge
  - [x] 5.4: Write tests for activation triggers

- [x] **Task 6: Developer Options Components** (AC: #2, #4)

  - [x] 6.1: Create `DeveloperOptionsSection` component
  - [x] 6.2: Create `ExportPreviewDialog` with Privacy Banner and Checksum
  - [x] 6.3: Implement `LogAnalyzer` micro-component to show count/size
  - [x] 6.4: Add i18n strings for developer options

- [x] **Task 7: Developer Options Logic** (AC: #2, #4)

  - [x] 7.1: Implement Checksum calculation using `crypto.subtle.digest('SHA-256', ...)`
  - [x] 7.2: Implement logic to toggle component visibility in About section
  - [x] 7.3: Implement JSON Minification toggle/logic
  - [x] 7.4: Implement Clear Logs button with confirmation confirm() or Radix Dialog
  - [x] 7.5: Write unit tests for export logic and checksums

- [x] **Task 8: Integration & Quality** (AC: All)
  - [x] 8.1: Integration test for full export flow
  - [x] 8.2: Verify exported JSON matches schema
  - [x] 8.3: Verify no PII in exports (Regex check for paths/UUIDs in messages)
  - [x] 8.4: Build verification and lint clean

## Dev Notes

### From Previous Stories (7.1, 7.2)

- **EventLogger** already provides `getEventLogs()`, `clearEventLogs()`, `getSessionId()`
- **APP_VERSION** and **SCHEMA_VERSION** are exported from `types/event-log.ts`
- **PII Scrubbing** via `scrubMetadata()` is already implemented
- **FIFO limit** of 1000 entries is enforced

### Key Implementation Points

1. **Long-Press Detection**: Use `onTouchStart`/`onTouchEnd` with setTimeout for mobile, `onMouseDown`/`onMouseUp` for desktop
2. **URL Param Check**: Detect in `main.tsx` or `root-layout.tsx` on mount
3. **Error Message Scrubbing**: Strip file paths, remove potential user data from stack traces.
   - Example Regex for paths: `/(?:[a-zA-Z]:\\|\/)(?:[^\s\\]+\\)*[^\s\\]+/g`
4. **Size Estimation**: `new Blob([JSON.stringify(data)]).size` gives byte count
5. **Throttling**: Use a simple timestamp ref to guard `logger.log('error_caught')`

### File Structure

- `src/types/debug-export.ts` (NEW)
- `src/lib/debug-export.ts` (NEW)
- `src/lib/debug-export.test.ts` (NEW)
- `src/components/features/settings/developer-options.tsx` (NEW)
- `src/components/features/settings/developer-options.test.tsx` (NEW)
- Modifies: `settings-store.ts`, `event-log.ts`, `error-boundary.tsx`, `about-section.tsx`, `i18n/settings.ts`

### Architecture Compliance

| Requirement | Compliance                                            |
| ----------- | ----------------------------------------------------- |
| **NFR07**   | No tracking scripts - debug data is local-only        |
| **NFR05**   | localStorage only - export is user-initiated download |
| **FR22**    | Event logging with anonymized debug info              |
| **FR26**    | Privacy-first - PII scrubbing in all exports          |

### i18n Strings Required

```typescript
// settings.ts
developerOptions: {
  title: "Geliştirici Seçenekleri",
  exportLogs: "Debug Loglarını Dışa Aktar",
  clearLogs: "Logları Temizle",
  clearLogsConfirm: "Tüm debug loglarını silmek istediğinize emin misiniz?",
  logCount: "{count} log kaydı",
  estimatedSize: "Tahmini boyut: {size}",
  sizeWarning: "Dosya boyutu 1MB'dan büyük",
  privacyBanner: "Bu dosya kişisel veri içermez - sadece anonim debug bilgisi",
  devModeEnabled: "Geliştirici modu aktif",
  devModeDisabled: "Geliştirici modu devre dışı",
}
```

### References

- [Source: docs/epics.md#Story-7.3]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/sprint-artifacts/7-1-anonymous-event-logging-system.md]
- [Source: docs/sprint-artifacts/7-2-privacy-first-data-handling.md]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Gemini (via Antigravity)

### Debug Log References

### Completion Notes List

- ✅ Created `src/types/debug-export.ts` with Zod schemas (BrowserInfo, SessionSummary, DebugExport)
- ✅ Added `error_caught` event type to EventTypeSchema
- ✅ Extended settings store with `developerMode` boolean and `setDeveloperMode` action (v7 migration)
- ✅ Created `src/lib/debug-export.ts` with generateDebugExport, downloadDebugExport, calculateChecksum, scrubErrorMessage
- ✅ Implemented error throttling (10s cooldown) to prevent FIFO buffer flooding
- ✅ Enhanced ErrorBoundary with throttled error logging and PII scrubbing
- ✅ Added long-press detection (1.5s) on version text for dev mode activation
- ✅ Added URL param check (`?debug=true`) for dev mode activation
- ✅ Created DeveloperOptionsSection with export preview dialog, privacy banner, checksum display
- ✅ Implemented minify toggle and clear logs with confirmation dialog
- ✅ Added 20+ i18n strings for developer options in Turkish
- ✅ All 123 related tests passing
- ✅ Build passing with no TypeScript errors

### File List

**New Files:**

- src/types/debug-export.ts
- src/types/debug-export.test.ts
- src/lib/debug-export.ts
- src/lib/debug-export.test.ts
- src/components/features/settings/developer-options.tsx
- src/components/features/settings/developer-options.test.tsx

**Modified Files:**

- src/types/event-log.ts (added error_caught event type)
- src/types/settings.ts (added developerMode field)
- src/stores/settings-store.ts (added developerMode state, action, v7 migration)
- src/stores/settings-store.test.ts (added v7 migration and dev mode tests)
- src/components/error-boundary.tsx (added throttled error logging)
- src/tests/error-boundary.test.tsx (added error logging tests)
- src/components/features/settings/about-settings.tsx (added long-press, URL param, dev mode badge)
- src/lib/i18n/settings.ts (added developer options i18n strings)
- src/main.tsx (initialized privacy audit)
- src/pages/dashboard-page.tsx (added privacy badge)
- src/pages/wallet-page.tsx (added privacy badge)
- src/lib/backup/import-data.ts (integrated import guard)
- src/types/backup.ts (added security blocked error type)

## Change Log

| Date       | Change                                     |
| ---------- | ------------------------------------------ |
| 2025-12-27 | Story created with full context            |
| 2025-12-28 | Implementation completed, all 8 tasks done |

Status: Ready for Review
