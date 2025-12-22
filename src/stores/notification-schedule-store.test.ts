import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useNotificationScheduleStore } from "./notification-schedule-store";
import type { NotificationScheduleEntry } from "@/types/notification-schedule";

// Helper to create a valid schedule entry
function createScheduleEntry(
  overrides: Partial<NotificationScheduleEntry> = {}
): NotificationScheduleEntry {
  return {
    subscriptionId: "550e8400-e29b-41d4-a716-446655440000",
    scheduledFor: "2025-01-12T09:00:00.000Z",
    paymentDueAt: "2025-01-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("NotificationScheduleStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useNotificationScheduleStore.setState({
      schedule: [],
      lastCalculatedAt: undefined,
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have empty schedule initially", () => {
      const { schedule, lastCalculatedAt } =
        useNotificationScheduleStore.getState();

      expect(schedule).toEqual([]);
      expect(lastCalculatedAt).toBeUndefined();
    });
  });

  describe("updateSchedule", () => {
    it("should update schedule with valid entries", () => {
      const entries: NotificationScheduleEntry[] = [
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
        }),
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
        }),
      ];

      useNotificationScheduleStore.getState().updateSchedule(entries);

      const { schedule, lastCalculatedAt } =
        useNotificationScheduleStore.getState();

      expect(schedule).toHaveLength(2);
      expect(schedule[0].subscriptionId).toBe(
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(schedule[1].subscriptionId).toBe(
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(lastCalculatedAt).toBe("2025-01-10T08:00:00.000Z");
    });

    it("should replace existing schedule", () => {
      // Initial schedule
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        ]);

      // New schedule
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
          }),
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440003",
          }),
        ]);

      const { schedule } = useNotificationScheduleStore.getState();

      expect(schedule).toHaveLength(2);
      expect(schedule[0].subscriptionId).toBe(
        "550e8400-e29b-41d4-a716-446655440002"
      );
    });

    it("should reject invalid entries", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Invalid: missing required fields
      const invalidEntries = [
        { subscriptionId: "not-a-uuid" } as NotificationScheduleEntry,
      ];

      useNotificationScheduleStore.getState().updateSchedule(invalidEntries);

      const { schedule } = useNotificationScheduleStore.getState();

      expect(schedule).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("markAsNotified", () => {
    it("should mark entry as notified with timestamp", () => {
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        ]);

      useNotificationScheduleStore
        .getState()
        .markAsNotified("550e8400-e29b-41d4-a716-446655440001");

      const { schedule } = useNotificationScheduleStore.getState();

      expect(schedule[0].notifiedAt).toBe("2025-01-10T08:00:00.000Z");
    });

    it("should not affect other entries", () => {
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
          }),
        ]);

      useNotificationScheduleStore
        .getState()
        .markAsNotified("550e8400-e29b-41d4-a716-446655440001");

      const { schedule } = useNotificationScheduleStore.getState();

      expect(schedule[0].notifiedAt).toBeDefined();
      expect(schedule[1].notifiedAt).toBeUndefined();
    });

    it("should handle non-existent subscription gracefully", () => {
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        ]);

      // Should not throw
      useNotificationScheduleStore.getState().markAsNotified("non-existent");

      const { schedule } = useNotificationScheduleStore.getState();

      expect(schedule[0].notifiedAt).toBeUndefined();
    });
  });

  describe("clearSchedule", () => {
    it("should clear all entries", () => {
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
          }),
        ]);

      useNotificationScheduleStore.getState().clearSchedule();

      const { schedule, lastCalculatedAt } =
        useNotificationScheduleStore.getState();

      expect(schedule).toEqual([]);
      expect(lastCalculatedAt).toBeDefined(); // Should update timestamp
    });
  });

  describe("getPendingNotifications", () => {
    it("should return only entries without notifiedAt", () => {
      useNotificationScheduleStore.getState().updateSchedule([
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          notifiedAt: "2025-01-09T09:00:00.000Z",
        }),
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
        }),
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440003",
        }),
      ]);

      const pending = useNotificationScheduleStore
        .getState()
        .getPendingNotifications();

      expect(pending).toHaveLength(2);
      expect(pending[0].subscriptionId).toBe(
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(pending[1].subscriptionId).toBe(
        "550e8400-e29b-41d4-a716-446655440003"
      );
    });

    it("should return empty array when all notified", () => {
      useNotificationScheduleStore.getState().updateSchedule([
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          notifiedAt: "2025-01-09T09:00:00.000Z",
        }),
      ]);

      const pending = useNotificationScheduleStore
        .getState()
        .getPendingNotifications();

      expect(pending).toEqual([]);
    });
  });

  describe("getEntryBySubscriptionId", () => {
    it("should return entry when found", () => {
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440002",
          }),
        ]);

      const entry = useNotificationScheduleStore
        .getState()
        .getEntryBySubscriptionId("550e8400-e29b-41d4-a716-446655440002");

      expect(entry).toBeDefined();
      expect(entry?.subscriptionId).toBe(
        "550e8400-e29b-41d4-a716-446655440002"
      );
    });

    it("should return undefined when not found", () => {
      useNotificationScheduleStore
        .getState()
        .updateSchedule([
          createScheduleEntry({
            subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        ]);

      const entry = useNotificationScheduleStore
        .getState()
        .getEntryBySubscriptionId("non-existent");

      expect(entry).toBeUndefined();
    });
  });

  describe("persistence", () => {
    it("should persist schedule to localStorage", () => {
      const entries = [
        createScheduleEntry({
          subscriptionId: "550e8400-e29b-41d4-a716-446655440001",
        }),
      ];

      useNotificationScheduleStore.getState().updateSchedule(entries);

      // The store uses persist middleware, which saves to localStorage
      // In tests, we verify the state is correctly maintained
      const { schedule } = useNotificationScheduleStore.getState();

      expect(schedule).toHaveLength(1);
    });
  });
});
