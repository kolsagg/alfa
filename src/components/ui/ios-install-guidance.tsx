import { useState, useCallback, useEffect } from "react";
import { Share, PlusSquare } from "lucide-react";
import { toast } from "sonner";
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
import { IOS_INSTALL_GUIDANCE_STRINGS as IOS_STRINGS } from "@/lib/i18n/ios-install-guidance";

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
 *
 * Story 4.6: Added auto-dismiss on standalone detection and i18n integration.
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

  // Story 4.6 AC#6: Auto-dismiss when PWA mode is detected
  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const checkInstall = () => {
      if (mediaQuery.matches) {
        toast.success(IOS_STRINGS.TOAST_INSTALL_SUCCESS);
        handleClose();
      }
    };

    // 1. Media Query Listener - handles PWA install detection
    // Use modern addEventListener with fallback for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", checkInstall);
    } else if (mediaQuery.addListener) {
      // Deprecated but needed for older Safari
      mediaQuery.addListener(checkInstall);
    }

    // 2. Visibility Change Listener - handles OS-level app switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInstall();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", checkInstall);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(checkInstall);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isOpen, handleClose]);

  // "Kurdum" button handler - re-check if now in standalone mode
  // Story 4.6 AC#4: If still in Safari, dismiss with 7-day snooze and toast
  const handleInstallConfirm = useCallback(() => {
    setIsCheckingInstall(true);

    // Small delay to allow PWA transition (if user somehow stayed in same window)
    setTimeout(() => {
      const stillNonStandalone = detectIOSSafariNonStandalone();

      if (!stillNonStandalone) {
        // User is now in PWA mode, close modal with success toast
        // Redundancy check: toast.success is also handled by the matchMedia effect
        toast.success(IOS_STRINGS.TOAST_INSTALL_SUCCESS);
        handleClose();
      } else {
        // AC4: If still in Safari, dismisses with 7-day snooze and toast feedback
        toast.info(IOS_STRINGS.TOAST_INSTALL_PENDING);
        dismissIOSPrompt(); // This sets the 7-day snooze
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

  // Content varies based on mode - using i18n strings
  const title = triggeredBySettings
    ? IOS_STRINGS.TITLE_SETTINGS
    : IOS_STRINGS.TITLE_AUTOMATIC;

  const description = triggeredBySettings
    ? IOS_STRINGS.DESCRIPTION_SETTINGS
    : IOS_STRINGS.DESCRIPTION_AUTOMATIC;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-[425px] rounded-t-3xl sm:rounded-3xl border-none bg-background/95 backdrop-blur-xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center w-full">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 mb-6 aspect-square overflow-hidden rounded-2xl bg-muted/50">
          <img
            src={NOTIFICATION_CONFIG.ASSETS.IOS_GUIDANCE}
            alt={IOS_STRINGS.GUIDANCE_IMAGE_ALT}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-4"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 tabular-nums">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </span>
              <span>{IOS_STRINGS.STEP_1_OVERLAY}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 tabular-nums mt-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </span>
              <span>{IOS_STRINGS.STEP_2_OVERLAY}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/50 border border-border/50">
            <Share className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                {IOS_STRINGS.STEP_1_TITLE}
              </p>
              <p className="text-xs text-muted-foreground">
                {IOS_STRINGS.STEP_1_DESCRIPTION}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/50 border border-border/50">
            <PlusSquare className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                {IOS_STRINGS.STEP_2_TITLE}
              </p>
              <p className="text-xs text-muted-foreground">
                {IOS_STRINGS.STEP_2_DESCRIPTION}
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
                className="flex-1 h-12 min-h-[44px] rounded-xl text-md font-medium"
              >
                {IOS_STRINGS.BUTTON_LATER}
              </Button>
              <Button
                onClick={handleInstallConfirm}
                disabled={isCheckingInstall}
                className="flex-1 h-12 min-h-[44px] rounded-xl text-md font-medium shadow-lg shadow-primary/20"
              >
                {isCheckingInstall
                  ? IOS_STRINGS.BUTTON_CHECKING
                  : IOS_STRINGS.BUTTON_INSTALLED}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleClose}
              className="w-full h-12 min-h-[44px] rounded-xl text-md font-medium shadow-lg shadow-primary/20"
            >
              {IOS_STRINGS.BUTTON_UNDERSTOOD}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
