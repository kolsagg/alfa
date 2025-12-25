/**
 * Storage Utility Functions
 *
 * Story 8.7: Calculate SubTracker-specific storage usage
 * AC2: Uses BACKUP_SIZE_THRESHOLD for limits
 * AC4: Efficient calculation with memoization
 */

import { BACKUP_SIZE_THRESHOLD } from "@/types/backup";

/**
 * SubTracker-specific localStorage keys to scan
 * Dev Notes: Must check both prod and dev keys
 */
export const SUBTRACKER_STORAGE_KEYS = [
  "subtracker-subscriptions",
  "subtracker-subscriptions-dev",
  "subtracker-settings",
  "subtracker-settings-dev",
  "subtracker-cards",
  "subtracker-cards-dev",
] as const;

export type StorageInfo = {
  usedBytes: number;
  limitBytes: number;
  usagePercentage: number;
  isWarning: boolean; // > 80% (4MB of 5MB)
};

/**
 * Memoized TextEncoder instance for efficient byte calculation
 */
const encoder = new TextEncoder();

/**
 * Calculate storage usage for SubTracker keys only
 * AC4: Uses TextEncoder for exact byte calculation as requested in Senior standards
 */
export function calculateStorageUsage(): StorageInfo {
  let totalBytes = 0;

  for (const key of SUBTRACKER_STORAGE_KEYS) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // More accurate than length * 2: encodes to UTF-8 and measures actual bytes
        totalBytes += encoder.encode(value).length;
      }
    } catch {
      // localStorage access may fail in private browsing
      continue;
    }
  }

  const limitBytes = BACKUP_SIZE_THRESHOLD;
  const usagePercentage = (totalBytes / limitBytes) * 100;
  const isWarning = usagePercentage > 80; // > 4MB of 5MB

  return {
    usedBytes: totalBytes,
    limitBytes,
    usagePercentage,
    isWarning,
  };
}

/**
 * Format bytes to human-readable string
 * Handles KB/MB formatting with proper precision
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Check if app is running in PWA standalone mode
 * AC1: PWA Context indicator
 */
export function isPWAMode(): boolean {
  // Check multiple PWA detection methods
  if (typeof window === "undefined") return false;

  // iOS standalone mode
  if ("standalone" in window.navigator) {
    return (
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
    );
  }

  // Standard display-mode check
  return window.matchMedia("(display-mode: standalone)").matches;
}
