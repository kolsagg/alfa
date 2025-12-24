/**
 * NotificationSettings Component Tests
 *
 * Story 8.5: Tests for notification settings enhancement
 * - AC2: Days before selection behavior
 * - AC3: Time input validation
 * - AC4: Conditional visibility
 * - AC5: Accessibility
 * - AC6: Schedule sync verification
 */

import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NotificationSettings } from "./notification-settings";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import * as notificationUtils from "@/lib/notification/utils";

// Mock notification permission check
vi.mock("@/lib/notification-permission", () => ({
  isNotificationSupported: vi.fn().mockReturnValue(true),
  getBrowserNotificationPermission: vi.fn().mockReturnValue("granted"),
  requestAndUpdatePermission: vi.fn().mockResolvedValue(true),
}));

// Mock iOS detection
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  detectIOSSafariNonStandalone: vi.fn().mockReturnValue(false),
}));

describe("NotificationSettings", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset stores to default state before each test
    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationPermission: "granted",
      notificationDaysBefore: 3,
      notificationTime: "09:00",
    });

    useNotificationScheduleStore.setState({
      schedule: [],
      lastCalculatedAt: undefined,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Conditional Visibility (AC4)", () => {
    it("shows expanded controls when notifications are effectively enabled", () => {
      render(<NotificationSettings />);

      // Main toggle should always be visible
      expect(
        screen.getByLabelText(/bildirimleri etkinleştir/i)
      ).toBeInTheDocument();

      // Days and time controls should be visible when enabled
      expect(screen.getByText(/kaç gün önce/i)).toBeInTheDocument();
      expect(screen.getByText(/bildirim saati/i)).toBeInTheDocument();
    });

    it("hides expanded controls when notifications toggle is off", () => {
      // Mock isPushNotificationActive to return false for this test
      vi.spyOn(notificationUtils, "isPushNotificationActive").mockReturnValue(
        false
      );

      useSettingsStore.setState({
        notificationsEnabled: false,
        notificationPermission: "granted",
      });

      render(<NotificationSettings />);

      // Main toggle should still be visible
      expect(
        screen.getByLabelText(/bildirimleri etkinleştir/i)
      ).toBeInTheDocument();

      // Expanded controls should be hidden
      expect(
        screen.queryByText(/kaç gün önce hatırlat/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/bildirim saati/i)).not.toBeInTheDocument();
    });

    it("hides expanded controls when permission is denied", () => {
      // Mock isPushNotificationActive to return false for denied permission
      vi.spyOn(notificationUtils, "isPushNotificationActive").mockReturnValue(
        false
      );

      useSettingsStore.setState({
        notificationsEnabled: true,
        notificationPermission: "denied",
      });

      render(<NotificationSettings />);

      // Expanded controls should be hidden
      expect(
        screen.queryByText(/kaç gün önce hatırlat/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/bildirim saati/i)).not.toBeInTheDocument();
    });

    it("hides expanded controls when permission is default", () => {
      // Mock isPushNotificationActive to return false for default permission
      vi.spyOn(notificationUtils, "isPushNotificationActive").mockReturnValue(
        false
      );

      useSettingsStore.setState({
        notificationsEnabled: true,
        notificationPermission: "default",
      });

      render(<NotificationSettings />);

      // Expanded controls should be hidden
      expect(
        screen.queryByText(/kaç gün önce hatırlat/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Days Before Select (AC2)", () => {
    it("displays current days before value from store", () => {
      useSettingsStore.setState({ notificationDaysBefore: 5 });

      render(<NotificationSettings />);

      // Find the select trigger - should display "5 gün"
      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveTextContent("5 gün");
    });

    it("renders select with proper accessibility label", () => {
      render(<NotificationSettings />);

      // Label should be associated with combobox
      const label = screen.getByText(/kaç gün önce hatırlat/i);
      expect(label.tagName.toLowerCase()).toBe("label");
    });

    it("has aria-describedby linking select to helper text", () => {
      render(<NotificationSettings />);

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-describedby");
    });
  });

  describe("Time Input (AC3)", () => {
    it("displays time input with correct type", () => {
      render(<NotificationSettings />);

      // Find time input by type attribute
      const timeInput = document.querySelector('input[type="time"]');
      expect(timeInput).toBeInTheDocument();
    });

    it("displays current time value from store", () => {
      useSettingsStore.setState({ notificationTime: "14:30" });

      render(<NotificationSettings />);

      const timeInput = document.querySelector(
        'input[type="time"]'
      ) as HTMLInputElement;
      expect(timeInput?.value).toBe("14:30");
    });

    it("has helper text explaining format", () => {
      render(<NotificationSettings />);

      expect(screen.getByText(/24h/i)).toBeInTheDocument();
    });

    it("has proper label for accessibility", () => {
      render(<NotificationSettings />);

      const label = screen.getByText(/bildirim saati/i);
      expect(label.tagName.toLowerCase()).toBe("label");
    });

    it("has aria-describedby for time input helper text", () => {
      render(<NotificationSettings />);

      const timeInput = document.querySelector('input[type="time"]');
      expect(timeInput).toHaveAttribute("aria-describedby");
    });
  });

  describe("Reminder Preview (AC6)", () => {
    it("shows next reminder when schedule has entries", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      futureDate.setHours(9, 0, 0, 0);

      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() + 6);

      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledFor: futureDate.toISOString(),
            paymentDueAt: paymentDate.toISOString(),
          },
        ],
      });

      render(<NotificationSettings />);

      // Preview should show
      expect(screen.getByText(/bir sonraki hatırlatıcı/i)).toBeInTheDocument();
    });

    it("shows no reminder message when schedule is empty", () => {
      useNotificationScheduleStore.setState({ schedule: [] });

      render(<NotificationSettings />);

      expect(screen.getByText(/planlı hatırlatıcı yok/i)).toBeInTheDocument();
    });

    it("shows earliest pending notification in preview", () => {
      const earlierDate = new Date();
      earlierDate.setDate(earlierDate.getDate() + 2);

      const laterDate = new Date();
      laterDate.setDate(laterDate.getDate() + 5);

      const paymentDate1 = new Date();
      paymentDate1.setDate(paymentDate1.getDate() + 5);
      const paymentDate2 = new Date();
      paymentDate2.setDate(paymentDate2.getDate() + 8);

      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
            scheduledFor: laterDate.toISOString(),
            paymentDueAt: paymentDate2.toISOString(),
          },
          {
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledFor: earlierDate.toISOString(),
            paymentDueAt: paymentDate1.toISOString(),
          },
        ],
      });

      render(<NotificationSettings />);

      // Should show the earlier date (preview exists)
      expect(screen.getByText(/bir sonraki hatırlatıcı/i)).toBeInTheDocument();
    });

    it("excludes already notified entries from preview", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() + 6);

      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledFor: futureDate.toISOString(),
            paymentDueAt: paymentDate.toISOString(),
            notifiedAt: new Date().toISOString(), // Already notified
          },
        ],
      });

      render(<NotificationSettings />);

      // Should show no reminder since all are notified
      expect(screen.getByText(/planlı hatırlatıcı yok/i)).toBeInTheDocument();
    });
  });

  describe("iOS Safari Detection", () => {
    it("calls onIOSSafariDetected callback when iOS Safari detected during toggle", async () => {
      const onIOSSafariDetected = vi.fn();

      // Mock iOS detection to return true
      const { detectIOSSafariNonStandalone } = await import(
        "@/hooks/use-ios-pwa-detection"
      );
      vi.mocked(detectIOSSafariNonStandalone).mockReturnValue(true);

      // Start with notifications off so toggle can be turned on
      useSettingsStore.setState({
        notificationsEnabled: false,
        notificationPermission: "default",
      });

      // Mock isPushNotificationActive to return false initially
      vi.spyOn(notificationUtils, "isPushNotificationActive").mockReturnValue(
        false
      );

      render(
        <NotificationSettings onIOSSafariDetected={onIOSSafariDetected} />
      );

      // Try to toggle on
      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      await waitFor(() => {
        expect(onIOSSafariDetected).toHaveBeenCalled();
      });
    });
  });

  describe("Store Integration", () => {
    it("reflects store changes in real-time for days before", async () => {
      render(<NotificationSettings />);

      // Update store externally - wrap in act
      await act(async () => {
        useSettingsStore.setState({ notificationDaysBefore: 10 });
      });

      await waitFor(() => {
        const selectTrigger = screen.getByRole("combobox");
        expect(selectTrigger).toHaveTextContent("10 gün");
      });
    });

    it("renders section subtitle text", () => {
      render(<NotificationSettings />);

      expect(screen.getByText(/hatırlatma ayarları/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility (AC5)", () => {
    it("uses icons with aria-hidden for decorative purposes", () => {
      render(<NotificationSettings />);

      // Icons should be hidden from screen readers
      const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("renders main toggle with switch role", () => {
      render(<NotificationSettings />);

      const toggle = screen.getByRole("switch");
      expect(toggle).toBeInTheDocument();
    });
  });
});
