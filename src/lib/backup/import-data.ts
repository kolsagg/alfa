/**
 * Data Import Functionality
 *
 * Story 8.6: JSON backup import with validation
 * AC3: Security whitelisting for device-specific fields
 * AC4: Detailed validation with version check
 */

import {
  BackupSchema,
  CURRENT_STORE_VERSIONS,
  isBackupVersionCompatible,
  BACKUP_SIZE_THRESHOLD,
  type Backup,
  type BackupValidationResult,
} from "@/types/backup";
import { guardImportData } from "@/lib/import-guard";

export interface ImportParseResult extends BackupValidationResult {
  sizeBytes?: number;
  sizeWarning?: boolean;
  subscriptionCount?: number;
  mostRecentSubscription?: string;
}

/**
 * Get the most recently created subscription name for preview
 */
function getMostRecentSubscriptionName(backup: Backup): string | undefined {
  if (!backup.subscriptions.length) return undefined;

  const sorted = [...backup.subscriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sorted[0]?.name;
}

/**
 * Parse and validate backup file content
 * AC4: Includes version check, 0-subscription rejection, detailed preview
 */
export async function parseAndValidateBackup(
  file: File
): Promise<ImportParseResult> {
  try {
    // Read file content
    const content = await file.text();
    const sizeBytes = new TextEncoder().encode(content).length;
    const sizeWarning = sizeBytes > BACKUP_SIZE_THRESHOLD;

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        success: false,
        error: "Geçersiz JSON formatı",
        errorCode: "INVALID_FORMAT",
        sizeBytes,
      };
    }

    // Validate against schema
    const result = BackupSchema.safeParse(parsed);

    if (!result.success) {
      // Check if it's specifically an empty subscriptions error
      const emptyError = result.error.issues.find(
        (issue) =>
          issue.path.includes("subscriptions") && issue.code === "too_small"
      );

      if (emptyError) {
        return {
          success: false,
          error: "Yedek dosyası boş olamaz",
          errorCode: "EMPTY_BACKUP",
          sizeBytes,
          sizeWarning,
        };
      }

      // Other validation errors
      const firstError = result.error.issues[0];
      return {
        success: false,
        error: `Geçersiz yedek formatı: ${firstError?.path.join(".")} - ${
          firstError?.message
        }`,
        errorCode: "VALIDATION_ERROR",
        sizeBytes,
        sizeWarning,
      };
    }

    const backup = result.data;

    // AC4: Version compatibility check
    if (!isBackupVersionCompatible(backup.storeVersions)) {
      return {
        success: false,
        error:
          "Görünen o ki daha yeni bir uygulama versiyonundan yedek yüklemeye çalışıyorsunuz.",
        errorCode: "VERSION_MISMATCH",
        sizeBytes,
        sizeWarning,
      };
    }

    // Story 7.2 AC4: Privacy Guard - sanitize imported data
    const guardResult = guardImportData(backup);

    if (!guardResult.safe) {
      console.warn(
        "[ImportData] Privacy guard blocked fields:",
        guardResult.blockedFields
      );
      return {
        success: false,
        error: `Güvenlik kontrolü başarısız: ${guardResult.blockedFields.length} tehlikeli alan engellendi`,
        errorCode: "SECURITY_BLOCKED",
        sizeBytes,
        sizeWarning,
      };
    }

    // Use sanitized data
    const sanitizedBackup = guardResult.data;

    // Log warnings if any (non-blocking)
    if (guardResult.warnings.length > 0) {
      console.info(
        "[ImportData] Privacy guard warnings:",
        guardResult.warnings
      );
    }

    // Validation passed - return with preview info
    return {
      success: true,
      data: sanitizedBackup,
      sizeBytes,
      sizeWarning,
      subscriptionCount: sanitizedBackup.subscriptions.length,
      mostRecentSubscription: getMostRecentSubscriptionName(sanitizedBackup),
    };
  } catch (error) {
    console.error("[ImportData] Parse failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INVALID_FORMAT",
    };
  }
}

/**
 * Get current store versions for display/debugging
 */
export function getCurrentStoreVersions() {
  return { ...CURRENT_STORE_VERSIONS };
}
