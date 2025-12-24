/**
 * Settings Page Component
 *
 * Story 8.2: Full Settings page replacing SettingsSheet
 * Story 8.4: Enhanced Theme section with ThemeSelector
 * AC1: Accessible via /#/settings route
 * AC2: Functional migration - ThemeToggle, NotificationToggle preserved
 * AC3: 4 sections - Görünüm, Bildirimler, Veri Yönetimi, Hakkında
 * AC4: Mobile-first responsive design
 * AC5: Proper heading hierarchy and accessibility
 */

import { useState } from "react";
import { Palette, Bell, Database, Info } from "lucide-react";
import { SettingsSection } from "@/components/features/settings/settings-section";
import { ThemeSelector } from "@/components/features/settings/theme-selector";
import { NotificationSettings } from "@/components/features/settings/notification-settings";
import { IOSInstallGuidance } from "@/components/ui/ios-install-guidance";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";

export default function SettingsPage() {
  // iOS PWA modal state for NotificationToggle (AC2: preserve functionality)
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <>
      <div className="space-y-6" data-testid="settings-page">
        {/* Page Title - h1 for proper heading hierarchy */}
        <h1 className="text-2xl font-bold">{SETTINGS_STRINGS.PAGE_TITLE}</h1>

        {/* Section 1: Görünüm (Theme) - Story 8.4: Enhanced with ThemeSelector */}
        <SettingsSection
          icon={Palette}
          title={SETTINGS_STRINGS.SECTION_THEME_TITLE}
          description={SETTINGS_STRINGS.SECTION_THEME_DESC}
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                {SETTINGS_STRINGS.SECTION_THEME_SUBTITLE}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {SETTINGS_STRINGS.SECTION_THEME_HELPER}
              </p>
            </div>
            <ThemeSelector />
          </div>
        </SettingsSection>

        {/* Section 2: Bildirimler (Notifications) - AC3, Story 8.5: Enhanced with NotificationSettings */}
        <SettingsSection
          icon={Bell}
          title={SETTINGS_STRINGS.SECTION_NOTIFICATIONS_TITLE}
          description={SETTINGS_STRINGS.SECTION_NOTIFICATIONS_DESC}
        >
          <NotificationSettings
            onIOSSafariDetected={() => setShowIOSModal(true)}
          />
        </SettingsSection>

        {/* Section 3: Veri Yönetimi (Data Management) - AC3, placeholder for Epic 5 */}
        <SettingsSection
          icon={Database}
          title={SETTINGS_STRINGS.SECTION_DATA_TITLE}
          description={SETTINGS_STRINGS.SECTION_DATA_DESC}
        >
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">
              {SETTINGS_STRINGS.SECTION_DATA_COMING_SOON}
            </p>
            <p className="text-xs mt-1">(Epic 5)</p>
          </div>
        </SettingsSection>

        {/* Section 4: Hakkında (About) - AC3 */}
        <SettingsSection
          icon={Info}
          title={SETTINGS_STRINGS.SECTION_ABOUT_TITLE}
          description={SETTINGS_STRINGS.SECTION_ABOUT_DESC}
        >
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {SETTINGS_STRINGS.VERSION}
              </span>
              <span className="font-mono">{__APP_VERSION__}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {SETTINGS_STRINGS.DATA_STORAGE}
              </span>
              <span>{SETTINGS_STRINGS.LOCAL_ONLY}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              {SETTINGS_STRINGS.PRIVACY_STATEMENT}
            </p>
          </div>
        </SettingsSection>
      </div>

      {/* iOS Install Guidance Modal - AC2: preserve functionality from SettingsSheet */}
      <IOSInstallGuidance
        triggeredBySettings
        open={showIOSModal}
        onOpenChange={setShowIOSModal}
      />
    </>
  );
}
