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
import { DataSettings } from "@/components/features/settings/data-settings";
import { AboutSettings } from "@/components/features/settings/about-settings";
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

        {/* Section 3: Veri Yönetimi (Data Management) - Story 8.6: Full implementation */}
        <SettingsSection
          icon={Database}
          title={SETTINGS_STRINGS.SECTION_DATA_TITLE}
          description={SETTINGS_STRINGS.SECTION_DATA_DESC}
        >
          <DataSettings />
        </SettingsSection>

        {/* Section 4: Hakkında (About) - AC3, Story 8.7: Enhanced AboutSettings */}
        <SettingsSection
          icon={Info}
          title={SETTINGS_STRINGS.SECTION_ABOUT_TITLE}
          description={SETTINGS_STRINGS.SECTION_ABOUT_DESC}
        >
          <AboutSettings />
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
