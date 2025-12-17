import { createStore } from "./create-store";
import { Settings, SettingsSchema, Theme } from "@/types/settings";

interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void;
  setNotificationPermission: (
    permission: "default" | "granted" | "denied"
  ) => void;
  setNotificationTime: (time: string) => void;
  setNotificationDaysBefore: (days: number) => void;
  setLastBackupDate: (date: string) => void;
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
    setLastBackupDate: (date) => set({ lastBackupDate: date }),
    completeOnboarding: () => set({ onboardingCompleted: true }),
  }),
  {
    name: "SettingsStore",
    version: 1,
    migrate: (persistedState: unknown, version: number) => {
      if (version === 0) {
        // Migration from v0 to v1: Add new fields with defaults
        console.log("[SettingsStore] Migrating from v0 to v1");
        const oldState = persistedState as Record<string, unknown>;
        return {
          ...oldState,
          notificationDaysBefore:
            (oldState.notificationDaysBefore as number) ?? 3,
          onboardingCompleted:
            (oldState.onboardingCompleted as boolean) ?? false,
        } as SettingsState;
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
        // Reset to defaults if validation fails
        return {
          theme: "system",
          notificationPermission: "default",
          notificationDaysBefore: 3,
          notificationTime: "09:00",
          onboardingCompleted: false,
        } as SettingsState;
      }
    },
  }
);
