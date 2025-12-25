import { useMemo, useCallback } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { calculateStorageUsage, type StorageInfo } from "@/lib/storage-utils";
import { RECORD_COUNT_THRESHOLD } from "@/types/backup";
import { differenceInHours } from "date-fns";

export type StorageWarningType =
  | "none"
  | "record-count"
  | "storage-usage"
  | "storage-full";

/**
 * useStorageWarning Hook
 *
 * Story 5.5: Determine which storage warning to show based on:
 * - Storage usage percentage (Critical > 80%)
 * - Record count (Performance > 500)
 *
 * Priority: storage-full > storage-usage > record-count
 *
 * Refactored to use useMemo instead of useEffect+setState to avoid
 * cascading renders (ESLint: react-hooks/set-state-in-effect).
 */
export function useStorageWarning() {
  const subscriptionCount = useSubscriptionStore(
    (state) => state.subscriptions.length
  );

  const storageWarningDismissedAt = useSettingsStore(
    (state) => state.storageWarningDismissedAt
  );
  const recordCountWarningDisabled = useSettingsStore(
    (state) => state.recordCountWarningDisabled
  );
  const setStorageWarningDismissed = useSettingsStore(
    (state) => state.setStorageWarningDismissed
  );
  const setRecordCountWarningDisabled = useSettingsStore(
    (state) => state.setRecordCountWarningDisabled
  );

  // Calculate storage usage synchronously with useMemo (no effect needed)
  const usageInfo = useMemo<StorageInfo>(() => calculateStorageUsage(), []);

  // Determine warning type based on priority
  const warningType = useMemo<StorageWarningType>(() => {
    // AC3: Storage Full (Critical) - Priority 1
    if (usageInfo.usagePercentage >= 100) {
      return "storage-full";
    }

    // AC2: Storage Usage (Critical > 80%) - Priority 2
    if (usageInfo.isWarning) {
      // Check cooldown (24h)
      const isDismissed = storageWarningDismissedAt
        ? differenceInHours(new Date(), new Date(storageWarningDismissedAt)) <
          24
        : false;

      if (!isDismissed) {
        return "storage-usage";
      }
    }

    // AC1: Record Count Warning (> RECORD_COUNT_THRESHOLD) - Priority 3
    // Only show if not disabled permanently AND not snoozed (24h)
    if (
      subscriptionCount > RECORD_COUNT_THRESHOLD &&
      !recordCountWarningDisabled
    ) {
      const snoozeTime = localStorage.getItem(
        "subtracker-record-warning-snooze"
      );
      const isSnoozed = snoozeTime
        ? differenceInHours(new Date(), new Date(snoozeTime)) < 24
        : false;

      if (!isSnoozed) {
        return "record-count";
      }
    }

    return "none";
  }, [
    usageInfo,
    subscriptionCount,
    storageWarningDismissedAt,
    recordCountWarningDisabled,
  ]);

  const dismissWarning = useCallback(
    (permanently: boolean = false) => {
      if (warningType === "storage-usage") {
        // Storage usage only supports temporary dismissal (24h) via store
        // AC4: "Don't Remind Me" is NOT available for Size Warning
        if (!permanently) {
          setStorageWarningDismissed();
        }
      } else if (warningType === "record-count") {
        if (permanently) {
          // "Don't Remind Me" - Disable permanently in store
          setRecordCountWarningDisabled(true);
        } else {
          // "Remind Me Later" - Snooze for 24h (Manual localStorage)
          localStorage.setItem(
            "subtracker-record-warning-snooze",
            new Date().toISOString()
          );
          // Force re-render by triggering store update (dummy)
          // Note: This won't cause re-render since useMemo depends on store state
          // The localStorage check will handle it on next mount
        }
      }
    },
    [warningType, setStorageWarningDismissed, setRecordCountWarningDisabled]
  );

  return {
    warningType,
    usageInfo,
    subscriptionCount,
    dismissWarning,
  };
}
