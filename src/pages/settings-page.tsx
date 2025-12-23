/**
 * Settings Page Component
 *
 * Story 8.2: Full Settings page replacing SettingsSheet
 * AC1: Accessible via /#/settings route
 * AC2: Functional migration - ThemeToggle, NotificationToggle preserved
 * AC3: 4 sections - Görünüm, Bildirimler, Veri Yönetimi, Hakkında
 * AC4: Mobile-first responsive design
 * AC5: Proper heading hierarchy and accessibility
 */

import { useState } from "react";
import { Palette, Bell, Database, Info } from "lucide-react";
import { SettingsSection } from "@/components/features/settings/settings-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationToggle } from "@/components/features/NotificationSettings/notification-toggle";
import { IOSInstallGuidance } from "@/components/ui/ios-install-guidance";

export default function SettingsPage() {
  // iOS PWA modal state for NotificationToggle (AC2: preserve functionality)
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <>
      <div className="space-y-6" data-testid="settings-page">
        {/* Page Title - h1 for proper heading hierarchy */}
        <h1 className="text-2xl font-bold">Ayarlar</h1>

        {/* Section 1: Görünüm (Theme) - AC3 */}
        <SettingsSection
          icon={Palette}
          title="Görünüm"
          description="Açık, koyu veya sistem tercihini seçin"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tema</p>
              <p className="text-sm text-muted-foreground">
                Uygulama görünümünü değiştirin
              </p>
            </div>
            <ThemeToggle />
          </div>
        </SettingsSection>

        {/* Section 2: Bildirimler (Notifications) - AC3 */}
        <SettingsSection
          icon={Bell}
          title="Bildirimler"
          description="Ödeme hatırlatıcılarınızı yönetin"
        >
          <NotificationToggle
            onIOSSafariDetected={() => setShowIOSModal(true)}
          />
        </SettingsSection>

        {/* Section 3: Veri Yönetimi (Data Management) - AC3, placeholder for Epic 5 */}
        <SettingsSection
          icon={Database}
          title="Veri Yönetimi"
          description="Verilerinizi yedekleyin ve geri yükleyin"
        >
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Yakında: Veri dışa/içe aktarma</p>
            <p className="text-xs mt-1">(Epic 5)</p>
          </div>
        </SettingsSection>

        {/* Section 4: Hakkında (About) - AC3 */}
        <SettingsSection
          icon={Info}
          title="Hakkında"
          description="Uygulama bilgileri ve gizlilik"
        >
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versiyon</span>
              <span className="font-mono">{__APP_VERSION__}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Veri Depolama</span>
              <span>Yalnızca Yerel (localStorage)</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              SubTracker tüm verilerinizi cihazınızda saklar. Hiçbir veri
              sunucuya gönderilmez. Gizliliğinize saygı duyuyoruz.
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
