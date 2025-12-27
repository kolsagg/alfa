/**
 * AboutSettings Component
 *
 * Story 8.7: Comprehensive About section for Settings page
 * AC1: Enhanced UI with app identity, PWA context, storage, privacy
 * AC2: Storage tracking with BACKUP_SIZE_THRESHOLD integration
 * AC3: Privacy & transparency statements (NFR07)
 * AC4: Accessibility & performance with memoization
 *
 * Story 7.3: Developer Mode Activation
 * - Long-press (1.5s) on version text enables developer mode
 * - Dev mode badge shown when active
 * - Developer Options section shown when active
 */

import { useMemo, useRef, useCallback, useEffect } from "react";
import { CalendarDays, Shield, HardDrive } from "lucide-react";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import {
  calculateStorageUsage,
  formatBytes,
  isPWAMode,
} from "@/lib/storage-utils";
import { useSettingsStore } from "@/stores/settings-store";
import { DeveloperOptionsSection } from "./developer-options";

// Long-press duration for dev mode activation (ms)
const LONG_PRESS_DURATION = 1500;

export function AboutSettings() {
  // AC4: Memoize storage calculation to avoid blocking UI
  const storageInfo = useMemo(() => calculateStorageUsage(), []);

  // PWA detection
  const isPwa = useMemo(() => isPWAMode(), []);

  // Story 7.3: Developer mode state
  const developerMode = useSettingsStore((state) => state.developerMode);
  const setDeveloperMode = useSettingsStore((state) => state.setDeveloperMode);

  // Long-press detection refs
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Story 7.3 AC1: Check URL param for dev mode on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("debug") === "true") {
      setDeveloperMode(true);
    }
  }, [setDeveloperMode]);

  // Long-press handlers for version text
  const handlePressStart = useCallback(() => {
    longPressTimeoutRef.current = setTimeout(() => {
      setDeveloperMode(!developerMode);
    }, LONG_PRESS_DURATION);
  }, [developerMode, setDeveloperMode]);

  const handlePressEnd = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

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
        {/* Version Row with Long-Press Detection */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {SETTINGS_STRINGS.VERSION}
          </span>
          <span
            className="font-mono select-none flex items-center gap-1"
            data-testid="about-version"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
          >
            {__APP_VERSION__}
            {developerMode && (
              <span
                className="ml-1"
                data-testid="dev-mode-badge"
                title={SETTINGS_STRINGS.DEV_MODE_ENABLED}
              >
                {SETTINGS_STRINGS.DEV_MODE_BADGE}
              </span>
            )}
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

      {/* Story 7.3: Developer Options Section - Only visible in dev mode */}
      {developerMode && <DeveloperOptionsSection />}

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
          {SETTINGS_STRINGS.COPYRIGHT}
        </p>
      </div>
    </div>
  );
}
