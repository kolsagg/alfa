import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkAndDispatchNotifications,
  syncNotificationPermissions,
} from "./notification-dispatcher";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { displayNotification } from "@/lib/notification/display-service";

// Mock displayNotification
vi.mock("@/lib/notification/display-service", () => ({
  displayNotification: vi.fn(),
}));

describe("Notification Dispatcher", () => {
  beforeEach(() => {
    // Reset stores
    useNotificationScheduleStore.getState().clearSchedule();
    useSubscriptionStore.setState({ subscriptions: [] });
    useNotificationScheduleStore.setState({
      schedule: [],
      lastCalculatedAt: undefined,
    });
    useSettingsStore.setState({
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
    });

    vi.clearAllMocks();
  });

  const mockSubscription = {
    id: "sub-1",
    name: "Test Sub",
    amount: 10,
    currency: "USD" as const,
    isActive: true,
    billingCycle: "monthly" as const,
    nextPaymentDate: "2024-02-01T00:00:00.000Z",
    categoryId: "tools" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe("checkAndDispatchNotifications", () => {
    it("should dispatch notification if scheduled time is past", () => {
      // Given
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "sub-1",
            scheduledFor: new Date(Date.now() - 1000).toISOString(), // 1s ago
            paymentDueAt: "2024-02-01T00:00:00.000Z",
          },
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (displayNotification as any).mockReturnValue({}); // Mock success

      // When
      checkAndDispatchNotifications();

      // Then
      expect(displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription: expect.objectContaining({ id: "sub-1" }),
          paymentDueAt: "2024-02-01T00:00:00.000Z",
        })
      );

      // Check store updated
      const entry = useNotificationScheduleStore
        .getState()
        .getEntryBySubscriptionId("sub-1");
      expect(entry?.notifiedAt).toBeDefined();
    });

    it("should NOT dispatch if scheduled time is future", () => {
      // Given
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "sub-1",
            scheduledFor: new Date(Date.now() + 10000).toISOString(), // 10s future
            paymentDueAt: "2024-02-01T00:00:00.000Z",
          },
        ],
      });

      // When
      checkAndDispatchNotifications();

      // Then
      expect(displayNotification).not.toHaveBeenCalled();
      const entry = useNotificationScheduleStore
        .getState()
        .getEntryBySubscriptionId("sub-1");
      expect(entry?.notifiedAt).toBeUndefined();
    });

    it("should NOT dispatch if already notified (race condition check)", () => {
      // Given
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "sub-1",
            scheduledFor: new Date(Date.now() - 1000).toISOString(),
            paymentDueAt: "2024-02-01T00:00:00.000Z",
            notifiedAt: new Date().toISOString(), // Already notified
          },
        ],
      });

      // When
      checkAndDispatchNotifications();

      // Then
      expect(displayNotification).not.toHaveBeenCalled();
    });

    it("should log reliability success", () => {
      // Setup similar to first test
      useSubscriptionStore.setState({ subscriptions: [mockSubscription] });
      useNotificationScheduleStore.setState({
        schedule: [
          {
            subscriptionId: "sub-1",
            scheduledFor: new Date(Date.now() - 1000).toISOString(),
            paymentDueAt: "2024-02-01T00:00:00.000Z",
          },
        ],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (displayNotification as any).mockReturnValue({});

      checkAndDispatchNotifications();

      const logs = JSON.parse(localStorage.getItem("reliabilityLog") || "[]");
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        subscriptionIds: ["sub-1"],
        count: 1,
        status: "success",
      });
    });
  });

  describe("syncNotificationPermissions", () => {
    beforeEach(() => {
      // Mock Notification if not present (happy-dom covers it usually but we want to modify permission)
      if (typeof Notification === "undefined") {
        vi.stubGlobal("Notification", { permission: "default" });
      }
    });

    it("should update store if permission changed", () => {
      Object.defineProperty(Notification, "permission", {
        value: "granted",
        writable: true,
      });

      syncNotificationPermissions();

      expect(useSettingsStore.getState().notificationPermission).toBe(
        "granted"
      );
    });

    it("should mark deniedAt if changed to denied", () => {
      Object.defineProperty(Notification, "permission", {
        value: "denied",
        writable: true,
      });

      syncNotificationPermissions();

      expect(useSettingsStore.getState().notificationPermission).toBe("denied");
      expect(
        useSettingsStore.getState().notificationPermissionDeniedAt
      ).toBeDefined();
    });
  });
});
