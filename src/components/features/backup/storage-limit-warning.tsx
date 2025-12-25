/**
 * StorageLimitWarning Component
 *
 * Story 5.5: Warn users when storage limits are approached.
 */

import { useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, Download, Database, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings-store";
import { useStorageWarning } from "@/hooks/use-storage-warning";
import { exportBackup } from "@/lib/backup/export-data";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import { formatBytes } from "@/lib/storage-utils";
import { cn } from "@/lib/utils";

interface StorageLimitWarningProps {
  className?: string;
}

type BannerState = "idle" | "exporting" | "success" | "error";

export function StorageLimitWarning({ className }: StorageLimitWarningProps) {
  const { warningType, usageInfo, subscriptionCount, dismissWarning } =
    useStorageWarning();
  const [bannerState, setBannerState] = useState<BannerState>("idle");
  const { setLastBackupDate } = useSettingsStore();
  const { subscriptions } = useSubscriptionStore();

  if (
    warningType === "none" &&
    bannerState !== "success" &&
    bannerState !== "error"
  ) {
    return null;
  }

  // Handle success feedback
  if (bannerState === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-3 rounded-lg mb-4",
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

  const handleBackupNow = async () => {
    setBannerState("exporting");
    try {
      const result = await exportBackup(
        subscriptions,
        useSettingsStore.getState()
      );

      if (result.success) {
        setLastBackupDate(new Date().toISOString());
        setBannerState("success");
        setTimeout(() => setBannerState("idle"), 2000);
      } else {
        setBannerState("error");
        setTimeout(() => setBannerState("idle"), 3000);
      }
    } catch (error) {
      console.error(error);
      setBannerState("error");
      setTimeout(() => setBannerState("idle"), 3000);
    }
  };

  const isCritical =
    warningType === "storage-full" || warningType === "storage-usage";
  const isStorageFull = warningType === "storage-full";
  const isRecordCount = warningType === "record-count";

  // Define content based on warning type
  let title = "";
  let description = "";

  if (isStorageFull) {
    title = SETTINGS_STRINGS.STORAGE_WARNING_CRITICAL_TITLE;
    description = SETTINGS_STRINGS.STORAGE_FULL_DESCRIPTION;
  } else if (warningType === "storage-usage") {
    title = SETTINGS_STRINGS.STORAGE_WARNING_TITLE;
    description = SETTINGS_STRINGS.STORAGE_WARNING_DESCRIPTION.replace(
      "{usage}",
      usageInfo.usagePercentage.toFixed(0) + "%"
    )
      .replace("{total}", formatBytes(usageInfo.limitBytes))
      .replace("{used}", formatBytes(usageInfo.usedBytes));
  } else if (warningType === "record-count") {
    title = SETTINGS_STRINGS.RECORD_COUNT_WARNING_TITLE;
    // AC1: Display accurate count
    description = SETTINGS_STRINGS.RECORD_COUNT_WARNING_DESCRIPTION.replace(
      "{count}",
      subscriptionCount.toString()
    );
  }

  // Styles based on severity
  const colors = isCritical
    ? {
        bg: "bg-red-50 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-800 dark:text-red-200",
        icon: "text-red-600 dark:text-red-400",
        hover:
          "hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300",
      }
    : {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-800 dark:text-amber-200",
        icon: "text-amber-600 dark:text-amber-400",
        hover:
          "hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300",
      };

  return (
    <div
      role="alert"
      aria-live={isCritical ? "assertive" : "polite"}
      className={cn(
        "flex flex-col gap-3 px-4 py-3 rounded-lg border",
        colors.bg,
        colors.border,
        colors.text,
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={cn("size-5 shrink-0 mt-0.5", colors.icon)}
          />
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-sm mt-1 opacity-90">{description}</p>
          </div>
        </div>

        {/* Close (Don't Remind) - Only for Record Count */}
        {isRecordCount && (
          <button
            onClick={() => dismissWarning(true)}
            className={cn(
              "shrink-0 p-1.5 rounded-md transition-colors",
              colors.hover,
              "focus:outline-none focus:ring-2 focus:ring-offset-2"
            )}
            title={SETTINGS_STRINGS.DONT_REMIND_BUTTON}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-1">
        {/* Backup Now */}
        <Button
          size="sm"
          variant={isCritical ? "destructive" : "default"}
          onClick={handleBackupNow}
          disabled={bannerState === "exporting"}
          className="gap-1.5"
        >
          <Download className="size-4" />
          {bannerState === "exporting"
            ? SETTINGS_STRINGS.PROCESSING
            : SETTINGS_STRINGS.BACKUP_NOW_BUTTON}
        </Button>

        {/* Manage Data */}
        <Button
          size="sm"
          variant="outline"
          asChild
          className={cn(
            "bg-transparent border-current/30 hover:bg-current/10",
            colors.text
          )}
        >
          <Link to="/settings?section=data">
            <Database className="size-4 mr-1.5" />
            {SETTINGS_STRINGS.MANAGE_DATA_BUTTON}
          </Link>
        </Button>

        {/* Remind Me Later - Not for Storage Full */}
        {!isStorageFull && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dismissWarning(false)}
            disabled={bannerState === "exporting"}
            className={cn("gap-1.5", colors.hover)}
          >
            <Clock className="size-4" />
            {SETTINGS_STRINGS.REMIND_LATER_BUTTON}
          </Button>
        )}
      </div>

      {bannerState === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          {SETTINGS_STRINGS.EXPORT_ERROR}
        </p>
      )}
    </div>
  );
}
