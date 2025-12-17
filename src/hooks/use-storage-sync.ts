import { useEffect } from "react";

/**
 * Hook to sync Zustand stores across browser tabs
 * Listens for localStorage changes and triggers store rehydration
 *
 * Usage: Call in App.tsx or root component
 * Implementation will be extended in future stories
 */
export function useStorageSync() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith("subtracker-")) {
        // For now, just log. Full implementation in future story.
        console.log("[StorageSync] External change detected:", event.key);
        // TODO: Trigger store rehydration
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
}
