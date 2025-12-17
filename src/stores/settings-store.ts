import { createStore } from "./create-store";
import { Settings, SettingsSchema, Theme } from "@/types/settings";

interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void;
  setNotificationPermission: (
    permission: "default" | "granted" | "denied"
  ) => void;
  setNotificationTime: (time: string) => void;
  setNotificationDaysBefore: (days: number) => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = createStore<SettingsState>(
  (set) => ({
    // Initial State defaults
    theme: "system",
    notificationPermission: "default",
    notificationDaysBefore: 3,
    notificationTime: "09:00",
    onboardingCompleted: false,

    // Actions
    setTheme: (theme) => set({ theme }),
    setNotificationPermission: (permission) =>
      set({ notificationPermission: permission }),
    setNotificationTime: (time) => set({ notificationTime: time }),
    setNotificationDaysBefore: (days) => set({ notificationDaysBefore: days }),
    completeOnboarding: () => set({ onboardingCompleted: true }),
  }),
  {
    name: "SettingsStore",
    version: 1,
    migrate: (persistedState: any, version: number) => {
      if (version === 0) {
        // Example migration placeholder
      }
      return persistedState as SettingsState;
    },
    onRehydrateStorage: (state) => {
      // Validate data on rehydration
      const result = SettingsSchema.safeParse(state);
      if (!result.success) {
        console.warn(
          "[SettingsStore] Invalid data during rehydration:",
          result.error
        );
        // We could reset to defaults here if really bad, or just warn
      }
    },
  }
);
