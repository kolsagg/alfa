/**
 * BackupReminderBanner Tests
 *
 * Story 5.4: Task 7 - Testing & Validation
 * AC1: Backup Reminder Detection
 * AC2: Reminder UI
 * AC3: Backup Now Action
 * AC4: Remind Me Later Action
 * AC5: Don't Remind Me Action
 * AC6: First-Time User Handling
 * AC10: Testing & Quality
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BackupReminderBanner } from "./backup-reminder-banner";
import { useSettingsStore } from "@/stores/settings-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import * as exportModule from "@/lib/backup/export-data";

// Mock exportBackup
vi.mock("@/lib/backup/export-data", () => ({
  exportBackup: vi.fn(),
}));

// Mock subscription for testing
const mockSubscription = {
  id: "sub-1",
  name: "Netflix",
  amount: 99,
  currency: "TRY" as const,
  billingCycle: "monthly" as const,
  nextPaymentDate: new Date().toISOString(),
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Helper to create subscription with old createdAt
const createOldSubscription = (daysAgo: number) => ({
  ...mockSubscription,
  createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
});

describe("BackupReminderBanner", () => {
  beforeEach(() => {
    // Reset stores to default state
    useSettingsStore.setState({
      lastBackupDate: undefined,
      backupReminderDisabled: false,
      backupReminderDismissedAt: undefined,
    });

    useSubscriptionStore.setState({
      subscriptions: [],
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  describe("AC1: Reminder Visibility Logic", () => {
    it("should NOT render when no subscriptions exist", () => {
      useSubscriptionStore.setState({ subscriptions: [] });

      render(<BackupReminderBanner />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should NOT render when backupReminderDisabled is true", () => {
      useSettingsStore.setState({ backupReminderDisabled: true });
      useSubscriptionStore.setState({
        subscriptions: [createOldSubscription(10)],
      });

      render(<BackupReminderBanner />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should NOT render when backup is less than 7 days old", () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString();

      useSettingsStore.setState({ lastBackupDate: threeDaysAgo });
      useSubscriptionStore.setState({
        subscriptions: [mockSubscription],
      });

      render(<BackupReminderBanner />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should render when backup is 7+ days old", () => {
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();

      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({
        subscriptions: [mockSubscription],
      });

      render(<BackupReminderBanner />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("AC2: Reminder UI Elements", () => {
    beforeEach(() => {
      // Setup state to show reminder
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();
      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
    });

    it("should display reminder message", () => {
      render(<BackupReminderBanner />);

      expect(
        screen.getByText("Son yedeğinizin üzerinden 7 gün geçti")
      ).toBeInTheDocument();
    });

    it("should display Backup Now button", () => {
      render(<BackupReminderBanner />);

      expect(
        screen.getByRole("button", { name: /Şimdi Yedekle/i })
      ).toBeInTheDocument();
    });

    it("should display Remind Later button", () => {
      render(<BackupReminderBanner />);

      expect(
        screen.getByRole("button", { name: /Daha Sonra Hatırlat/i })
      ).toBeInTheDocument();
    });

    it("should have close button for Don't Remind", () => {
      render(<BackupReminderBanner />);

      expect(
        screen.getByRole("button", { name: /Bir Daha Gösterme/i })
      ).toBeInTheDocument();
    });

    it("should have warning styling with amber colors", () => {
      render(<BackupReminderBanner />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-amber-50");
      expect(alert).toHaveClass("border-amber-200");
    });
  });

  describe("AC3: Backup Now Action", () => {
    beforeEach(() => {
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();
      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
    });

    it("should call exportBackup when Backup Now is clicked", async () => {
      const mockExportBackup = vi.mocked(exportModule.exportBackup);
      mockExportBackup.mockResolvedValue({ success: true });

      render(<BackupReminderBanner />);

      const backupButton = screen.getByRole("button", {
        name: /Şimdi Yedekle/i,
      });
      fireEvent.click(backupButton);

      await waitFor(() => {
        expect(mockExportBackup).toHaveBeenCalled();
      });
    });

    it("should show success state after successful export", async () => {
      const mockExportBackup = vi.mocked(exportModule.exportBackup);
      mockExportBackup.mockResolvedValue({ success: true });

      render(<BackupReminderBanner />);

      const backupButton = screen.getByRole("button", {
        name: /Şimdi Yedekle/i,
      });
      fireEvent.click(backupButton);

      await waitFor(() => {
        expect(
          screen.getByText("Yedek başarıyla oluşturuldu")
        ).toBeInTheDocument();
      });
    });

    it("should update lastBackupDate after successful export", async () => {
      const mockExportBackup = vi.mocked(exportModule.exportBackup);
      mockExportBackup.mockResolvedValue({ success: true });

      render(<BackupReminderBanner />);

      const initialBackupDate = useSettingsStore.getState().lastBackupDate;

      const backupButton = screen.getByRole("button", {
        name: /Şimdi Yedekle/i,
      });
      fireEvent.click(backupButton);

      await waitFor(() => {
        const newBackupDate = useSettingsStore.getState().lastBackupDate;
        expect(newBackupDate).not.toBe(initialBackupDate);
      });
    });
  });

  describe("AC4: Remind Later Action (24h cooldown)", () => {
    beforeEach(() => {
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();
      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
    });

    it("should set backupReminderDismissedAt when Remind Later is clicked", () => {
      render(<BackupReminderBanner />);

      const remindLaterButton = screen.getByRole("button", {
        name: /Daha Sonra Hatırlat/i,
      });
      fireEvent.click(remindLaterButton);

      const state = useSettingsStore.getState();
      expect(state.backupReminderDismissedAt).toBeDefined();
    });

    it("should hide banner after Remind Later is clicked", async () => {
      render(<BackupReminderBanner />);

      const remindLaterButton = screen.getByRole("button", {
        name: /Daha Sonra Hatırlat/i,
      });
      fireEvent.click(remindLaterButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("AC5: Don't Remind Action (permanent disable)", () => {
    beforeEach(() => {
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();
      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
    });

    it("should set backupReminderDisabled to true when close button is clicked", () => {
      render(<BackupReminderBanner />);

      const closeButton = screen.getByRole("button", {
        name: /Bir Daha Gösterme/i,
      });
      fireEvent.click(closeButton);

      const state = useSettingsStore.getState();
      expect(state.backupReminderDisabled).toBe(true);
    });

    it("should hide banner after Don't Remind is clicked", async () => {
      render(<BackupReminderBanner />);

      const closeButton = screen.getByRole("button", {
        name: /Bir Daha Gösterme/i,
      });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("AC6: First-Time User Handling (soft prompt)", () => {
    it("should show soft prompt for first-time users with old subscription", () => {
      // No backup date, subscription 10 days old
      useSettingsStore.setState({ lastBackupDate: undefined });
      useSubscriptionStore.setState({
        subscriptions: [createOldSubscription(10)],
      });

      render(<BackupReminderBanner />);

      // Should show soft prompt message
      expect(
        screen.getByText("Verilerinizi yedeklemeyi düşünün")
      ).toBeInTheDocument();
    });

    it("should NOT show soft prompt when subscription is less than 7 days old", () => {
      useSettingsStore.setState({ lastBackupDate: undefined });
      useSubscriptionStore.setState({
        subscriptions: [createOldSubscription(3)],
      });

      render(<BackupReminderBanner />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();
      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
    });

    it("should have role=alert for screen readers", () => {
      render(<BackupReminderBanner />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should have aria-live=polite for live region", () => {
      render(<BackupReminderBanner />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper aria-label on close button", () => {
      render(<BackupReminderBanner />);

      const closeButton = screen.getByRole("button", {
        name: /Bir Daha Gösterme/i,
      });
      expect(closeButton).toHaveAttribute("aria-label", "Bir Daha Gösterme");
    });
  });
});
