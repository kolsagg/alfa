/**
 * DeveloperOptionsSection Component
 *
 * Story 7.3: Debug Log Export (Developer Mode)
 * AC2: Developer Options UI with export, clear, and stats
 * AC3: Export preview with privacy banner and checksum
 * AC4: Minification toggle and log analyzer
 */

import { useState, useMemo, useCallback } from "react";
import { Download, Trash2, Bug, AlertTriangle, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { logger } from "@/lib/event-logger";
import {
  generateDebugExport,
  calculateChecksum,
  downloadDebugExport,
  getExportSize,
} from "@/lib/debug-export";
import { formatBytes } from "@/types/debug-export";
import type { DebugExport } from "@/types/debug-export";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import { useSettingsStore } from "@/stores/settings-store";

// Size threshold for warning (1MB)
const SIZE_WARNING_THRESHOLD = 1024 * 1024;

export function DeveloperOptionsSection() {
  // States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [minify, setMinify] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [exportData, setExportData] = useState<DebugExport | null>(null);

  // Store access
  const setDeveloperMode = useSettingsStore((state) => state.setDeveloperMode);

  // Calculate log stats
  const logStats = useMemo(() => {
    const logs = logger.getEventLogs();
    const previewData = generateDebugExport();
    const size = getExportSize(previewData);
    return {
      count: logs.length,
      size,
      formattedSize: formatBytes(size),
      isLarge: size > SIZE_WARNING_THRESHOLD,
    };
  }, []);

  // Handle export preview
  const handleExportPreview = useCallback(async () => {
    const data = generateDebugExport();
    setExportData(data);

    // Calculate checksum
    const hash = await calculateChecksum(data);
    setChecksum(hash);

    setPreviewOpen(true);
  }, []);

  // Handle download
  const handleDownload = useCallback(() => {
    if (exportData) {
      downloadDebugExport(exportData, minify);
      setPreviewOpen(false);
    }
  }, [exportData, minify]);

  // Handle clear logs
  const handleClearLogs = useCallback(() => {
    logger.clearEventLogs();
    // Force re-render by closing any open dialogs
    setPreviewOpen(false);
    setExportData(null);
    setChecksum(null);
  }, []);

  // Handle toggle dev mode off
  const handleToggleDevMode = useCallback(() => {
    setDeveloperMode(false);
  }, [setDeveloperMode]);

  return (
    <div
      className="pt-3 border-t space-y-3"
      data-testid="developer-options-section"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Bug className="w-4 h-4 text-orange-500" aria-hidden="true" />
        <span className="font-medium text-sm">
          {SETTINGS_STRINGS.DEVELOPER_OPTIONS_TITLE}
        </span>
      </div>

      {/* Log Stats */}
      <div
        className="text-xs text-muted-foreground space-y-1"
        data-testid="log-stats"
      >
        <p>
          {SETTINGS_STRINGS.LOG_COUNT.replace(
            "{count}",
            logStats.count.toString()
          )}
        </p>
        <p className={logStats.isLarge ? "text-orange-500 font-medium" : ""}>
          {SETTINGS_STRINGS.ESTIMATED_SIZE.replace(
            "{size}",
            logStats.formattedSize
          )}
          {logStats.isLarge && (
            <span className="ml-1">
              <AlertTriangle className="w-3 h-3 inline" />
            </span>
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPreview}
          className="w-full justify-start gap-2"
          data-testid="export-debug-logs-button"
        >
          <Download className="w-4 h-4" />
          {SETTINGS_STRINGS.EXPORT_DEBUG_LOGS}
        </Button>

        {/* Clear Logs Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              data-testid="clear-logs-button"
            >
              <Trash2 className="w-4 h-4" />
              {SETTINGS_STRINGS.CLEAR_LOGS}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{SETTINGS_STRINGS.CLEAR_LOGS}</AlertDialogTitle>
              <AlertDialogDescription>
                {SETTINGS_STRINGS.CLEAR_LOGS_CONFIRM}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {SETTINGS_STRINGS.CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearLogs}
                className="bg-destructive hover:bg-destructive/90"
              >
                {SETTINGS_STRINGS.CLEAR_LOGS}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Dev Mode Toggle */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm">{SETTINGS_STRINGS.TOGGLE_DEV_MODE}</span>
        <Switch
          checked={true}
          onCheckedChange={handleToggleDevMode}
          data-testid="dev-mode-toggle"
        />
      </div>

      {/* Export Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              {SETTINGS_STRINGS.EXPORT_PREVIEW_TITLE}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Debug log export preview with privacy information and download
              options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Privacy Banner - AC3 */}
            <div
              className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3"
              data-testid="privacy-banner"
            >
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                ✓ {SETTINGS_STRINGS.DEBUG_PRIVACY_BANNER}
              </p>
            </div>

            {/* Export Stats */}
            {exportData && (
              <div className="text-sm space-y-2">
                <p>
                  <strong>
                    {SETTINGS_STRINGS.LOG_COUNT.replace(
                      "{count}",
                      exportData.event_logs.length.toString()
                    )}
                  </strong>
                </p>
                <p className="text-muted-foreground">
                  {SETTINGS_STRINGS.ESTIMATED_SIZE.replace(
                    "{size}",
                    formatBytes(getExportSize(exportData))
                  )}
                </p>
              </div>
            )}

            {/* Checksum - AC3 */}
            {checksum && (
              <div
                className="bg-muted/50 rounded p-2 font-mono text-xs break-all"
                data-testid="checksum-display"
              >
                <span className="font-semibold">
                  {SETTINGS_STRINGS.CHECKSUM_LABEL}
                </span>{" "}
                {checksum}
              </div>
            )}

            {/* Minify Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm">{SETTINGS_STRINGS.MINIFY_EXPORT}</span>
              <Switch
                checked={minify}
                onCheckedChange={setMinify}
                data-testid="minify-toggle"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
              data-testid="export-close-button"
            >
              {SETTINGS_STRINGS.EXPORT_CLOSE}
            </Button>
            <Button
              onClick={handleDownload}
              data-testid="export-download-button"
            >
              <Download className="w-4 h-4 mr-2" />
              {SETTINGS_STRINGS.EXPORT_DOWNLOAD}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
