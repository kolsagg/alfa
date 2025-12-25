/**
 * BackupReminderBanner Component
 *
 * Story 5.4: Weekly backup reminder banner for Dashboard.
 *
 * Features:
 * - AC1-AC2: Non-intrusive banner with warning styling
 * - AC3: "Backup Now" triggers exportBackup()
 * - AC4: "Remind Later" dismisses for 24h
 * - AC5: "Don't Remind" permanently disables
 * - AC6: Soft prompt for first-time users
 */

import { useState } from "react";
import { AlertTriangle, Download, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings-store";
import { useBackupReminder } from "@/hooks/use-backup-reminder";
import { exportBackup } from "@/lib/backup/export-data";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

interface BackupReminderBannerProps {
  /** Additional CSS classes */
  className?: string;
}

type BannerState = "idle" | "exporting" | "success" | "error";

export function BackupReminderBanner({ className }: BackupReminderBannerProps) {
  const [bannerState, setBannerState] = useState<BannerState>("idle");

  const {
    setBackupReminderDismissed,
    setBackupReminderDisabled,
    setLastBackupDate,
  } = useSettingsStore();

  const { subscriptions } = useSubscriptionStore();
  const { shouldShowReminder, isFirstBackupSuggestion } = useBackupReminder();

  // Success state - show brief confirmation regardless of shouldShowReminder
  // This ensures the success message is visible even if the backup date was updated
  if (bannerState === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
          "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800",
          "text-green-800 dark:text-green-200",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2",
          className
        )}
      >
        <Download className="size-5" aria-hidden="true" />
        <span className="text-sm font-medium">
          {SETTINGS_STRINGS.BACKUP_SUCCESS_TOAST}
        </span>
      </div>
    );
  }

  if (!shouldShowReminder) {
    return null;
  }

  const handleBackupNow = async () => {
    setBannerState("exporting");

    try {
      const result = await exportBackup(
        subscriptions,
        useSettingsStore.getState()
      );

      if (result.success) {
        // Update lastBackupDate
        setLastBackupDate(new Date().toISOString());
        setBannerState("success");

        // Auto-hide after 2 seconds
        setTimeout(() => {
          setBannerState("idle");
        }, 2000);
      } else {
        setBannerState("error");
        console.error("[BackupReminderBanner] Export failed:", result.error);

        setTimeout(() => {
          setBannerState("idle");
        }, 3000);
      }
    } catch (error) {
      setBannerState("error");
      console.error("[BackupReminderBanner] Export error:", error);

      setTimeout(() => {
        setBannerState("idle");
      }, 3000);
    }
  };

  const handleRemindLater = () => {
    setBackupReminderDismissed();
  };

  const handleDontRemind = () => {
    setBackupReminderDisabled(true);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex flex-col gap-3 px-4 py-3 rounded-lg",
        "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800",
        "text-amber-800 dark:text-amber-200",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle
            className="size-5 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium">
              {isFirstBackupSuggestion
                ? SETTINGS_STRINGS.FIRST_BACKUP_SUGGESTION
                : SETTINGS_STRINGS.BACKUP_REMINDER_DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Close button for "Don't remind" */}
        <button
          type="button"
          onClick={handleDontRemind}
          className={cn(
            "shrink-0 p-1.5 rounded-md transition-colors",
            "hover:bg-amber-200/50 dark:hover:bg-amber-800/50",
            "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
            "dark:focus:ring-offset-amber-950"
          )}
          aria-label={SETTINGS_STRINGS.DONT_REMIND_BUTTON}
          title={SETTINGS_STRINGS.DONT_REMIND_BUTTON}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={handleBackupNow}
          disabled={bannerState === "exporting"}
          className="gap-1.5"
        >
          <Download className="size-4" aria-hidden="true" />
          {bannerState === "exporting"
            ? SETTINGS_STRINGS.PROCESSING
            : SETTINGS_STRINGS.BACKUP_NOW_BUTTON}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemindLater}
          disabled={bannerState === "exporting"}
          className="gap-1.5 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        >
          <Clock className="size-4" aria-hidden="true" />
          {SETTINGS_STRINGS.REMIND_LATER_BUTTON}
        </Button>
      </div>

      {/* Error state */}
      {bannerState === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {SETTINGS_STRINGS.EXPORT_ERROR}
        </p>
      )}
    </div>
  );
}
