import { useMemo } from "react";
import { useSettingsStore } from "@/stores/settings-store";

const PROMPT_RESIDENCY_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Type augmentation for iOS-specific window properties
interface IOSNavigator extends Navigator {
  standalone?: boolean;
}

interface IOSWindow extends Window {
  MSStream?: unknown;
}

export function detectIOSSafariNonStandalone(): boolean {
  if (typeof window === "undefined") return false;

  const iosWindow = window as IOSWindow;
  const iosNavigator = window.navigator as IOSNavigator;

  // 1. Detect iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !iosWindow.MSStream;

  // 2. Detect Standalone mode (installed)
  const isStandalone =
    iosNavigator.standalone ||
    window.matchMedia("(display-mode: standalone)").matches;

  // 3. Detect Safari (standard iOS install is via Safari)
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(
    navigator.userAgent
  );

  return isIOS && isSafari && !isStandalone;
}

export function useIOSPWADetection() {
  const lastDismissed = useSettingsStore(
    (state) => state.lastIOSPromptDismissed
  );

  const shouldShowPrompt = useMemo(() => {
    const isTargetPlatform = detectIOSSafariNonStandalone();
    if (!isTargetPlatform) return false;

    // Check frequency control (7 days)
    if (lastDismissed) {
      const lastDate = new Date(lastDismissed);
      const now = new Date();
      const diffInDays = (now.getTime() - lastDate.getTime()) / MS_PER_DAY;
      return diffInDays > PROMPT_RESIDENCY_DAYS;
    }

    // Never dismissed before
    return true;
  }, [lastDismissed]);

  return { shouldShowPrompt };
}
