import { useState, useCallback } from "react";
import { Share, PlusSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings-store";
import {
  useIOSPWADetection,
  detectIOSSafariNonStandalone,
} from "@/hooks/use-ios-pwa-detection";

import { NOTIFICATION_CONFIG } from "@/config/notifications";

interface IOSInstallGuidanceProps {
  /**
   * When true, component is controlled by external state (notification settings).
   * When false (default), component auto-shows based on iOS detection.
   */
  triggeredBySettings?: boolean;
  /**
   * External open state for controlled mode
   */
  open?: boolean;
  /**
   * Callback when modal closes in controlled mode
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * iOS PWA Installation Guidance Modal
 *
 * Two modes:
 * 1. Automatic (default): Shows based on iOS detection + dismissal logic
 * 2. Triggered by Settings: Controlled by external state (notification toggle)
 *
 * Story 4.2 AC#5: When triggered from notification settings, shows
 * "Bildirimler için Ana Ekrana Ekle" with different buttons.
 */
export function IOSInstallGuidance({
  triggeredBySettings = false,
  open: controlledOpen,
  onOpenChange,
}: IOSInstallGuidanceProps) {
  const { shouldShowPrompt } = useIOSPWADetection();
  const dismissIOSPrompt = useSettingsStore((state) => state.dismissIOSPrompt);

  // For triggeredBySettings mode, "Kurdum" button re-checks standalone mode
  const [isCheckingInstall, setIsCheckingInstall] = useState(false);

  // Determine if dialog should be open
  const isOpen = triggeredBySettings ? controlledOpen : shouldShowPrompt;

  const handleClose = useCallback(() => {
    if (triggeredBySettings && onOpenChange) {
      onOpenChange(false);
    } else {
      dismissIOSPrompt();
    }
  }, [triggeredBySettings, onOpenChange, dismissIOSPrompt]);

  // "Kurdum" button handler - re-check if now in standalone mode
  const handleInstallConfirm = useCallback(() => {
    setIsCheckingInstall(true);

    // Small delay to allow PWA transition
    setTimeout(() => {
      const stillNonStandalone = detectIOSSafariNonStandalone();

      if (!stillNonStandalone) {
        // User is now in PWA mode, close modal
        handleClose();
      } else {
        // Still in Safari, dismiss with 7-day snooze
        dismissIOSPrompt();
        handleClose();
      }

      setIsCheckingInstall(false);
    }, 500);
  }, [handleClose, dismissIOSPrompt]);

  // "Sonra" button handler - dismiss with 7-day snooze
  const handleLater = useCallback(() => {
    dismissIOSPrompt();
    handleClose();
  }, [dismissIOSPrompt, handleClose]);

  if (!isOpen) return null;

  // Content varies based on mode
  const title = triggeredBySettings
    ? "Bildirimler için Ana Ekrana Ekle"
    : "Ana Ekrana Ekle";

  const description = triggeredBySettings
    ? "iOS'ta bildirim almak için SubTracker'ı ana ekranınıza eklemeniz gerekiyor."
    : "SubTracker'ı tam ekran modunda kullanmak ve bildirimlerden haberdar olmak için ana ekranınıza ekleyin.";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-3xl border-none bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full h-8 w-8 hover:bg-muted"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Kapat</span>
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 mb-6 aspect-square overflow-hidden rounded-2xl bg-muted/50">
          <img
            src={NOTIFICATION_CONFIG.ASSETS.IOS_GUIDANCE}
            alt="iOS Kurulum Rehberi"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 tabular-nums">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </span>
              <span>Safari'de 'Paylaş' simgesine dokunun</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 tabular-nums mt-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </span>
              <span>'Ana Ekrana Ekle' seçeneğini seçin</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-start gap-4 p-3 rounded-xl bg-accent/50 border border-border/50">
            <Share className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">1. Paylaş Simgesi</p>
              <p className="text-xs text-muted-foreground">
                Tarayıcınızın alt kısmındaki yukarı oklu kutucuğa dokunun.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-3 rounded-xl bg-accent/50 border border-border/50">
            <PlusSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">2. Ana Ekrana Ekle</p>
              <p className="text-xs text-muted-foreground">
                Açılan menüde aşağı kaydırıp "Ana Ekrana Ekle" butonunu bulun.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {triggeredBySettings ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleLater}
                className="flex-1 h-12 rounded-xl text-md font-medium"
              >
                Sonra
              </Button>
              <Button
                onClick={handleInstallConfirm}
                disabled={isCheckingInstall}
                className="flex-1 h-12 rounded-xl text-md font-medium shadow-lg shadow-primary/20"
              >
                {isCheckingInstall ? "Kontrol ediliyor..." : "Kurdum"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleClose}
              className="w-full h-12 rounded-xl text-md font-medium shadow-lg shadow-primary/20"
            >
              Anladım
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
