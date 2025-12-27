/**
 * Debug Export Types and Schemas
 *
 * Story 7.3: Debug Log Export (Developer Mode)
 * - Debug export schema for developer mode
 * - Browser info sanitization
 * - Session summary structure
 */
import { z } from "zod";
import { EventLogEntrySchema } from "./event-log";

/**
 * Browser Info - Sanitized browser information
 * AC3: No PII in exports
 */
export const BrowserInfoSchema = z.object({
  userAgent: z.string(),
  platform: z.string(),
  language: z.string(),
});

export type BrowserInfo = z.infer<typeof BrowserInfoSchema>;

/**
 * Session Summary - Aggregated session information
 */
export const SessionSummarySchema = z.object({
  session_id: z.string().uuid(),
  logs_count: z.number().int().min(0),
  first_log_timestamp: z.string().datetime().optional(),
  last_log_timestamp: z.string().datetime().optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

/**
 * Debug Export - Full export structure
 * AC3: Structured format with all required fields
 */
export const DebugExportSchema = z.object({
  export_timestamp: z.string().datetime(),
  export_type: z.literal("debug_logs"),
  app_version: z.string(),
  schema_version: z.number().int().min(1),
  browser_info: BrowserInfoSchema,
  session_summary: SessionSummarySchema,
  event_logs: z.array(EventLogEntrySchema),
});

export type DebugExport = z.infer<typeof DebugExportSchema>;

/**
 * Helper function to generate browser info
 * Sanitizes user agent to remove sensitive details
 */
export function getSanitizedBrowserInfo(): BrowserInfo {
  // Sanitize user agent - keep only browser/OS family
  const ua = navigator.userAgent;
  let sanitizedUA = "Unknown Browser";

  if (ua.includes("Chrome")) {
    sanitizedUA = "Chrome-based Browser";
  } else if (ua.includes("Firefox")) {
    sanitizedUA = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    sanitizedUA = "Safari";
  } else if (ua.includes("Edge")) {
    sanitizedUA = "Edge";
  }

  // Sanitize platform - check UA first for mobile platforms
  let sanitizedPlatform = "Unknown Platform";
  const platform = navigator.platform || "";

  // Check UA first for mobile platforms (they may have different platform values)
  if (/iPhone|iPad|iPod/.test(ua)) {
    sanitizedPlatform = "iOS";
  } else if (/Android/.test(ua)) {
    sanitizedPlatform = "Android";
  } else if (platform.includes("Mac")) {
    sanitizedPlatform = "macOS";
  } else if (platform.includes("Win")) {
    sanitizedPlatform = "Windows";
  } else if (platform.includes("Linux")) {
    sanitizedPlatform = "Linux";
  }

  return {
    userAgent: sanitizedUA,
    platform: sanitizedPlatform,
    language: navigator.language.split("-")[0] || "en", // Only keep language code, not region
  };
}

/**
 * Estimate export size in bytes
 */
export function estimateExportSize(data: DebugExport): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
