/**
 * ThemeSelector Component
 *
 * Story 8.4: Enhanced theme selection using segmented control pattern
 * AC1: Segmented Control with 3 options (Açık, Koyu, Sistem)
 * AC2: Real-time preview with smooth transitions
 * AC3: Dynamic system indicator when "Sistem" is selected
 * AC4: Synchronized with Header's ThemeToggle via shared store
 */

import { Sun, Moon, Laptop } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/stores/settings-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import type { Theme } from "@/types/settings";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  {
    value: "light" as Theme,
    label: SETTINGS_STRINGS.THEME_LABEL_LIGHT,
    Icon: Sun,
  },
  {
    value: "dark" as Theme,
    label: SETTINGS_STRINGS.THEME_LABEL_DARK,
    Icon: Moon,
  },
  {
    value: "system" as Theme,
    label: SETTINGS_STRINGS.THEME_LABEL_SYSTEM,
    Icon: Laptop,
  },
] as const;

export function ThemeSelector() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  // AC3: System indicator text using i18n
  const systemPreferenceText = prefersDark
    ? SETTINGS_STRINGS.THEME_LABEL_DARK
    : SETTINGS_STRINGS.THEME_LABEL_LIGHT;

  return (
    <div className="w-full space-y-3">
      {/* AC1: Segmented Control using Tabs */}
      <Tabs
        value={theme}
        onValueChange={(v) => setTheme(v as Theme)}
        className="w-full"
      >
        <TabsList
          className={cn(
            "grid w-full grid-cols-3",
            // Premium styling: ensure enough height for touch target + padding (AC1)
            "h-12"
          )}
          aria-label={SETTINGS_STRINGS.THEME_ARIA_LABEL}
        >
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                // Base trigger styling
                "gap-2 text-sm font-medium",
                // AC2: Active state with brand color
                "data-[state=active]:text-primary",
                // AC2: Correct focus ring and transition duration (200ms)
                "focus-visible:ring-2 focus-visible:ring-primary duration-200",
                // AC4: Respect prefers-reduced-motion via CSS motion-reduce
                "motion-reduce:transition-none"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* AC3: Dynamic System Indicator - only shown when "system" is selected */}
      {theme === "system" && (
        <p
          className={cn(
            "text-sm text-muted-foreground text-center",
            // Smooth appearance animation
            "animate-in fade-in-50 duration-200",
            "motion-reduce:animate-none"
          )}
        >
          {SETTINGS_STRINGS.THEME_SYSTEM_INDICATOR}{" "}
          <strong>{systemPreferenceText}</strong>
        </p>
      )}
    </div>
  );
}
