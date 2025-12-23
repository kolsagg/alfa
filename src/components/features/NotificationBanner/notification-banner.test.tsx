import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBanner } from "./notification-banner";
import {
  shouldShowNotificationBanner,
  isNotificationUnavailable,
} from "./utils";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";
import { NOTIFICATION_STRINGS } from "@/lib/i18n/notifications";

// Mock iOS detection hook
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  useIOSPWADetection: vi.fn(() => ({ shouldShowPrompt: false })),
  detectIOSSafariNonStandalone: vi.fn(() => false),
}));

// Mock notification-permission for isNotificationSupported
vi.mock("@/lib/notification-permission", () => ({
  isNotificationSupported: vi.fn(() => true),
}));

import { useIOSPWADetection } from "@/hooks/use-ios-pwa-detection";
import { isNotificationSupported } from "@/lib/notification-permission";

const mockedUseIOSPWADetection = vi.mocked(useIOSPWADetection);
const mockedIsNotificationSupported = vi.mocked(isNotificationSupported);

describe("NotificationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsNotificationSupported.mockReturnValue(true);
    mockedUseIOSPWADetection.mockReturnValue({ shouldShowPrompt: false });
    useSettingsStore.setState({
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
      lastIOSPromptDismissed: undefined,
    } as Partial<SettingsState>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
        screen.getByText(NOTIFICATION_STRINGS.BANNER_DENIED)
      ).toBeInTheDocument();
    });

    it("should hide permanently when dismiss button clicked", async () => {
      const user = userEvent.setup();
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner />);

      const dismissButton = screen.getByLabelText(
        NOTIFICATION_STRINGS.BANNER_DISMISS_ARIA
      );
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

    it("should use i18n string for banner text", () => {
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner />);

      expect(
        screen.getByText(NOTIFICATION_STRINGS.BANNER_DENIED)
      ).toBeInTheDocument();
    });

    it("should use i18n string for dismiss button aria-label", () => {
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      render(<NotificationBanner />);

      const dismissButton = screen.getByLabelText(
        NOTIFICATION_STRINGS.BANNER_DISMISS_ARIA
      );
      expect(dismissButton).toBeInTheDocument();
    });

    it("should not render when iOS modal is active (Story 4.7 AC1)", () => {
      mockedUseIOSPWADetection.mockReturnValue({ shouldShowPrompt: true });
      useSettingsStore.setState({
        notificationPermission: "denied",
        notificationPermissionDeniedAt: new Date().toISOString(),
      } as Partial<SettingsState>);

      const { container } = render(<NotificationBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("isNotificationUnavailable helper", () => {
    it("should return true when notifications are not supported", () => {
      mockedIsNotificationSupported.mockReturnValue(false);
      expect(isNotificationUnavailable("granted")).toBe(true);
    });

    it("should return true when permission is denied", () => {
      mockedIsNotificationSupported.mockReturnValue(true);
      expect(isNotificationUnavailable("denied")).toBe(true);
    });

    it("should return false when supported and granted", () => {
      mockedIsNotificationSupported.mockReturnValue(true);
      expect(isNotificationUnavailable("granted")).toBe(false);
    });

    it("should return false when supported and default", () => {
      mockedIsNotificationSupported.mockReturnValue(true);
      expect(isNotificationUnavailable("default")).toBe(false);
    });
  });

  describe("Story 4.7: iOS modal priority", () => {
    it("should suppress banner when iOS modal is active even if denied", () => {
      expect(
        shouldShowNotificationBanner(
          {
            notificationPermission: "denied",
            notificationPermissionDeniedAt: new Date().toISOString(),
          },
          undefined,
          true // isIOSModalActive
        )
      ).toBe(false);
    });

    it("should show banner when iOS modal is not active and denied", () => {
      expect(
        shouldShowNotificationBanner(
          {
            notificationPermission: "denied",
            notificationPermissionDeniedAt: new Date().toISOString(),
          },
          undefined,
          false // isIOSModalActive
        )
      ).toBe(true);
    });
  });
});
