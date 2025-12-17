import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

export function useIOSPWADetection() {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const lastDismissed = useSettingsStore(
    (state) => state.lastIOSPromptDismissed
  );

  useEffect(() => {
    // 1. Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // 2. Detect Standalone mode (installed)
    const isStandalone =
      (window.navigator as any).standalone ||
      window.matchMedia("(display-mode: standalone)").matches;

    // 3. Detect Safari (standard iOS install is via Safari)
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(
      navigator.userAgent
    );

    if (isIOS && isSafari && !isStandalone) {
      // 4. Check frequency control (7 days)
      if (lastDismissed) {
        const lastDate = new Date(lastDismissed);
        const now = new Date();
        const diffInDays =
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffInDays > 7) {
          setShouldShowPrompt(true);
        }
      } else {
        // Never dismissed before
        setShouldShowPrompt(true);
      }
    }
  }, [lastDismissed]);

  return { shouldShowPrompt };
}
