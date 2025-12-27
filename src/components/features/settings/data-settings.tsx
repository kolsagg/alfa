/**
 * Data Settings Component
 *
 * Story 8.6: Data export/import UI
 * AC1: Export button, Import button, last backup indicator
 * AC2: JSON export with version tracking
 * AC3: Security whitelisting for import
 * AC5: Auto-backup option before import
 */

import { useState, useRef } from "react";
import { Download, Upload, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useCardStore } from "@/stores/card-store";
import {
  exportBackup,
  parseAndValidateBackup,
  createPreImportBackup,
} from "@/lib/backup";
import type { Backup } from "@/types/backup";
import { ImportConfirmDialog } from "./import-confirm-dialog";
import { toast } from "sonner";
import { logger } from "@/lib/event-logger";

type OperationState = "idle" | "processing" | "success" | "error";

interface PendingImport {
  backup: Backup;
  subscriptionCount: number;
  mostRecentSubscription?: string;
}

export function DataSettings() {
  // Store access
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const lastBackupDate = useSettingsStore((state) => state.lastBackupDate);
  const setLastBackupDate = useSettingsStore(
    (state) => state.setLastBackupDate
  );

  // Component state
  const [exportState, setExportState] = useState<OperationState>("idle");
  const [importState, setImportState] = useState<OperationState>("idle");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [autoBackup, setAutoBackup] = useState<boolean>(true);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(
    null
  );

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Format last backup date for display
   */
  const formatLastBackup = (): string => {
    if (!lastBackupDate) return SETTINGS_STRINGS.LAST_BACKUP_NEVER;

    try {
      const date = new Date(lastBackupDate);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return SETTINGS_STRINGS.LAST_BACKUP_NEVER;
    }
  };

  /**
   * Handle export button click
   * AC2: Generates and downloads backup file
   */
  const handleExport = async () => {
    if (subscriptions.length === 0) {
      toast.error("Yedeklenecek abonelik bulunamadı");
      return;
    }

    setExportState("processing");

    try {
      // Get current settings and cards for export
      const settings = useSettingsStore.getState();
      const cards = useCardStore.getState().cards;

      const result = exportBackup(subscriptions, settings, cards);

      if (result.success) {
        setExportState("success");
        setLastBackupDate(new Date().toISOString());

        // NFR15: Size warning
        if (result.sizeWarning) {
          toast.warning(SETTINGS_STRINGS.EXPORT_SIZE_WARNING);
        } else {
          toast.success(SETTINGS_STRINGS.EXPORT_SUCCESS);
        }

        // Story 7.1: Log export event
        logger.log("export_triggered", {
          subscription_count: subscriptions.length,
          card_count: cards.length,
        });

        // Reset state after feedback
        setTimeout(() => setExportState("idle"), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("[DataSettings] Export error:", error);
      setExportState("error");
      toast.error(SETTINGS_STRINGS.EXPORT_ERROR);
      setTimeout(() => setExportState("idle"), 2000);
    }
  };

  /**
   * Handle import button click - trigger file picker
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection
   * AC4: Validate and show preview before import
   */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input for re-selection
    event.target.value = "";

    setImportState("processing");

    try {
      const result = await parseAndValidateBackup(file);

      if (!result.success) {
        setImportState("error");

        // Show appropriate error message
        switch (result.errorCode) {
          case "VERSION_MISMATCH":
            toast.error(SETTINGS_STRINGS.VERSION_MISMATCH_ERROR);
            break;
          case "EMPTY_BACKUP":
            toast.error(SETTINGS_STRINGS.EMPTY_BACKUP_ERROR);
            break;
          case "INVALID_FORMAT":
            toast.error(SETTINGS_STRINGS.INVALID_FILE_ERROR);
            break;
          default:
            toast.error(result.error || SETTINGS_STRINGS.IMPORT_ERROR);
        }

        setTimeout(() => setImportState("idle"), 2000);
        return;
      }

      // Valid backup - show confirmation dialog
      setPendingImport({
        backup: result.data!,
        subscriptionCount: result.subscriptionCount!,
        mostRecentSubscription: result.mostRecentSubscription,
      });
      setShowConfirmDialog(true);
      setImportState("idle");
    } catch (error) {
      console.error("[DataSettings] Import validation error:", error);
      setImportState("error");
      toast.error(SETTINGS_STRINGS.IMPORT_ERROR);
      setTimeout(() => setImportState("idle"), 2000);
    }
  };

  /**
   * Handle confirmed import
   * AC5: Optional auto-backup, then replace data
   */
  const handleConfirmImport = async () => {
    if (!pendingImport) return;

    setImportState("processing");

    try {
      // AC5: Create auto-backup if enabled
      if (
        autoBackup &&
        (subscriptions.length > 0 || useCardStore.getState().cards.length > 0)
      ) {
        const settings = useSettingsStore.getState();
        const cards = useCardStore.getState().cards;
        const backupResult = createPreImportBackup(
          subscriptions,
          settings,
          cards
        );

        if (!backupResult.success) {
          throw new Error("Pre-import backup failed");
        }
      }

      // Replace cards via store action if present in backup
      if (pendingImport.backup.cards) {
        const cardSuccess = useCardStore
          .getState()
          .importCards(pendingImport.backup.cards);
        if (!cardSuccess) throw new Error("Card import failed");
      }

      // Replace subscriptions via store action
      const subSuccess = useSubscriptionStore
        .getState()
        .importSubscriptions(pendingImport.backup.subscriptions);

      if (!subSuccess) throw new Error("Subscription import failed");

      // Merge whitelisted settings via store action
      if (pendingImport.backup.settings) {
        useSettingsStore
          .getState()
          .mergeSettings(pendingImport.backup.settings);
      }

      setImportState("success");
      setShowConfirmDialog(false);
      setPendingImport(null);
      toast.success(SETTINGS_STRINGS.IMPORT_SUCCESS);

      // Story 7.1: Log import event
      logger.log("import_triggered", {
        subscription_count: pendingImport.subscriptionCount,
        had_auto_backup: autoBackup,
      });

      setTimeout(() => setImportState("idle"), 2000);
    } catch (error) {
      console.error("[DataSettings] Import error:", error);
      setImportState("error");
      setShowConfirmDialog(false);
      toast.error(SETTINGS_STRINGS.IMPORT_ERROR);
      setTimeout(() => setImportState("idle"), 2000);
    }
  };

  /**
   * Get button icon based on state
   */
  const getExportIcon = () => {
    switch (exportState) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <Check className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getImportIcon = () => {
    switch (importState) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <Check className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4" data-testid="data-settings">
      {/* Export/Import buttons - AC1 */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={
            exportState === "processing" ||
            exportState === "success" ||
            exportState === "error" ||
            subscriptions.length === 0
          }
          className="flex-1"
          data-testid="export-button"
        >
          {getExportIcon()}
          <span className="ml-2">{SETTINGS_STRINGS.EXPORT_BUTTON}</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleImportClick}
          disabled={
            importState === "processing" ||
            importState === "success" ||
            importState === "error"
          }
          className="flex-1"
          data-testid="import-button"
        >
          {getImportIcon()}
          <span className="ml-2">{SETTINGS_STRINGS.IMPORT_BUTTON}</span>
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="import-file-input"
        />
      </div>

      {/* Last backup indicator - AC1 */}
      <p className="text-sm text-muted-foreground" data-testid="last-backup">
        {SETTINGS_STRINGS.LAST_BACKUP_LABEL} {formatLastBackup()}
      </p>

      {/* Backup Reminder Toggle - Story 5.4 AC8 */}
      <BackupReminderToggle />

      {/* Import confirmation dialog - AC4 */}
      <ImportConfirmDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          setShowConfirmDialog(open);
          if (!open) setPendingImport(null);
        }}
        subscriptionCount={pendingImport?.subscriptionCount ?? 0}
        mostRecentSubscription={pendingImport?.mostRecentSubscription}
        autoBackup={autoBackup}
        onAutoBackupChange={setAutoBackup}
        onConfirm={handleConfirmImport}
        isProcessing={importState === "processing"}
      />
    </div>
  );
}

/**
 * Backup Reminder Toggle Component
 * Story 5.4 AC8: Toggle for enabling/disabling backup reminders
 */
function BackupReminderToggle() {
  const backupReminderDisabled = useSettingsStore(
    (state) => state.backupReminderDisabled
  );
  const setBackupReminderDisabled = useSettingsStore(
    (state) => state.setBackupReminderDisabled
  );

  // Toggle is "enabled" when backupReminderDisabled is false
  const isEnabled = !backupReminderDisabled;

  const handleToggle = (checked: boolean) => {
    // When toggle is ON (checked=true), reminders are enabled (disabled=false)
    setBackupReminderDisabled(!checked);
  };

  return (
    <div
      className="flex items-center justify-between gap-4 py-2"
      data-testid="backup-reminder-toggle"
    >
      <div className="space-y-0.5">
        <Label
          htmlFor="backup-reminder-switch"
          className="text-sm font-medium cursor-pointer"
        >
          {SETTINGS_STRINGS.BACKUP_REMINDERS_TOGGLE}
        </Label>
        <p className="text-xs text-muted-foreground">
          {SETTINGS_STRINGS.BACKUP_REMINDERS_HELPER}
        </p>
      </div>
      <Switch
        id="backup-reminder-switch"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        aria-label={SETTINGS_STRINGS.BACKUP_REMINDERS_TOGGLE}
      />
    </div>
  );
}
