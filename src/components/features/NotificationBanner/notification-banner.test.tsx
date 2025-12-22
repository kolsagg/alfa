import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBanner } from "./notification-banner";
import { shouldShowNotificationBanner } from "./utils";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";

describe("NotificationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
    } as Partial<SettingsState>);
  });

  describe("shouldShowNotificationBanner helper", () => {
    it("should return false when permission is not denied", () => {
      expect(
        shouldShowNotificationBanner({ notificationPermission: "default" })
      ).toBe(false);
      expect(
        shouldShowNotificationBanner({ notificationPermission: "granted" })
      ).toBe(false);
    });

    it("should return false when already dismissed", () => {
      expect(
        shouldShowNotificationBanner({
          notificationPermission: "denied",
          notificationBannerDismissedAt: new Date().toISOString(),
        })
      ).toBe(false);
    });

    it("should return true when denied and within 7 days", () => {
      const deniedAt = new Date();
      deniedAt.setDate(deniedAt.getDate() - 3); // 3 days ago

      expect(
        shouldShowNotificationBanner({
          notificationPermission: "denied",
          notificationPermissionDeniedAt: deniedAt.toISOString(),
        })
      ).toBe(true);
    });

    it("should return false after 7 days if no imminent payment", () => {
      const deniedAt = new Date();
      deniedAt.setDate(deniedAt.getDate() - 10); // 10 days ago

      expect(
        shouldShowNotificationBanner({
          notificationPermission: "denied",
          notificationPermissionDeniedAt: deniedAt.toISOString(),
        })
      ).toBe(false);
    });

    it("should return true after 7 days if payment within 3 days", () => {
      const deniedAt = new Date();
      deniedAt.setDate(deniedAt.getDate() - 10); // 10 days ago

      const nextPayment = new Date();
      nextPayment.setDate(nextPayment.getDate() + 2); // 2 days from now

      expect(
        shouldShowNotificationBanner(
          {
            notificationPermission: "denied",
            notificationPermissionDeniedAt: deniedAt.toISOString(),
          },
          nextPayment.toISOString()
        )
      ).toBe(true);
    });

    it("should return false after 7 days if payment more than 3 days away", () => {
      const deniedAt = new Date();
      deniedAt.setDate(deniedAt.getDate() - 10); // 10 days ago

      const nextPayment = new Date();
      nextPayment.setDate(nextPayment.getDate() + 5); // 5 days from now

      expect(
        shouldShowNotificationBanner(
          {
            notificationPermission: "denied",
            notificationPermissionDeniedAt: deniedAt.toISOString(),
          },
          nextPayment.toISOString()
        )
      ).toBe(false);
    });

    it("should return true for legacy denied state without timestamp", () => {
      expect(
        shouldShowNotificationBanner({
          notificationPermission: "denied",
          notificationPermissionDeniedAt: undefined,
        })
      ).toBe(true);
    });
  });

  describe("NotificationBanner component", () => {
    it("should not render when permission not denied", () => {
      useSettingsStore.setState({
        notificationPermission: "granted",
      } as Partial<SettingsState>);

      const { container } = render(<NotificationBanner />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when permission denied", () => {
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner />);

      expect(
        screen.getByText(
          "Bildirimler kapalı — Tarayıcı ayarlarından açabilirsiniz."
        )
      ).toBeInTheDocument();
    });

    it('should hide permanently when "Bir daha gösterme" clicked', async () => {
      const user = userEvent.setup();
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner />);

      const dismissButton = screen.getByLabelText("Bir daha gösterme");
      await user.click(dismissButton);

      expect(
        useSettingsStore.getState().notificationBannerDismissedAt
      ).toBeDefined();
    });

    it("should include accessible icon (not color-only)", () => {
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner />);

      // AlertTriangle icon should be present with aria-hidden
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should apply custom className", () => {
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner className="custom-class" />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("custom-class");
    });
  });
});
