import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateScheduledTime,
  handleImminentPayment,
  calculateNotificationSchedule,
  type ScheduleSettings,
} from "./notification-scheduling";
import type { Subscription } from "@/types/subscription";

// Helper to create mock subscription
function createMockSubscription(
  overrides: Partial<Subscription> = {}
): Subscription {
  return {
    id: "sub-123",
    name: "Netflix",
    amount: 99.99,
    currency: "TRY",
    billingPeriod: "monthly",
    nextPaymentDate: "2025-01-15T00:00:00.000Z",
    categoryId: "streaming",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// Helper to create mock settings
function createMockSettings(
  overrides: Partial<ScheduleSettings> = {}
): ScheduleSettings {
  return {
    notificationsEnabled: true,
    notificationPermission: "granted",
    notificationDaysBefore: 3,
    notificationTime: "09:00",
    ...overrides,
  };
}

describe("calculateScheduledTime", () => {
  it("should schedule X days before payment at specified time", () => {
    const paymentDate = "2025-01-15T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 3, "09:00");

    expect(result.getDate()).toBe(12); // 15 - 3 = 12
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("should handle different daysBefore values (1 day)", () => {
    const paymentDate = "2025-01-15T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 1, "09:00");

    expect(result.getDate()).toBe(14); // 15 - 1 = 14
  });

  it("should handle daysBefore = 7", () => {
    const paymentDate = "2025-01-15T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 7, "09:00");

    expect(result.getDate()).toBe(8); // 15 - 7 = 8
  });

  it("should handle daysBefore = 30", () => {
    const paymentDate = "2025-01-31T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 30, "09:00");

    // 31 - 30 = 1, which is Jan 1
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0); // January
  });

  it("should handle month boundary (Jan 3 payment, 5 days before = Dec 29)", () => {
    const paymentDate = "2025-01-03T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 5, "09:00");

    expect(result.getDate()).toBe(29);
    expect(result.getMonth()).toBe(11); // December
    expect(result.getFullYear()).toBe(2024);
  });

  it("should handle Feb 29 leap year", () => {
    // 2024 is a leap year
    const paymentDate = "2024-02-29T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 3, "09:00");

    expect(result.getDate()).toBe(26);
    expect(result.getMonth()).toBe(1); // February
  });

  it("should handle different notification times", () => {
    const paymentDate = "2025-01-15T00:00:00.000Z";

    const morning = calculateScheduledTime(paymentDate, 3, "06:30");
    expect(morning.getHours()).toBe(6);
    expect(morning.getMinutes()).toBe(30);

    const evening = calculateScheduledTime(paymentDate, 3, "20:00");
    expect(evening.getHours()).toBe(20);
    expect(evening.getMinutes()).toBe(0);
  });

  // DST tests - these test behavior around DST transitions
  // Note: Actual DST handling depends on system timezone
  it("should handle DST spring forward (March) - time stays at local time", () => {
    // March 30, 2025 is DST transition in Europe/Istanbul
    const paymentDate = "2025-03-30T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 1, "09:00");

    // The time should still be 09:00 local time
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it("should handle DST fall back (October) - time stays at local time", () => {
    // October 26, 2025 is DST transition in Europe/Istanbul
    const paymentDate = "2025-10-26T00:00:00.000Z";
    const result = calculateScheduledTime(paymentDate, 1, "09:00");

    // The time should still be 09:00 local time
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });
});

describe("handleImminentPayment", () => {
  it("should return original time if in the future", () => {
    const futureTime = new Date("2025-12-25T09:00:00");
    const now = new Date("2025-12-20T10:00:00");

    const result = handleImminentPayment(futureTime, "09:00", now);

    expect(result).toEqual(futureTime);
  });

  it("should schedule for today if today's notify time hasn't passed", () => {
    const pastTime = new Date("2025-12-19T09:00:00");
    const now = new Date("2025-12-20T08:00:00"); // 08:00, before 09:00

    const result = handleImminentPayment(pastTime, "09:00", now);

    expect(result.getDate()).toBe(20);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it("should schedule for now if today's notify time has passed", () => {
    const pastTime = new Date("2025-12-19T09:00:00");
    const now = new Date("2025-12-20T10:00:00"); // 10:00, after 09:00

    const result = handleImminentPayment(pastTime, "09:00", now);

    expect(result).toEqual(now);
  });

  it("should schedule for now if both original and today's time have passed", () => {
    const pastTime = new Date("2025-12-15T09:00:00");
    const now = new Date("2025-12-20T15:00:00");

    const result = handleImminentPayment(pastTime, "09:00", now);

    expect(result).toEqual(now);
  });
});

describe("calculateNotificationSchedule", () => {
  let mockNow: Date;

  beforeEach(() => {
    mockNow = new Date("2025-01-10T08:00:00.000Z");
  });

  it("should return empty array if notificationsEnabled is false", () => {
    const subscriptions = [createMockSubscription()];
    const settings = createMockSettings({ notificationsEnabled: false });

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result).toEqual([]);
  });

  it("should return empty array if permission is not granted (default)", () => {
    const subscriptions = [createMockSubscription()];
    const settings = createMockSettings({ notificationPermission: "default" });

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result).toEqual([]);
  });

  it("should return empty array if permission is denied", () => {
    const subscriptions = [createMockSubscription()];
    const settings = createMockSettings({ notificationPermission: "denied" });

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result).toEqual([]);
  });

  it("should only include active subscriptions", () => {
    const subscriptions = [
      createMockSubscription({ id: "active-1", isActive: true }),
      createMockSubscription({ id: "inactive-1", isActive: false }),
    ];
    const settings = createMockSettings();

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result.length).toBe(1);
    expect(result[0].subscriptionId).toBe("active-1");
  });

  it("should only include future payments", () => {
    const subscriptions = [
      createMockSubscription({
        id: "future-1",
        nextPaymentDate: "2025-01-15T00:00:00.000Z",
      }),
      createMockSubscription({
        id: "past-1",
        nextPaymentDate: "2025-01-05T00:00:00.000Z",
      }),
    ];
    const settings = createMockSettings();

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result.length).toBe(1);
    expect(result[0].subscriptionId).toBe("future-1");
  });

  it("should handle multiple subscriptions", () => {
    const subscriptions = [
      createMockSubscription({
        id: "sub-1",
        nextPaymentDate: "2025-01-20T00:00:00.000Z",
      }),
      createMockSubscription({
        id: "sub-2",
        nextPaymentDate: "2025-01-15T00:00:00.000Z",
      }),
      createMockSubscription({
        id: "sub-3",
        nextPaymentDate: "2025-01-25T00:00:00.000Z",
      }),
    ];
    const settings = createMockSettings();

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result.length).toBe(3);
    // Should be sorted by scheduledFor (earliest first)
    expect(result[0].subscriptionId).toBe("sub-2"); // Jan 15 - 3 = Jan 12
    expect(result[1].subscriptionId).toBe("sub-1"); // Jan 20 - 3 = Jan 17
    expect(result[2].subscriptionId).toBe("sub-3"); // Jan 25 - 3 = Jan 22
  });

  it("should handle imminent payment (< daysBefore remaining)", () => {
    // Payment in 2 days, but daysBefore is 3
    // mockNow is Jan 10 at 08:00 UTC, payment is Jan 12
    // Scheduled would be Jan 9 (past), so should adjust
    const subscriptions = [
      createMockSubscription({
        id: "imminent-1",
        nextPaymentDate: "2025-01-12T00:00:00.000Z", // 2 days from mockNow
      }),
    ];
    const settings = createMockSettings({ notificationDaysBefore: 3 });

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result.length).toBe(1);
    // Since scheduledFor would be Jan 9 (past), should adjust to today or now
    const scheduledDate = new Date(result[0].scheduledFor);
    // The adjusted time should be >= mockNow (not in the past)
    expect(scheduledDate.getTime()).toBeGreaterThanOrEqual(mockNow.getTime());
  });

  it("should include paymentDueAt in schedule entry", () => {
    const subscriptions = [
      createMockSubscription({
        nextPaymentDate: "2025-01-15T00:00:00.000Z",
      }),
    ];
    const settings = createMockSettings();

    const result = calculateNotificationSchedule(
      subscriptions,
      settings,
      mockNow
    );

    expect(result[0].paymentDueAt).toBe("2025-01-15T00:00:00.000Z");
  });

  it("should return empty array for empty subscriptions", () => {
    const settings = createMockSettings();

    const result = calculateNotificationSchedule([], settings, mockNow);

    expect(result).toEqual([]);
  });

  it("should handle different notificationDaysBefore values", () => {
    const subscriptions = [
      createMockSubscription({
        nextPaymentDate: "2025-01-20T00:00:00.000Z",
      }),
    ];

    // Test with 1 day before
    const settings1 = createMockSettings({ notificationDaysBefore: 1 });
    const result1 = calculateNotificationSchedule(
      subscriptions,
      settings1,
      mockNow
    );
    const date1 = new Date(result1[0].scheduledFor);
    expect(date1.getDate()).toBe(19); // 20 - 1 = 19

    // Test with 7 days before
    const settings7 = createMockSettings({ notificationDaysBefore: 7 });
    const result7 = calculateNotificationSchedule(
      subscriptions,
      settings7,
      mockNow
    );
    const date7 = new Date(result7[0].scheduledFor);
    expect(date7.getDate()).toBe(13); // 20 - 7 = 13
  });
});
