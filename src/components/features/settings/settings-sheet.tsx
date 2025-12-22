/**
 * SettingsSheet Component
 *
 * Party Mode Consensus: Settings Sheet pattern for quick access to app settings.
 * Full routing will be implemented in Epic 8.
 *
 * Sections:
 * - Theme (light/dark/system)
 * - Notifications (NotificationToggle integration)
 * - Data (placeholder for Epic 5 - Export/Import)
 * - About (version, privacy info)
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationToggle } from "@/components/features/NotificationSettings/notification-toggle";
import { IOSInstallGuidance } from "@/components/ui/ios-install-guidance";
import { Settings, Bell, Palette, Database, Info } from "lucide-react";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  // iOS PWA modal state for NotificationToggle
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Ayarlar
            </SheetTitle>
            <SheetDescription>Uygulama tercihlerinizi yönetin</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Theme Section */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Palette className="size-4" />
                Görünüm
              </h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    Açık, koyu veya sistem tercihini seçin
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </section>

            <Separator />

            {/* Notifications Section */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Bell className="size-4" />
                Bildirimler
              </h3>
              <div className="p-3 rounded-lg bg-muted/50">
                <NotificationToggle
                  onIOSSafariDetected={() => setShowIOSModal(true)}
                />
              </div>
            </section>

            <Separator />

            {/* Data Section (Placeholder for Epic 5) */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Database className="size-4" />
                Veri Yönetimi
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                <p>Yakında: Veri dışa/içe aktarma</p>
                <p className="text-xs mt-1">(Epic 5)</p>
              </div>
            </section>

            <Separator />

            {/* About Section */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Info className="size-4" />
                Hakkında
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versiyon</span>
                  <span className="font-mono">0.1.0</span>
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
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* iOS Install Guidance Modal */}
      <IOSInstallGuidance
        triggeredBySettings
        open={showIOSModal}
        onOpenChange={setShowIOSModal}
      />
    </>
  );
}
