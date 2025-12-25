/**
 * DashboardAlerts Container
 *
 * Story 5.5: Centralized container for dashboard warnings and alerts.
 * Manages stacking order and priority:
 * 1. Storage Limit Warnings (Critical/High)
 * 2. Backup Reminder (Normal)
 */

import { BackupReminderBanner } from "@/components/features/backup/backup-reminder-banner";
import { StorageLimitWarning } from "@/components/features/backup/storage-limit-warning";

export function DashboardAlerts() {
  return (
    <div className="space-y-4 mb-6" data-testid="dashboard-alerts">
      {/* High Priority: Storage & Record Limits */}
      <StorageLimitWarning />

      {/* Normal Priority: Backup Reminders */}
      <BackupReminderBanner />
    </div>
  );
}
