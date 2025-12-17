import { useState, useEffect, useMemo } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Check standalone mode once - client-side only
function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function useInstallPrompt() {
  const isStandalone = useMemo(() => getIsStandalone(), []);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // Initialize with opposite of standalone - if standalone, not installable
  const [isInstallable, setIsInstallable] = useState(() => !getIsStandalone());

  useEffect(() => {
    // Don't listen for install prompt if already standalone
    if (isStandalone) return;

    const handler = (e: Event) => {
      // Prevent default mini-infobar on mobile
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  const showInstallPrompt = async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      setInstallPrompt(null);
    }

    return outcome === "accepted";
  };

  return {
    isInstallable: isInstallable && !isStandalone,
    showInstallPrompt,
    isStandalone,
  };
}
