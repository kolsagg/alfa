/**
 * Debug Export Service
 *
 * Story 7.3: Debug Log Export (Developer Mode)
 * - Generates debug exports with privacy-first approach
 * - Checksum calculation via Web Crypto API
 * - File download functionality
 */
import { logger } from "@/lib/event-logger";
import {
  DebugExportSchema,
  getSanitizedBrowserInfo,
  type DebugExport,
} from "@/types/debug-export";
import { APP_VERSION, SCHEMA_VERSION } from "@/types/event-log";

/**
 * Generate a debug export object
 * AC3: Full export structure with all required fields
 */
export function generateDebugExport(): DebugExport {
  const logs = logger.getEventLogs();
  const sessionId = logger.getSessionId();

  const exportData: DebugExport = {
    export_timestamp: new Date().toISOString(),
    export_type: "debug_logs",
    app_version: APP_VERSION,
    schema_version: SCHEMA_VERSION,
    browser_info: getSanitizedBrowserInfo(),
    session_summary: {
      session_id: sessionId,
      logs_count: logs.length,
      first_log_timestamp:
        logs.length > 0 ? logs[logs.length - 1]?.timestamp : undefined,
      last_log_timestamp: logs.length > 0 ? logs[0]?.timestamp : undefined,
    },
    event_logs: logs,
  };

  // Validate against schema
  const result = DebugExportSchema.safeParse(exportData);
  if (!result.success) {
    console.error(
      "[DebugExport] Generated export failed validation:",
      result.error
    );
  }

  return exportData;
}

/**
 * Calculate SHA-256 checksum of export data
 * AC3: Web Crypto API (SubtleCrypto) for verification
 */
export async function calculateChecksum(data: DebugExport): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

/**
 * Generate filename for debug export
 */
function generateExportFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `subtracker-debug-${timestamp}.json`;
}

/**
 * Download debug export as JSON file
 * AC3: User-initiated download
 */
export function downloadDebugExport(
  data: DebugExport,
  minify: boolean = false
): void {
  const jsonString = minify
    ? JSON.stringify(data)
    : JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = generateExportFilename();

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Get estimated export size
 */
export function getExportSize(data: DebugExport): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Format bytes to human-readable string (re-exported for convenience)
 */
export { formatBytes, estimateExportSize } from "@/types/debug-export";

/**
 * Scrub error messages for privacy
 * AC5: Remove file paths, user data from error messages
 */
export function scrubErrorMessage(message: string): string {
  if (!message) return "";

  let scrubbed = message;

  // Remove Windows file paths: C:\Users\...\
  scrubbed = scrubbed.replace(
    /[A-Za-z]:\\(?:[^\s\\:]+\\)*[^\s\\:]+/g,
    "[REDACTED_PATH]"
  );

  // Remove Unix file paths: /Users/.../  or  /home/.../ or any absolute path that looks like a system path
  scrubbed = scrubbed.replace(
    /(^|\s)\/(?:Users|home|var|tmp|etc|opt|sbin|bin|usr|dev|root|mnt|media|srv)([^\s:]+)/g,
    "$1[REDACTED_PATH]"
  );

  // Remove email-like patterns
  scrubbed = scrubbed.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[REDACTED_EMAIL]"
  );

  // Remove URLs with potential user data
  scrubbed = scrubbed.replace(/https?:\/\/[^\s]+/g, (match) => {
    try {
      const url = new URL(match);
      // Keep only domain, redact path if it contains potential IDs
      const pathHasId = /\/[a-f0-9-]{8,}|\/\d{4,}/.test(url.pathname);
      return pathHasId
        ? `${url.protocol}//${url.hostname}/[REDACTED_PATH]`
        : match;
    } catch {
      return "[REDACTED_URL]";
    }
  });

  // Remove potential UUIDs in error messages
  scrubbed = scrubbed.replace(
    /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
    "[REDACTED_UUID]"
  );

  return scrubbed;
}

/**
 * Error logging cooldown tracking
 * AC5: Throttling - max 1 error_caught per 10 seconds
 */
let lastErrorLogTime = 0;
const ERROR_LOG_COOLDOWN_MS = 10000; // 10 seconds

export function canLogError(): boolean {
  const now = Date.now();
  if (now - lastErrorLogTime >= ERROR_LOG_COOLDOWN_MS) {
    lastErrorLogTime = now;
    return true;
  }
  return false;
}

/**
 * Reset error cooldown (for testing)
 */
export function resetErrorCooldown(): void {
  lastErrorLogTime = 0;
}
