/**
 * Backup Schema & Types
 *
 * Story 8.6: JSON backup format for data export/import
 * AC2: Version tracking and store versions
 * AC3: Security whitelisting for device-specific fields
 * AC4: Validation with 0-subscription rejection
 */

import { z } from "zod";
import { SubscriptionSchema } from "./subscription";
import { ThemeSchema } from "./settings";
import { CardSchema } from "./card";

// Backup format version for schema evolution
export const BACKUP_FORMAT_VERSION = "1.1" as const;

// Current store versions - MUST match actual store versions
export const CURRENT_STORE_VERSIONS = {
  subscriptions: 2, // From subscription-store.ts version: 2
  settings: 6, // From settings-store.ts version: 6
  cards: 2, // From card-store.ts version: 2
} as const;

// NFR15: 5MB threshold in bytes
export const BACKUP_SIZE_THRESHOLD = 5 * 1024 * 1024;

// Story 5.5: Record count threshold for performance warning
export const RECORD_COUNT_THRESHOLD = 500;

/**
 * Settings fields safe to import across devices
 * AC3: Excludes browser-dependent and device-specific fields
 */
export const SETTINGS_IMPORT_WHITELIST = [
  "theme",
  "notificationsEnabled",
  "notificationDaysBefore",
  "notificationTime",
] as const;

/**
 * Fields explicitly excluded from import (device-specific)
 * AC3: These MUST be ignored during import
 */
export const SETTINGS_IMPORT_BLACKLIST = [
  "notificationPermission",
  "notificationPermissionDeniedAt",
  "onboardingCompleted",
  "lastIOSPromptDismissed",
  "notificationBannerDismissedAt",
  "hasSeenNotificationPrompt",
  "lastNotificationCheck",
] as const;

/**
 * Importable settings schema - only whitelisted fields
 */
export const ImportableSettingsSchema = z.object({
  theme: ThemeSchema.optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationDaysBefore: z.number().int().min(1).max(30).optional(),
  notificationTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
});

export type ImportableSettings = z.infer<typeof ImportableSettingsSchema>;

/**
 * Store versions schema for version compatibility checking
 */
export const StoreVersionsSchema = z.object({
  subscriptions: z.number().int().min(0),
  settings: z.number().int().min(0),
});

export type StoreVersions = z.infer<typeof StoreVersionsSchema>;

/**
 * Main backup schema with validation
 * AC4: Rejects backups with 0 subscriptions
 */
export const BackupSchema = z.object({
  version: z.string(),
  storeVersions: StoreVersionsSchema,
  exportDate: z.string().datetime(),
  subscriptions: z
    .array(SubscriptionSchema)
    .min(1, "Yedek dosyası en az 1 abonelik içermelidir"), // AC4: 0 subscription rejection
  cards: z.array(CardSchema).optional(),
  settings: ImportableSettingsSchema.optional(),
});

export type Backup = z.infer<typeof BackupSchema>;

/**
 * Result type for backup validation
 */
export interface BackupValidationResult {
  success: boolean;
  data?: Backup;
  error?: string;
  errorCode?:
    | "INVALID_FORMAT"
    | "EMPTY_BACKUP"
    | "VERSION_MISMATCH"
    | "VALIDATION_ERROR";
}

/**
 * Check if backup store versions are compatible with current app
 * Returns true if backup is from same or older version
 */
export function isBackupVersionCompatible(
  backupVersions: StoreVersions
): boolean {
  return (
    backupVersions.subscriptions <= CURRENT_STORE_VERSIONS.subscriptions &&
    backupVersions.settings <= CURRENT_STORE_VERSIONS.settings
  );
}
