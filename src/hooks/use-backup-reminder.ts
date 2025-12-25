import { useMemo } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useSubscriptionStore } from "@/stores/subscription-store";

const BACKUP_THRESHOLD_DAYS = 7;
const DISMISS_COOLDOWN_HOURS = 24;

export interface BackupReminderState {
  shouldShowReminder: boolean;
  isFirstBackupSuggestion: boolean;
}

/**
 * Hook to determine if backup reminder banner should be displayed.
 * Story 5.4: AC1-AC6
 *
 * Logic:
 * 1. If backupReminderDisabled = true -> never show
 * 2. If no subscriptions -> never show
 * 3. If dismissed within 24h -> don't show
 * 4. If lastBackupDate exists and 7+ days old -> show reminder
 * 5. If no lastBackupDate but oldest subscription 7+ days old -> show soft prompt
 */
export function useBackupReminder(): BackupReminderState {
  const { lastBackupDate, backupReminderDisabled, backupReminderDismissedAt } =
    useSettingsStore();

  const { subscriptions } = useSubscriptionStore();
  const thresholdMs = BACKUP_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  return useMemo(() => {
    // 1. Permanent disable check
    if (backupReminderDisabled) {
      return { shouldShowReminder: false, isFirstBackupSuggestion: false };
    }

    // 2. Data existence check: must have at least one subscription
    if (subscriptions.length === 0) {
      return { shouldShowReminder: false, isFirstBackupSuggestion: false };
    }

    // 3. Recently dismissed check (24h cooldown)
    if (backupReminderDismissedAt) {
      const dismissedAtTime = new Date(backupReminderDismissedAt).getTime();
      const now = new Date();
      const msSinceDismiss = now.getTime() - dismissedAtTime;
      const dismissCooldownMs = DISMISS_COOLDOWN_HOURS * 60 * 60 * 1000;

      if (msSinceDismiss < dismissCooldownMs) {
        return { shouldShowReminder: false, isFirstBackupSuggestion: false };
      }
    }

    // 4. Threshold Logic
    const now = new Date();

    if (lastBackupDate) {
      // 7+ days since last backup
      const lastBackupTime = new Date(lastBackupDate).getTime();
      const msSinceBackup = now.getTime() - lastBackupTime;

      if (msSinceBackup >= thresholdMs) {
        return { shouldShowReminder: true, isFirstBackupSuggestion: false };
      }
    } else {
      // Soft prompt: 7+ days since earliest subscription creation
      // ISO date strings are lexicographically sortable, no need to create Date objects in reduce
      const oldestSubscription = subscriptions.reduce((oldest, current) => {
        return current.createdAt < oldest.createdAt ? current : oldest;
      }, subscriptions[0]);

      if (oldestSubscription) {
        const oldestTime = new Date(oldestSubscription.createdAt).getTime();
        const msSinceCreation = now.getTime() - oldestTime;

        if (msSinceCreation >= thresholdMs) {
          return { shouldShowReminder: true, isFirstBackupSuggestion: true };
        }
      }
    }

    return { shouldShowReminder: false, isFirstBackupSuggestion: false };
  }, [
    subscriptions,
    lastBackupDate,
    backupReminderDisabled,
    backupReminderDismissedAt,
    thresholdMs,
  ]);
}
