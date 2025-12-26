/**
 * Data Export Functionality
 *
 * Story 8.6: JSON backup export
 * AC2: Generates backup with version tracking
 * NFR15: 5MB size warning
 */

import type { Subscription } from "@/types/subscription";
import type { Settings } from "@/types/settings";
import type { Card } from "@/types/card";
import {
  BACKUP_FORMAT_VERSION,
  CURRENT_STORE_VERSIONS,
  SETTINGS_IMPORT_WHITELIST,
  BACKUP_SIZE_THRESHOLD,
  type Backup,
  type ImportableSettings,
} from "@/types/backup";

export interface ExportResult {
  success: boolean;
  filename?: string;
  sizeBytes?: number;
  sizeWarning?: boolean;
  error?: string;
}

/**
 * Filter settings to only include whitelisted fields
 * AC3: Ensures only portable settings are exported
 */
function filterWhitelistedSettings(
  settings: Partial<Settings>
): ImportableSettings {
  const filtered: ImportableSettings = {};

  for (const key of SETTINGS_IMPORT_WHITELIST) {
    const value = settings[key];
    if (value !== undefined) {
      // Type-safe assignment using explicit key handling
      if (key === "theme") {
        filtered.theme = value as ImportableSettings["theme"];
      } else if (key === "notificationsEnabled") {
        filtered.notificationsEnabled =
          value as ImportableSettings["notificationsEnabled"];
      } else if (key === "notificationDaysBefore") {
        filtered.notificationDaysBefore =
          value as ImportableSettings["notificationDaysBefore"];
      } else if (key === "notificationTime") {
        filtered.notificationTime =
          value as ImportableSettings["notificationTime"];
      }
    }
  }

  return filtered;
}

/**
 * Generate backup filename with current date
 * Format: subtracker-backup-YYYY-MM-DD.json
 */
function generateBackupFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  return `subtracker-backup-${date}.json`;
}

/**
 * Create and download backup file
 * AC2: Includes version, storeVersions, exportDate, subscriptions, settings
 */
export function exportBackup(
  subscriptions: Subscription[],
  settings: Partial<Settings>,
  cards: Card[] = []
): ExportResult {
  try {
    // Build backup object
    const backup: Backup = {
      version: BACKUP_FORMAT_VERSION,
      storeVersions: { ...CURRENT_STORE_VERSIONS },
      exportDate: new Date().toISOString(),
      subscriptions,
      cards,
      settings: filterWhitelistedSettings(settings),
    };

    // Serialize to JSON
    const jsonString = JSON.stringify(backup, null, 2);

    // NFR15: Calculate accurate byte size
    const sizeBytes = new TextEncoder().encode(jsonString).length;
    const sizeWarning = sizeBytes > BACKUP_SIZE_THRESHOLD;

    // Create Blob and download link
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const filename = generateBackupFilename();

    // Trigger download
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    // Task 3.4: Cleanup to prevent memory leaks
    // Use setTimeout to ensure download initiates before revocation
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);

    return {
      success: true,
      filename,
      sizeBytes,
      sizeWarning,
    };
  } catch (error) {
    console.error("[ExportData] Export failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create pre-import backup for safety net
 * AC5: Auto-backup before data replacement
 */
export function createPreImportBackup(
  subscriptions: Subscription[],
  settings: Partial<Settings>,
  cards: Card[] = []
): ExportResult {
  try {
    const backup: Backup = {
      version: BACKUP_FORMAT_VERSION,
      storeVersions: { ...CURRENT_STORE_VERSIONS },
      exportDate: new Date().toISOString(),
      subscriptions,
      cards,
      settings: filterWhitelistedSettings(settings),
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Timestamp format for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `subtracker-pre-import-${timestamp}.json`;

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);

    return {
      success: true,
      filename,
      sizeBytes: new TextEncoder().encode(jsonString).length,
    };
  } catch (error) {
    console.error("[ExportData] Pre-import backup failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
