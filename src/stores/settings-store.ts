import { createStore } from "./create-store";
import { SettingsSchema } from "@/types/settings";
import type { Settings, Theme } from "@/types/settings";

export interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void;
  setNotificationPermission: (
    permission: "default" | "granted" | "denied"
  ) => void;
  setNotificationTime: (time: string) => void;
  setNotificationDaysBefore: (days: number) => void;
  setLastBackupDate: (date: string) => void;
  completeOnboarding: () => void;
  dismissIOSPrompt: () => void;
}

export const useSettingsStore = createStore<SettingsState>(
  (set) => ({
    // Initial State defaults
    theme: "system",
    notificationPermission: "default",
    notificationDaysBefore: 3,
    notificationTime: "09:00",
    onboardingCompleted: false,
    lastIOSPromptDismissed: undefined,

    // Actions
    setTheme: (theme) => set({ theme }),
    setNotificationPermission: (permission) =>
      set({ notificationPermission: permission }),
    setNotificationTime: (time) => set({ notificationTime: time }),
    setNotificationDaysBefore: (days) => set({ notificationDaysBefore: days }),
    setLastBackupDate: (date) => set({ lastBackupDate: date }),
    completeOnboarding: () => set({ onboardingCompleted: true }),
    dismissIOSPrompt: () =>
      set({ lastIOSPromptDismissed: new Date().toISOString() }),
  }),
  {
    name: "SettingsStore",
    version: 2,
    migrate: (persistedState: unknown, version: number) => {
      let state = persistedState as any;

      if (version === 0) {
        // Migration from v0 to v1: Add new fields with defaults
        console.log("[SettingsStore] Migrating from v0 to v1");
        state = {
          ...state,
          notificationDaysBefore: state.notificationDaysBefore ?? 3,
          onboardingCompleted: state.onboardingCompleted ?? false,
        };
      }

      if (version < 2) {
        // Migration to v2: Add lastIOSPromptDismissed
        console.log("[SettingsStore] Migrating to v2");
        state = {
          ...state,
          lastIOSPromptDismissed: state.lastIOSPromptDismissed ?? undefined,
        };
      }

      return state as SettingsState;
    },
    onRehydrateStorage: (state) => {
      // Validate data on rehydration
      const result = SettingsSchema.safeParse(state);
      if (!result.success) {
        console.warn(
          "[SettingsStore] Invalid data during rehydration:",
          result.error
        );
        // Reset to defaults if validation fails
        return {
          theme: "system",
          notificationPermission: "default",
          notificationDaysBefore: 3,
          notificationTime: "09:00",
          onboardingCompleted: false,
          lastIOSPromptDismissed: undefined,
        } as SettingsState;
      }
    },
  }
);
