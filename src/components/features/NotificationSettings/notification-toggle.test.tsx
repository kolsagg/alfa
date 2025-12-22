import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationToggle } from "./notification-toggle";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";
import * as notificationPermission from "@/lib/notification-permission";
import * as iosDetection from "@/hooks/use-ios-pwa-detection";

// Mock notification permission module
vi.mock("@/lib/notification-permission", () => ({
  requestAndUpdatePermission: vi.fn(),
  isNotificationSupported: vi.fn(() => true),
  getBrowserNotificationPermission: vi.fn(() => "default"),
}));

// Mock iOS detection
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  detectIOSSafariNonStandalone: vi.fn(() => false),
}));

describe("NotificationToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store with v4 fields
    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
    } as Partial<SettingsState>);

    // Default mocks
    vi.mocked(notificationPermission.isNotificationSupported).mockReturnValue(
      true
    );
    vi.mocked(
      notificationPermission.getBrowserNotificationPermission
    ).mockReturnValue("default");
    vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render toggle with label", () => {
    render(<NotificationToggle />);

    expect(
      screen.getByLabelText("Bildirimleri Etkinleştir")
    ).toBeInTheDocument();
    expect(screen.getByText("Ödeme hatırlatıcıları al")).toBeInTheDocument();
  });

  it("should show checked state when notifications enabled and granted", () => {
    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationPermission: "granted",
    } as Partial<SettingsState>);
    vi.mocked(
      notificationPermission.getBrowserNotificationPermission
    ).mockReturnValue("granted");

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeChecked();
    expect(screen.getByText("Bildirimler aktif")).toBeInTheDocument();
  });

  it("should request permission when toggled ON with default permission", async () => {
    const user = userEvent.setup();
    vi.mocked(
      notificationPermission.requestAndUpdatePermission
    ).mockResolvedValue(true);

    useSettingsStore.setState({
      notificationsEnabled: false,
      notificationPermission: "default",
    } as Partial<SettingsState>);

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(
        notificationPermission.requestAndUpdatePermission
      ).toHaveBeenCalled();
    });
  });

  it("should NOT request permission when already granted", async () => {
    const user = userEvent.setup();

    useSettingsStore.setState({
      notificationsEnabled: false,
      notificationPermission: "granted",
    } as Partial<SettingsState>);
    vi.mocked(
      notificationPermission.getBrowserNotificationPermission
    ).mockReturnValue("granted");

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(
      notificationPermission.requestAndUpdatePermission
    ).not.toHaveBeenCalled();
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
  });

  it("should call onIOSSafariDetected when on iOS Safari", async () => {
    const user = userEvent.setup();
    const onIOSSafariDetected = vi.fn();
    vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(true);

    useSettingsStore.setState({
      notificationsEnabled: false,
      notificationPermission: "default",
    } as Partial<SettingsState>);

    render(<NotificationToggle onIOSSafariDetected={onIOSSafariDetected} />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(onIOSSafariDetected).toHaveBeenCalled();
    expect(
      notificationPermission.requestAndUpdatePermission
    ).not.toHaveBeenCalled();
  });

  it("should disable toggle when Notification API unavailable", () => {
    vi.mocked(notificationPermission.isNotificationSupported).mockReturnValue(
      false
    );
    vi.mocked(
      notificationPermission.getBrowserNotificationPermission
    ).mockReturnValue("unsupported");

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    expect(
      screen.getByText("Bu tarayıcı bildirimleri desteklemiyor")
    ).toBeInTheDocument();
  });

  it("should disable toggle when permission denied", () => {
    useSettingsStore.setState({
      notificationPermission: "denied",
    } as Partial<SettingsState>);
    vi.mocked(
      notificationPermission.getBrowserNotificationPermission
    ).mockReturnValue("denied");

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    expect(
      screen.getByText("Tarayıcı ayarlarından izin verin")
    ).toBeInTheDocument();
  });

  it("should update store on permission result", async () => {
    const user = userEvent.setup();
    vi.mocked(
      notificationPermission.requestAndUpdatePermission
    ).mockResolvedValue(true);

    useSettingsStore.setState({
      notificationsEnabled: false,
      notificationPermission: "default",
    } as Partial<SettingsState>);

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    });
  });

  it("should show loading state during permission request", async () => {
    const user = userEvent.setup();

    // Mock slow permission request
    vi.mocked(
      notificationPermission.requestAndUpdatePermission
    ).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    );

    useSettingsStore.setState({
      notificationsEnabled: false,
      notificationPermission: "default",
    } as Partial<SettingsState>);

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    // Should show loading spinner (Loader2 has animate-spin class)
    await waitFor(() => {
      const loader = document.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });
  });

  it("should allow turning off notifications without permission request", async () => {
    const user = userEvent.setup();

    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationPermission: "granted",
    } as Partial<SettingsState>);
    vi.mocked(
      notificationPermission.getBrowserNotificationPermission
    ).mockReturnValue("granted");

    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(
      notificationPermission.requestAndUpdatePermission
    ).not.toHaveBeenCalled();
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it("should have proper accessibility attributes", () => {
    render(<NotificationToggle />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("id", "notification-toggle");
    expect(toggle).toHaveAttribute("aria-describedby", "notification-status");

    // Label should be associated
    const label = screen.getByText("Bildirimleri Etkinleştir");
    expect(label).toHaveAttribute("for", "notification-toggle");
  });
});
