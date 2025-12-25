/**
 * AboutSettings Component
 *
 * Story 8.7: Comprehensive About section for Settings page
 * AC1: Enhanced UI with app identity, PWA context, storage, privacy
 * AC2: Storage tracking with BACKUP_SIZE_THRESHOLD integration
 * AC3: Privacy & transparency statements (NFR07)
 * AC4: Accessibility & performance with memoization
 */

import { useMemo } from "react";
import { CalendarDays, Shield, HardDrive } from "lucide-react";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import {
  calculateStorageUsage,
  formatBytes,
  isPWAMode,
} from "@/lib/storage-utils";

export function AboutSettings() {
  // AC4: Memoize storage calculation to avoid blocking UI
  const storageInfo = useMemo(() => calculateStorageUsage(), []);

  // PWA detection
  const isPwa = useMemo(() => isPWAMode(), []);

  return (
    <div className="space-y-4" data-testid="about-settings">
      {/* Identity Header - AC1 */}
      <div
        className="flex items-center gap-3 pb-3 border-b"
        data-testid="about-identity"
      >
        <div className="p-2 rounded-lg bg-primary/10">
          <CalendarDays className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{SETTINGS_STRINGS.APP_NAME}</h3>
          <p className="text-sm text-muted-foreground">
            {SETTINGS_STRINGS.TAGLINE}
          </p>
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-3 text-sm">
        {/* Version Row */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {SETTINGS_STRINGS.VERSION}
          </span>
          <span className="font-mono" data-testid="about-version">
            {__APP_VERSION__}
          </span>
        </div>

        {/* Platform Row - AC1: PWA Context */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {SETTINGS_STRINGS.PLATFORM_LABEL}
          </span>
          <span data-testid="about-platform">
            {isPwa ? SETTINGS_STRINGS.PWA_MODE : SETTINGS_STRINGS.BROWSER_MODE}
          </span>
        </div>

        {/* Storage Row - AC2 */}
        <div
          className="flex justify-between items-center"
          data-testid="about-storage"
        >
          <div className="flex items-center gap-2">
            <HardDrive
              className="w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">
              {SETTINGS_STRINGS.STORAGE_USAGE_LABEL}
            </span>
          </div>
          <span
            className={
              storageInfo.isWarning ? "text-destructive font-medium" : ""
            }
            data-testid="about-storage-value"
          >
            {formatBytes(storageInfo.usedBytes)} /{" "}
            {formatBytes(storageInfo.limitBytes)}
          </span>
        </div>
      </div>

      {/* Privacy Section - AC3 */}
      <div className="pt-3 border-t space-y-2" data-testid="about-privacy">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
          <span className="font-medium text-sm">
            {SETTINGS_STRINGS.PRIVACY_TITLE}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {SETTINGS_STRINGS.NO_TRACKING_STATEMENT}
        </p>
        <p className="text-xs text-muted-foreground">
          {SETTINGS_STRINGS.NO_THIRD_PARTY}
        </p>
      </div>

      {/* Credits Footer - AC1 */}
      <div className="pt-3 border-t text-center" data-testid="about-credits">
        <p className="text-xs text-muted-foreground">
          {SETTINGS_STRINGS.MADE_WITH_LOVE}
        </p>
      </div>
    </div>
  );
}
