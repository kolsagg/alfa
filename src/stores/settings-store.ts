import { createStore } from "./create-store";
import { SettingsSchema, NotificationSettingsSchema } from "@/types/settings";
import { z } from "zod";
import type { Settings, Theme, NotificationSettings } from "@/types/settings";

export interface SettingsState extends Settings {
  // Theme actions
  setTheme: (theme: Theme) => void;
  // Notification actions
  setNotificationPermission: (
    permission: "default" | "granted" | "denied"
  ) => void;
  updateNotificationSettings: (
    updates: Partial<NotificationSettings>
  ) => boolean;
  setNotificationsEnabled: (enabled: boolean) => boolean;
  setLastNotificationCheck: (date: string | undefined) => boolean;
  // Story 4.2: Permission denial tracking
  setNotificationPermissionDenied: () => void;
  dismissNotificationBanner: () => void;
  // Legacy individual setters (refactored to use updateNotificationSettings internally)
  setNotificationTime: (time: string) => boolean;
  setNotificationDaysBefore: (days: number) => boolean;
  // Other actions
  setLastBackupDate: (date: string) => void;
  mergeSettings: (data: Partial<Settings>) => boolean;
  completeOnboarding: () => void;
  dismissIOSPrompt: () => void;
  setHasSeenNotificationPrompt: (seen: boolean) => void;
  // Story 5.4: Backup reminder actions
  setBackupReminderDismissed: () => void;
  setBackupReminderDisabled: (disabled: boolean) => void;
  // Story 5.5: Storage limit warning actions
  setStorageWarningDismissed: () => void;
  setRecordCountWarningDisabled: (disabled: boolean) => void;
}

export const useSettingsStore = createStore<SettingsState>(
  (set) => ({
    // Initial State defaults
    theme: "system",
    notificationPermission: "default",
    notificationsEnabled: true,
    notificationDaysBefore: 3,
    notificationTime: "09:00",
    lastNotificationCheck: undefined,
    // Story 4.2: Permission tracking fields
    notificationPermissionDeniedAt: undefined,
    notificationBannerDismissedAt: undefined,
    // Existing fields
    onboardingCompleted: false,
    lastIOSPromptDismissed: undefined,
    hasSeenNotificationPrompt: false,
    // Story 5.4: Backup reminder defaults
    backupReminderDismissedAt: undefined,
    backupReminderDisabled: false,
    // Story 5.5: Storage limit warning defaults
    storageWarningDismissedAt: undefined,
    recordCountWarningDisabled: false,

    // Actions
    setTheme: (theme) => set({ theme }),

    setNotificationPermission: (permission) =>
      set({ notificationPermission: permission }),

    // Consolidated notification settings update with validation
    updateNotificationSettings: (updates) => {
      // Validate partial update using NotificationSettingsSchema
      const partialSchema = NotificationSettingsSchema.partial();
      const result = partialSchema.safeParse(updates);

      if (!result.success) {
        console.warn(
          "[SettingsStore] Invalid notification settings update rejected:",
          result.error.flatten().fieldErrors
        );
        return false;
      }

      set(result.data);
      return true;
    },

    setNotificationsEnabled: (enabled) => {
      const result = z.boolean().safeParse(enabled);
      if (!result.success) return false;
      set({ notificationsEnabled: result.data });
      return true;
    },

    setLastNotificationCheck: (date) => {
      // Validate as ISO string if provided
      const schema = z.string().datetime().optional().nullable();
      const result = schema.safeParse(date);
      if (!result.success) {
        console.warn(
          "[SettingsStore] Invalid lastNotificationCheck rejected:",
          date
        );
        return false;
      }
      set({ lastNotificationCheck: result.data ?? undefined });
      return true;
    },

    // Story 4.2: Set permission denied timestamp
    setNotificationPermissionDenied: () => {
      set({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      });
    },

    // Story 4.2: Dismiss notification banner permanently
    dismissNotificationBanner: () => {
      set({ notificationBannerDismissedAt: new Date().toISOString() });
    },

    // Legacy setters refactored for consistency (Rejection instead of Fallback)
    setNotificationTime: (time) => {
      const partialSchema = NotificationSettingsSchema.pick({
        notificationTime: true,
      });
      const result = partialSchema.safeParse({ notificationTime: time });

      if (!result.success) {
        console.warn(
          `[SettingsStore] Invalid notification time rejected: ${time}`
        );
        return false;
      }

      set(result.data);
      return true;
    },

    setNotificationDaysBefore: (days) => {
      const partialSchema = NotificationSettingsSchema.pick({
        notificationDaysBefore: true,
      });
      const result = partialSchema.safeParse({ notificationDaysBefore: days });

      if (!result.success) {
        console.warn(
          `[SettingsStore] Invalid notificationDaysBefore rejected: ${days}`
        );
        return false;
      }

      set(result.data);
      return true;
    },

    setLastBackupDate: (date) => set({ lastBackupDate: date }),

    mergeSettings: (data) => {
      // Define importable/mergeable keys whitelist
      const WHITELIST = [
        "theme",
        "notificationsEnabled",
        "notificationDaysBefore",
        "notificationTime",
      ] as const;
      type WhitelistKey = (typeof WHITELIST)[number];

      // Filter provided data against whitelist
      const updates: Pick<Settings, WhitelistKey> = {} as Pick<
        Settings,
        WhitelistKey
      >;

      for (const key of WHITELIST) {
        if (key in data && data[key] !== undefined) {
          // Safe assignment: key is guaranteed to be in whitelist
          (updates[key] as Settings[typeof key]) = data[
            key
          ] as Settings[typeof key];
        }
      }

      if (Object.keys(updates).length === 0) return false;

      set(updates);
      return true;
    },

    completeOnboarding: () => set({ onboardingCompleted: true }),
    dismissIOSPrompt: () =>
      set({ lastIOSPromptDismissed: new Date().toISOString() }),
    setHasSeenNotificationPrompt: (seen) =>
      set({ hasSeenNotificationPrompt: seen }),

    // Story 5.4: Backup reminder actions
    setBackupReminderDismissed: () =>
      set({ backupReminderDismissedAt: new Date().toISOString() }),

    setBackupReminderDisabled: (disabled) =>
      set({ backupReminderDisabled: disabled }),

    // Story 5.5: Storage limit warning actions
    setStorageWarningDismissed: () =>
      set({ storageWarningDismissedAt: new Date().toISOString() }),

    setRecordCountWarningDisabled: (disabled) =>
      set({ recordCountWarningDisabled: disabled }),
  }),
  {
    name: "SettingsStore",
    version: 6,
    migrate: (persistedState: unknown, version: number) => {
      const state = persistedState as Partial<SettingsState>;

      if (version === 0) {
        // Migration from v0 to v1: Add new fields with defaults
        console.log("[SettingsStore] Migrating from v0 to v1");
        state.notificationDaysBefore = state.notificationDaysBefore ?? 3;
        state.onboardingCompleted = state.onboardingCompleted ?? false;
      }

      if (version < 2) {
        // Migration to v2: Add lastIOSPromptDismissed
        console.log("[SettingsStore] Migrating to v2");
        state.lastIOSPromptDismissed =
          state.lastIOSPromptDismissed ?? undefined;
      }

      if (version < 3) {
        // Migration to v3: Add notificationsEnabled and lastNotificationCheck
        console.log("[SettingsStore] Migrating to v3");
        state.notificationsEnabled = state.notificationsEnabled ?? true;
        state.lastNotificationCheck = state.lastNotificationCheck ?? undefined;
      }

      if (version < 4) {
        // Migration to v4: Add notification permission tracking fields (Story 4.2)
        console.log("[SettingsStore] Migrating to v4");
        state.notificationPermissionDeniedAt =
          state.notificationPermissionDeniedAt ?? undefined;
        state.notificationBannerDismissedAt =
          state.notificationBannerDismissedAt ?? undefined;
      }

      if (version < 5) {
        // Migration to v5: Add backup reminder fields (Story 5.4)
        console.log("[SettingsStore] Migrating to v5");
        state.backupReminderDismissedAt =
          state.backupReminderDismissedAt ?? undefined;
        state.backupReminderDisabled = state.backupReminderDisabled ?? false;
      }

      if (version < 6) {
        // Migration to v6: Add storage limit warning fields (Story 5.5)
        console.log("[SettingsStore] Migrating to v6");
        state.storageWarningDismissedAt =
          state.storageWarningDismissedAt ?? undefined;
        state.recordCountWarningDisabled =
          state.recordCountWarningDisabled ?? false;
      }

      return state as SettingsState;
    },
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error("[SettingsStore] Rehydration error:", error);
        return;
      }
      // Validate data on rehydration
      const result = SettingsSchema.safeParse(state);
      if (!result.success) {
        console.warn(
          "[SettingsStore] Invalid data during rehydration:",
          result.error
        );
        // Note: Cannot reset state from here, validation is informational only
      }
    },
  }
);
