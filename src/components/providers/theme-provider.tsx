import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const getIsDark = () => {
      if (theme === "system") {
        return mediaQuery.matches;
      }
      return theme === "dark";
    };

    const applyTheme = () => {
      const isDark = getIsDark();

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Update PWA Meta
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", isDark ? "#0F172A" : "#fcfcfc");
      }
    };

    // Apply immediately
    applyTheme();

    // Listen for system changes
    const listener = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [theme]);

  return <>{children}</>;
}
