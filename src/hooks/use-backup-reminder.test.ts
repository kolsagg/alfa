import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBackupReminder } from "./use-backup-reminder";
import { useSettingsStore } from "@/stores/settings-store";
import { useSubscriptionStore } from "@/stores/subscription-store";

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

describe("useBackupReminder", () => {
  beforeEach(() => {
    // Reset stores
    useSettingsStore.setState({
      lastBackupDate: undefined,
      backupReminderDisabled: false,
      backupReminderDismissedAt: undefined,
    });

    useSubscriptionStore.setState({
      subscriptions: [],
    });
  });

  describe("shouldShowReminder = false cases", () => {
    it("should return false when backupReminderDisabled is true", () => {
      useSettingsStore.setState({ backupReminderDisabled: true });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(false);
      expect(result.current.isFirstBackupSuggestion).toBe(false);
    });

    it("should return false when no subscriptions exist", () => {
      useSubscriptionStore.setState({ subscriptions: [] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(false);
    });

    it("should return false when dismissed within 24 hours", () => {
      // Dismissed 12 hours ago
      const twelveHoursAgo = new Date(
        Date.now() - 12 * 60 * 60 * 1000
      ).toISOString();

      // Backup was 10 days ago (should trigger, but dismissed recently)
      const tenDaysAgo = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString();

      useSettingsStore.setState({
        lastBackupDate: tenDaysAgo,
        backupReminderDismissedAt: twelveHoursAgo,
      });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(false);
    });

    it("should return false when backup is less than 7 days old", () => {
      // Backup was 3 days ago
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString();

      useSettingsStore.setState({ lastBackupDate: threeDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(false);
    });
  });

  describe("shouldShowReminder = true cases", () => {
    it("should return true when backup is 7+ days old", () => {
      // Backup was 8 days ago
      const eightDaysAgo = new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000
      ).toISOString();

      useSettingsStore.setState({ lastBackupDate: eightDaysAgo });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(true);
      expect(result.current.isFirstBackupSuggestion).toBe(false);
    });

    it("should return true after 24h cooldown expires", () => {
      // Dismissed 25 hours ago
      const twentyFiveHoursAgo = new Date(
        Date.now() - 25 * 60 * 60 * 1000
      ).toISOString();

      // Backup was 10 days ago
      const tenDaysAgo = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString();

      useSettingsStore.setState({
        lastBackupDate: tenDaysAgo,
        backupReminderDismissedAt: twentyFiveHoursAgo,
      });
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(true);
    });
  });

  describe("first backup suggestion (soft prompt)", () => {
    it("should show soft prompt when no backup exists and subscription is 7+ days old", () => {
      // Subscription created 10 days ago
      const tenDaysAgo = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString();

      const oldSubscription = {
        ...mockSubscription,
        createdAt: tenDaysAgo,
      };

      useSettingsStore.setState({ lastBackupDate: undefined });
      useSubscriptionStore.setState({ subscriptions: [oldSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(true);
      expect(result.current.isFirstBackupSuggestion).toBe(true);
    });

    it("should NOT show soft prompt when subscription is less than 7 days old", () => {
      // Subscription created 3 days ago
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString();

      const newSubscription = {
        ...mockSubscription,
        createdAt: threeDaysAgo,
      };

      useSettingsStore.setState({ lastBackupDate: undefined });
      useSubscriptionStore.setState({ subscriptions: [newSubscription] });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(false);
    });

    it("should use oldest subscription for threshold check", () => {
      // Oldest subscription: 10 days ago
      const tenDaysAgo = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString();

      // Newer subscription: 2 days ago
      const twoDaysAgo = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString();

      const oldSubscription = {
        ...mockSubscription,
        id: "old",
        createdAt: tenDaysAgo,
      };
      const newSubscription = {
        ...mockSubscription,
        id: "new",
        createdAt: twoDaysAgo,
      };

      useSettingsStore.setState({ lastBackupDate: undefined });
      useSubscriptionStore.setState({
        subscriptions: [newSubscription, oldSubscription], // Order should not matter
      });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.shouldShowReminder).toBe(true);
      expect(result.current.isFirstBackupSuggestion).toBe(true);
    });
  });
});
