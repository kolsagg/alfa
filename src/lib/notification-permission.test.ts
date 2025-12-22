import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  showNotificationPermissionPrompt,
  requestAndUpdatePermission,
  isNotificationSupported,
  getBrowserNotificationPermission,
} from "./notification-permission";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";
import * as iosDetection from "@/hooks/use-ios-pwa-detection";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock iOS detection module
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  detectIOSSafariNonStandalone: vi.fn(() => false),
}));

describe("notification-permission", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset settings store with v4 fields
    useSettingsStore.setState({
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
    } as Partial<SettingsState>);

    // Default: not iOS Safari
    vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("requestNotificationPermission", () => {
    it("should return 'denied' when Notification API is not available", async () => {
      // Store original Notification
      const originalNotification = globalThis.Notification;

      // Remove Notification API
      // @ts-expect-error - intentionally making Notification undefined
      globalThis.Notification = undefined;

      const result = await requestNotificationPermission();
      expect(result).toBe("denied");

      // Restore
      globalThis.Notification = originalNotification;
    });

    it("should return current permission when not default", async () => {
      // Mock Notification with granted permission
      const mockNotification = {
        permission: "granted" as NotificationPermission,
        requestPermission: vi.fn(),
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestNotificationPermission();
      expect(result).toBe("granted");
      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it("should request permission when current is default", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      const mockNotification = {
        permission: "default" as NotificationPermission,
        requestPermission: mockRequestPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestNotificationPermission();
      expect(result).toBe("granted");
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it("should return 'denied' when permission request fails", async () => {
      const mockRequestPermission = vi
        .fn()
        .mockRejectedValue(new Error("Permission denied"));
      const mockNotification = {
        permission: "default" as NotificationPermission,
        requestPermission: mockRequestPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestNotificationPermission();
      expect(result).toBe("denied");
    });
  });

  describe("showNotificationPermissionPrompt", () => {
    it("should set hasSeenNotificationPrompt to true immediately when triggered", () => {
      showNotificationPermissionPrompt("Netflix");
      expect(useSettingsStore.getState().hasSeenNotificationPrompt).toBe(true);
    });

    it("should show iOS-specific message when on iOS Safari", () => {
      vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(
        true
      );

      showNotificationPermissionPrompt("Netflix");

      expect(toast.info).toHaveBeenCalledWith(
        "Bildirimler için lütfen uygulamayı Ana Ekrana ekleyin.",
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it("should show permission prompt with subscription name on standard browsers", () => {
      vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(
        false
      );

      showNotificationPermissionPrompt("Netflix");

      expect(toast).toHaveBeenCalledWith(
        "Netflix için ödeme hatırlatıcısı kurulsun mu?",
        expect.objectContaining({
          duration: Infinity,
          action: expect.objectContaining({
            label: "Evet, Bildirim Gönder",
          }),
          cancel: expect.objectContaining({
            label: "Şimdi Değil",
          }),
        })
      );
    });

    it("should include action button that requests permission", () => {
      showNotificationPermissionPrompt("Spotify");

      const toastCall = vi.mocked(toast).mock.calls[0];
      expect(toastCall).toBeDefined();
      expect(toastCall[1]).toHaveProperty("action");
      expect(toastCall[1]).toHaveProperty("cancel");
    });

    it("should personalize prompt with subscription name", () => {
      showNotificationPermissionPrompt("Adobe Creative Cloud");

      expect(toast).toHaveBeenCalledWith(
        "Adobe Creative Cloud için ödeme hatırlatıcısı kurulsun mu?",
        expect.anything()
      );
    });
  });

  describe("integration with SettingsStore", () => {
    it("should have access to setNotificationPermission action", () => {
      const store = useSettingsStore.getState();
      expect(typeof store.setNotificationPermission).toBe("function");
    });

    it("should update permission in store when action is called", () => {
      const store = useSettingsStore.getState();

      store.setNotificationPermission("granted");
      expect(useSettingsStore.getState().notificationPermission).toBe(
        "granted"
      );

      store.setNotificationPermission("denied");
      expect(useSettingsStore.getState().notificationPermission).toBe("denied");
    });
  });

  // ============ STORY 4.2 TESTS ============

  describe("requestAndUpdatePermission (Story 4.2)", () => {
    it("should return false and show error when Notification API unavailable", async () => {
      const originalNotification = globalThis.Notification;
      // @ts-expect-error - intentionally making Notification undefined
      globalThis.Notification = undefined;

      const result = await requestAndUpdatePermission();

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Bu tarayıcı bildirimleri desteklemiyor.",
        expect.objectContaining({ duration: 4000 })
      );

      globalThis.Notification = originalNotification;
    });

    it("should sync store and return true when already granted", async () => {
      const mockNotification = {
        permission: "granted" as NotificationPermission,
        requestPermission: vi.fn(),
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestAndUpdatePermission();

      expect(result).toBe(true);
      expect(useSettingsStore.getState().notificationPermission).toBe(
        "granted"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Bildirimler aktif!",
        expect.objectContaining({
          description: "Ödeme hatırlatıcıları artık size gönderilecek.",
        })
      );
    });

    it("should set denied with timestamp when browser already denied", async () => {
      const mockNotification = {
        permission: "denied" as NotificationPermission,
        requestPermission: vi.fn(),
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestAndUpdatePermission();

      expect(result).toBe(false);
      expect(useSettingsStore.getState().notificationPermission).toBe("denied");
      expect(
        useSettingsStore.getState().notificationPermissionDeniedAt
      ).toBeDefined();
      expect(toast.info).toHaveBeenCalledWith(
        "Bildirimleri daha sonra tarayıcı ayarlarından açabilirsiniz.",
        expect.objectContaining({ duration: 5000 })
      );
    });

    it("should request permission and update store on grant", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      const mockNotification = {
        permission: "default" as NotificationPermission,
        requestPermission: mockRequestPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestAndUpdatePermission();

      expect(result).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(useSettingsStore.getState().notificationPermission).toBe(
        "granted"
      );
      expect(toast.success).toHaveBeenCalled();
    });

    it("should request permission and set denied with timestamp on deny", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("denied");
      const mockNotification = {
        permission: "default" as NotificationPermission,
        requestPermission: mockRequestPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestAndUpdatePermission();

      expect(result).toBe(false);
      expect(useSettingsStore.getState().notificationPermission).toBe("denied");
      expect(
        useSettingsStore.getState().notificationPermissionDeniedAt
      ).toBeDefined();
      expect(toast.info).toHaveBeenCalled();
    });

    it("should return false when user dismisses prompt without choosing", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("default");
      const mockNotification = {
        permission: "default" as NotificationPermission,
        requestPermission: mockRequestPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const result = await requestAndUpdatePermission();

      expect(result).toBe(false);
      // Permission should remain default
      expect(useSettingsStore.getState().notificationPermission).toBe(
        "default"
      );
    });

    it("should handle permission request errors gracefully", async () => {
      const mockRequestPermission = vi
        .fn()
        .mockRejectedValue(new Error("Test error"));
      const mockNotification = {
        permission: "default" as NotificationPermission,
        requestPermission: mockRequestPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = await requestAndUpdatePermission();

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Bildirim izni istenemedi. Lütfen tekrar deneyin.",
        expect.objectContaining({ duration: 4000 })
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("isNotificationSupported", () => {
    it("should return true when Notification API available", () => {
      const mockNotification = {
        permission: "default" as NotificationPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      expect(isNotificationSupported()).toBe(true);
    });

    it("should return false when Notification API unavailable", () => {
      const originalNotification = globalThis.Notification;
      // @ts-expect-error - intentionally making Notification undefined
      globalThis.Notification = undefined;

      expect(isNotificationSupported()).toBe(false);

      globalThis.Notification = originalNotification;
    });
  });

  describe("getBrowserNotificationPermission", () => {
    it("should return current browser permission", () => {
      const mockNotification = {
        permission: "granted" as NotificationPermission,
      };
      // @ts-expect-error - partial mock
      globalThis.Notification = mockNotification;

      expect(getBrowserNotificationPermission()).toBe("granted");
    });

    it("should return 'unsupported' when Notification API unavailable", () => {
      const originalNotification = globalThis.Notification;
      // @ts-expect-error - intentionally making Notification undefined
      globalThis.Notification = undefined;

      expect(getBrowserNotificationPermission()).toBe("unsupported");

      globalThis.Notification = originalNotification;
    });
  });
});
