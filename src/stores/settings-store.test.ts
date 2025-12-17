import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore, type SettingsState } from "./settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({
      theme: "system",
      notificationPermission: "default",
      notificationDaysBefore: 3,
      notificationTime: "09:00",
      onboardingCompleted: false,
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
    useSettingsStore.getState().setNotificationTime("10:00");
    expect(useSettingsStore.getState().notificationTime).toBe("10:00");
  });

  it("should persist to localStorage", async () => {
    useSettingsStore.getState().setTheme("dark");

    // Wait for persist middleware
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Determine storage key based on environment (assuming test env mimics dev or prod appropriately,
    // but our setup.ts doesn't explicitly set import.meta.env.PROD.
    // Usually Vite test runner sets keys.
    // Let's check both potential keys or partial match if unsure,
    // but our code uses `import.meta.env.PROD` which might be false in test.

    // We can iterate generic keys to find it if we want to be safe,
    // or just rely on the implementation detail that tests run in dev-like mode usually.
    // The implementation: import.meta.env.PROD ? `subtracker-${domain}` : `subtracker-${domain}-dev`;
    // In vitest, import.meta.env.PROD is usually false.
    const devKey = "subtracker-settings-dev";

    const stored = localStorage.getItem(devKey);
    expect(stored).toBeTruthy();
    if (stored) {
      expect(JSON.parse(stored).state.theme).toBe("dark");
    }
  });

  it("should rehydrate from localStorage", async () => {
    // Pre-populate localStorage
    localStorage.setItem(
      "subtracker-settings-dev",
      JSON.stringify({
        state: { theme: "light", notificationPermission: "default" },
        version: 1,
      })
    );

    // Trigger rehydration
    // Note: persist.rehydrate() is available when using persist middleware
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (useSettingsStore as any).persist.rehydrate();

    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("should handle migration from v0 to v1", async () => {
    // Pre-populate with v0 data (simulated structure)
    localStorage.setItem(
      "subtracker-settings-dev",
      JSON.stringify({
        state: { theme: "dark" },
        version: 0,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (useSettingsStore as any).persist.rehydrate();

    // Check if state is preserved/migrated correctly
    expect(useSettingsStore.getState().theme).toBe("dark");
    // Version should be updated to 1 implicitly by the persist middleware saving it back
    // (though test might not trigger save immediately unless we trigger a change or check internal state)
  });

  it("should validate data on rehydration", async () => {
    const consoleSpy = vi.spyOn(console, "warn");

    // Inject invalid data
    localStorage.setItem(
      "subtracker-settings-dev",
      JSON.stringify({
        state: { theme: "invalid-theme" },
        version: 1,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (useSettingsStore as any).persist.rehydrate();

    // Expect validation warning
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[SettingsStore] Invalid data"),
      expect.anything()
    );

    consoleSpy.mockRestore();
  });
});
