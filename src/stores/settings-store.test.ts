import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore, type SettingsState } from "./settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset store state before each test with v5 fields
    useSettingsStore.setState({
      theme: "system",
      notificationPermission: "default",
      notificationsEnabled: true,
      notificationDaysBefore: 3,
      notificationTime: "09:00",
      lastNotificationCheck: undefined,
      // Story 4.2 v4 fields
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
      // Story 5.4 v5 fields
      backupReminderDismissedAt: undefined,
      backupReminderDisabled: false,
      // Story 5.5 v6 fields
      storageWarningDismissedAt: undefined,
      recordCountWarningDisabled: false,
      // Story 7.3 v7 fields
      developerMode: false,
      onboardingCompleted: false,
      lastIOSPromptDismissed: undefined,
      hasSeenNotificationPrompt: false,
    } as Partial<SettingsState>);
    localStorage.clear();
  });

  it("should initialize with system theme", () => {
    const { theme } = useSettingsStore.getState();
    expect(theme).toBe("system");
  });

  it("should update theme", () => {
    useSettingsStore.getState().setTheme("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("should update notification permission", () => {
    useSettingsStore.getState().setNotificationPermission("granted");
    expect(useSettingsStore.getState().notificationPermission).toBe("granted");
  });

  it("should update notification time", () => {
    const result = useSettingsStore.getState().setNotificationTime("10:00");
    expect(result).toBe(true);
    expect(useSettingsStore.getState().notificationTime).toBe("10:00");
  });

  // ============ NEW TESTS FOR STORY 4.1 ============

  describe("notificationsEnabled (v3)", () => {
    it("should have default notificationsEnabled = true", () => {
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    });

    it("setNotificationsEnabled should update state", () => {
      useSettingsStore.getState().setNotificationsEnabled(false);
      expect(useSettingsStore.getState().notificationsEnabled).toBe(false);

      useSettingsStore.getState().setNotificationsEnabled(true);
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    });
  });

  describe("lastNotificationCheck (v3)", () => {
    it("should have default lastNotificationCheck = undefined", () => {
      expect(useSettingsStore.getState().lastNotificationCheck).toBeUndefined();
    });

    it("setLastNotificationCheck should update state with valid ISO string", () => {
      const now = new Date().toISOString();
      const result = useSettingsStore.getState().setLastNotificationCheck(now);
      expect(result).toBe(true);
      expect(useSettingsStore.getState().lastNotificationCheck).toBe(now);
    });

    it("setLastNotificationCheck should allow clearing with undefined or null", () => {
      useSettingsStore
        .getState()
        .setLastNotificationCheck(new Date().toISOString());

      const result = useSettingsStore
        .getState()
        .setLastNotificationCheck(undefined);
      expect(result).toBe(true);
      expect(useSettingsStore.getState().lastNotificationCheck).toBeUndefined();
    });

    it("setLastNotificationCheck should reject invalid date strings", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const result = useSettingsStore
        .getState()
        .setLastNotificationCheck("invalid-date");

      expect(result).toBe(false);
      expect(useSettingsStore.getState().lastNotificationCheck).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // ============ STORY 4.2 TESTS ============

  describe("setNotificationPermissionDenied (v4)", () => {
    it("should set permission to denied and record timestamp", () => {
      const before = new Date();
      useSettingsStore.getState().setNotificationPermissionDenied();
      const after = new Date();

      const state = useSettingsStore.getState();
      expect(state.notificationPermission).toBe("denied");
      expect(state.notificationPermissionDeniedAt).toBeDefined();

      const deniedAt = new Date(state.notificationPermissionDeniedAt!);
      expect(deniedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(deniedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("dismissNotificationBanner (v4)", () => {
    it("should record dismissal timestamp", () => {
      const before = new Date();
      useSettingsStore.getState().dismissNotificationBanner();
      const after = new Date();

      const state = useSettingsStore.getState();
      expect(state.notificationBannerDismissedAt).toBeDefined();

      const dismissedAt = new Date(state.notificationBannerDismissedAt!);
      expect(dismissedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(dismissedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should allow repeated dismissals (updates timestamp)", () => {
      useSettingsStore.getState().dismissNotificationBanner();
      const first = useSettingsStore.getState().notificationBannerDismissedAt;

      // Wait a tiny bit to ensure different timestamp
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      useSettingsStore.getState().dismissNotificationBanner();
      const second = useSettingsStore.getState().notificationBannerDismissedAt;

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      // Note: With fake timers, second should be 1 second later
      vi.useRealTimers();
    });
  });

  // ============ STORY 5.4 TESTS ============

  describe("setBackupReminderDismissed (v5)", () => {
    it("should record dismissal timestamp", () => {
      const before = new Date();
      useSettingsStore.getState().setBackupReminderDismissed();
      const after = new Date();

      const state = useSettingsStore.getState();
      expect(state.backupReminderDismissedAt).toBeDefined();

      const dismissedAt = new Date(state.backupReminderDismissedAt!);
      expect(dismissedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(dismissedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should update timestamp on repeated dismissals", () => {
      useSettingsStore.getState().setBackupReminderDismissed();
      const first = useSettingsStore.getState().backupReminderDismissedAt;

      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      useSettingsStore.getState().setBackupReminderDismissed();
      const second = useSettingsStore.getState().backupReminderDismissedAt;

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      vi.useRealTimers();
    });
  });

  describe("setBackupReminderDisabled (v5)", () => {
    it("should have default backupReminderDisabled = false", () => {
      expect(useSettingsStore.getState().backupReminderDisabled).toBe(false);
    });

    it("should set backupReminderDisabled to true", () => {
      useSettingsStore.getState().setBackupReminderDisabled(true);
      expect(useSettingsStore.getState().backupReminderDisabled).toBe(true);
    });

    it("should set backupReminderDisabled back to false", () => {
      useSettingsStore.getState().setBackupReminderDisabled(true);
      useSettingsStore.getState().setBackupReminderDisabled(false);
      expect(useSettingsStore.getState().backupReminderDisabled).toBe(false);
    });
  });

  // ============ STORY 5.5 TESTS ============

  describe("setStorageWarningDismissed (v6)", () => {
    it("should record dismissal timestamp", () => {
      const before = new Date();
      useSettingsStore.getState().setStorageWarningDismissed();
      const after = new Date();

      const state = useSettingsStore.getState();
      expect(state.storageWarningDismissedAt).toBeDefined();

      const dismissedAt = new Date(state.storageWarningDismissedAt!);
      expect(dismissedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(dismissedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("setRecordCountWarningDisabled (v6)", () => {
    it("should have default recordCountWarningDisabled = false", () => {
      expect(useSettingsStore.getState().recordCountWarningDisabled).toBe(
        false
      );
    });

    it("should set recordCountWarningDisabled to true", () => {
      useSettingsStore.getState().setRecordCountWarningDisabled(true);
      expect(useSettingsStore.getState().recordCountWarningDisabled).toBe(true);
    });

    it("should set recordCountWarningDisabled back to false", () => {
      useSettingsStore.getState().setRecordCountWarningDisabled(true);
      useSettingsStore.getState().setRecordCountWarningDisabled(false);
      expect(useSettingsStore.getState().recordCountWarningDisabled).toBe(
        false
      );
    });
  });

  // ============ STORY 7.3 TESTS ============

  describe("developerMode (v7)", () => {
    it("should have default developerMode = false", () => {
      expect(useSettingsStore.getState().developerMode).toBe(false);
    });

    it("should set developerMode to true", () => {
      useSettingsStore.getState().setDeveloperMode(true);
      expect(useSettingsStore.getState().developerMode).toBe(true);
    });

    it("should set developerMode back to false", () => {
      useSettingsStore.getState().setDeveloperMode(true);
      useSettingsStore.getState().setDeveloperMode(false);
      expect(useSettingsStore.getState().developerMode).toBe(false);
    });
  });

  describe("updateNotificationSettings (consolidated action)", () => {
    it("should update multiple notification settings at once", () => {
      const result = useSettingsStore.getState().updateNotificationSettings({
        notificationsEnabled: false,
        notificationDaysBefore: 7,
        notificationTime: "14:30",
      });

      expect(result).toBe(true);
      expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(7);
      expect(useSettingsStore.getState().notificationTime).toBe("14:30");
    });

    it("should allow partial updates", () => {
      const result = useSettingsStore
        .getState()
        .updateNotificationSettings({ notificationDaysBefore: 5 });

      expect(result).toBe(true);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(5);
      // Other values should remain unchanged
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
      expect(useSettingsStore.getState().notificationTime).toBe("09:00");
    });

    it("should reject invalid notification time format", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const result = useSettingsStore
        .getState()
        .updateNotificationSettings({ notificationTime: "25:61" });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[SettingsStore] Invalid notification settings update rejected"
        ),
        expect.anything()
      );
      // Original value should remain unchanged (REJECTION pattern)
      expect(useSettingsStore.getState().notificationTime).toBe("09:00");

      consoleSpy.mockRestore();
    });

    it("should reject invalid notificationDaysBefore", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const result = useSettingsStore
        .getState()
        .updateNotificationSettings({ notificationDaysBefore: 50 });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(3);

      consoleSpy.mockRestore();
    });
  });

  describe("setNotificationTime validation (Legacy Rejection)", () => {
    it("should accept valid 24h time format", () => {
      const result = useSettingsStore.getState().setNotificationTime("23:59");
      expect(result).toBe(true);
      expect(useSettingsStore.getState().notificationTime).toBe("23:59");

      useSettingsStore.getState().setNotificationTime("00:00");
      expect(useSettingsStore.getState().notificationTime).toBe("00:00");
    });

    it("should reject invalid time and MAINTAIN existing value", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const result = useSettingsStore.getState().setNotificationTime("24:00"); // Invalid
      expect(result).toBe(false);
      expect(useSettingsStore.getState().notificationTime).toBe("09:00");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid notification time rejected")
      );

      consoleSpy.mockRestore();
    });

    it("should reject malformed time strings", () => {
      const result = useSettingsStore.getState().setNotificationTime("9:30"); // Missing leading zero
      expect(result).toBe(false);
      expect(useSettingsStore.getState().notificationTime).toBe("09:00");
    });
  });

  describe("setNotificationDaysBefore validation (Legacy Rejection)", () => {
    it("should accept valid range [1-30]", () => {
      const result = useSettingsStore.getState().setNotificationDaysBefore(1);
      expect(result).toBe(true);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(1);

      useSettingsStore.getState().setNotificationDaysBefore(30);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(30);
    });

    it("should reject out-of-range values and MAINTAIN existing value", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const result = useSettingsStore.getState().setNotificationDaysBefore(0);
      expect(result).toBe(false);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(3);

      useSettingsStore.getState().setNotificationDaysBefore(31);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(3);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should reject non-integer values", () => {
      const result = useSettingsStore.getState().setNotificationDaysBefore(3.5);
      expect(result).toBe(false);
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(3);
    });
  });

  // ============ MIGRATION TESTS ============

  describe("migration", () => {
    it("should migrate from v2 to v3 with notificationsEnabled = true", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v2 data (no notificationsEnabled or lastNotificationCheck)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: {
            theme: "dark",
            notificationPermission: "granted",
            notificationDaysBefore: 5,
            notificationTime: "10:00",
            onboardingCompleted: true,
            lastIOSPromptDismissed: undefined,
            hasSeenNotificationPrompt: true,
          },
          version: 2,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify migration happened
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v3"
      );

      // Verify existing data preserved
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().notificationPermission).toBe(
        "granted"
      );
      expect(useSettingsStore.getState().notificationDaysBefore).toBe(5);

      // Verify new fields have defaults
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
      expect(useSettingsStore.getState().lastNotificationCheck).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it("should handle migration from v0 to v3", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v0 data (minimal)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: { theme: "dark" },
          version: 0,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify all migrations ran
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating from v0 to v1"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v2"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v3"
      );

      // Verify state has all defaults
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);

      consoleSpy.mockRestore();
    });

    it("should migrate from v3 to v4 with new permission tracking fields", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v3 data (no notificationPermissionDeniedAt or notificationBannerDismissedAt)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: {
            theme: "dark",
            notificationPermission: "denied",
            notificationsEnabled: false,
            notificationDaysBefore: 5,
            notificationTime: "10:00",
            lastNotificationCheck: undefined,
            onboardingCompleted: true,
            lastIOSPromptDismissed: undefined,
            hasSeenNotificationPrompt: true,
          },
          version: 3,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify migration happened
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v4"
      );

      // Verify existing data preserved
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().notificationPermission).toBe("denied");
      expect(useSettingsStore.getState().notificationsEnabled).toBe(false);

      // Verify new fields have defaults (undefined)
      expect(
        useSettingsStore.getState().notificationPermissionDeniedAt
      ).toBeUndefined();
      expect(
        useSettingsStore.getState().notificationBannerDismissedAt
      ).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it("should handle migration from v0 to v4", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v0 data (minimal)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: { theme: "dark" },
          version: 0,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify all migrations ran
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating from v0 to v1"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v2"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v3"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v4"
      );

      // Verify state has all v4 defaults
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
      expect(
        useSettingsStore.getState().notificationPermissionDeniedAt
      ).toBeUndefined();
      expect(
        useSettingsStore.getState().notificationBannerDismissedAt
      ).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it("should migrate from v4 to v5 with backup reminder fields", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v4 data (no backupReminderDismissedAt or backupReminderDisabled)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: {
            theme: "dark",
            notificationPermission: "granted",
            notificationsEnabled: true,
            notificationDaysBefore: 5,
            notificationTime: "10:00",
            notificationPermissionDeniedAt: undefined,
            notificationBannerDismissedAt: undefined,
            onboardingCompleted: true,
            lastBackupDate: "2025-12-20T10:00:00.000Z",
          },
          version: 4,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify migration happened
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v5"
      );

      // Verify existing data preserved
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().lastBackupDate).toBe(
        "2025-12-20T10:00:00.000Z"
      );

      // Verify new fields have defaults
      expect(
        useSettingsStore.getState().backupReminderDismissedAt
      ).toBeUndefined();
      expect(useSettingsStore.getState().backupReminderDisabled).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should migrate from v5 to v6 with storage warning fields", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v5 data
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: {
            theme: "dark",
            notificationsEnabled: true,
            backupReminderDisabled: true,
          },
          version: 5,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify migration happened
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v6"
      );

      // Verify existing data preserved
      expect(useSettingsStore.getState().backupReminderDisabled).toBe(true);

      // Verify new fields have defaults
      expect(
        useSettingsStore.getState().storageWarningDismissedAt
      ).toBeUndefined();
      expect(useSettingsStore.getState().recordCountWarningDisabled).toBe(
        false
      );

      consoleSpy.mockRestore();
    });

    it("should handle migration from v0 to v6", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v0 data (minimal)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: { theme: "dark" },
          version: 0,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify all migrations ran
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating from v0 to v1"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v2"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v3"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v4"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v5"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v6"
      );

      // Verify state has all v6 defaults
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
      expect(
        useSettingsStore.getState().storageWarningDismissedAt
      ).toBeUndefined();
      expect(useSettingsStore.getState().recordCountWarningDisabled).toBe(
        false
      );

      consoleSpy.mockRestore();
    });

    it("should migrate from v6 to v7 with developer mode field", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v6 data
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: {
            theme: "dark",
            notificationsEnabled: true,
            storageWarningDismissedAt: undefined,
            recordCountWarningDisabled: false,
          },
          version: 6,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify migration happened
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v7"
      );

      // Verify existing data preserved
      expect(useSettingsStore.getState().theme).toBe("dark");

      // Verify new field has default
      expect(useSettingsStore.getState().developerMode).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should handle migration from v0 to v7", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Pre-populate with v0 data (minimal)
      localStorage.setItem(
        "subtracker-settings-dev",
        JSON.stringify({
          state: { theme: "dark" },
          version: 0,
        })
      );

      await useSettingsStore.persist.rehydrate();

      // Verify all migrations ran
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating from v0 to v1"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[SettingsStore] Migrating to v7"
      );

      // Verify state has all v7 defaults
      expect(useSettingsStore.getState().developerMode).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  // ============ EXISTING TESTS (Preserved) ============

  it("should persist to localStorage", async () => {
    useSettingsStore.getState().setTheme("dark");

    // Wait for persist middleware
    await new Promise((resolve) => setTimeout(resolve, 100));

    const devKey = "subtracker-settings-dev";
    const stored = localStorage.getItem(devKey);
    expect(stored).toBeTruthy();
    if (stored) {
      expect(JSON.parse(stored).state.theme).toBe("dark");
    }
  });

  it("should rehydrate from localStorage", async () => {
    // Pre-populate localStorage with v4 data
    localStorage.setItem(
      "subtracker-settings-dev",
      JSON.stringify({
        state: {
          theme: "light",
          notificationPermission: "default",
          notificationsEnabled: true,
          notificationPermissionDeniedAt: undefined,
          notificationBannerDismissedAt: undefined,
        },
        version: 4,
      })
    );

    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("should validate data on rehydration", async () => {
    const consoleSpy = vi.spyOn(console, "warn");

    // Inject invalid data
    localStorage.setItem(
      "subtracker-settings-dev",
      JSON.stringify({
        state: { theme: "invalid-theme" },
        version: 3,
      })
    );

    await useSettingsStore.persist.rehydrate();

    // Expect validation warning
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[SettingsStore] Invalid data during rehydration"
      ),
      expect.anything()
    );

    consoleSpy.mockRestore();
  });
});
