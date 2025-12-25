/**
 * Import Confirmation Dialog
 *
 * Story 8.6: Danger Zone themed confirmation modal
 * AC4: Shows subscription count, most recent, and warning
 * AC5: Auto-backup toggle before import
 */

import { AlertTriangle, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";

export interface ImportConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionCount: number;
  mostRecentSubscription?: string;
  autoBackup: boolean;
  onAutoBackupChange: (checked: boolean) => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function ImportConfirmDialog({
  open,
  onOpenChange,
  subscriptionCount,
  mostRecentSubscription,
  autoBackup,
  onAutoBackupChange,
  onConfirm,
  isProcessing = false,
}: ImportConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="import-confirm-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {SETTINGS_STRINGS.CONFIRM_TITLE}
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p className="font-medium text-foreground">
              {subscriptionCount} {SETTINGS_STRINGS.CONFIRM_SUBSCRIPTION_COUNT}
            </p>
            {mostRecentSubscription && (
              <p className="text-sm">
                {SETTINGS_STRINGS.CONFIRM_MOST_RECENT}{" "}
                <span className="font-medium">{mostRecentSubscription}</span>
              </p>
            )}
            <p className="text-destructive/80 text-sm font-medium pt-2 border-t">
              {SETTINGS_STRINGS.CONFIRM_MESSAGE}
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Auto-backup toggle - AC5 */}
        <div className="flex items-center space-x-2 py-3">
          <Checkbox
            id="auto-backup"
            checked={autoBackup}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              onAutoBackupChange(checked === true)
            }
            data-testid="auto-backup-checkbox"
          />
          <Label
            htmlFor="auto-backup"
            className="text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {SETTINGS_STRINGS.CONFIRM_BACKUP_FIRST}
          </Label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {SETTINGS_STRINGS.CONFIRM_CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            data-testid="confirm-import-button"
          >
            {isProcessing
              ? SETTINGS_STRINGS.PROCESSING
              : SETTINGS_STRINGS.CONFIRM_PROCEED}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
