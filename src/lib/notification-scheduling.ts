/**
 * Notification Scheduling Utilities
 *
 * Pure functions for calculating notification schedules.
 * Story 4.3 - Notification Scheduling Logic
 *
 * IMPORTANT: This module only CALCULATES schedules.
 * Actual notification dispatch is handled by Story 4.4.
 *
 * FOREGROUND-ONLY CONSTRAINT:
 * This is a pure client-side PWA. Notifications only fire when the
 * app/PWA tab is open or in background (browser-dependent).
 * No server-push capabilities.
 */

import { subDays, set, isBefore, startOfDay, isAfter } from "date-fns";
import type { Subscription } from "@/types/subscription";
import type { NotificationScheduleEntry } from "@/types/notification-schedule";

/**
 * Settings required for schedule calculation
 */
export interface ScheduleSettings {
  notificationsEnabled: boolean;
  notificationPermission: "default" | "granted" | "denied";
  notificationDaysBefore: number;
  notificationTime: string; // HH:mm format
}

/**
 * Calculate the scheduled notification time for a payment.
 *
 * Uses date-fns `set()` which respects local timezone,
 * ensuring DST transitions don't shift the notification time.
 *
 * @param nextPaymentDate - ISO date string of the payment
 * @param daysBefore - How many days before payment to notify
 * @param notifyTime - Time of day to notify (HH:mm format)
 * @returns Date object representing when notification should fire
 */
export function calculateScheduledTime(
  nextPaymentDate: string,
  daysBefore: number,
  notifyTime: string
): Date {
  const [hours, minutes] = (notifyTime.includes(":") ? notifyTime : "09:00")
    .split(":")
    .map(Number);

  // Extract YYYY-MM-DD to treat it as local date, avoiding UTC shifts
  // This prevents "off-by-one" errors in Western timezones
  const datePart = nextPaymentDate.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);

  // Create date at local midnight
  const paymentDate = new Date(year, month - 1, day);

  const notifyDate = subDays(paymentDate, daysBefore);

  return set(notifyDate, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });
}

/**
 * Handle imminent payments where the scheduled time has already passed.
 *
 * If payment is within daysBefore but scheduledFor has passed:
 * - If today's notifyTime hasn't passed yet, schedule for today at that time
 * - Otherwise, return current time (immediate notification on next check)
 *
 * @param originalScheduledFor - The calculated scheduled time
 * @param notifyTime - User's preferred notification time (HH:mm)
 * @param now - Current time (injectable for testing)
 * @returns Adjusted scheduled time
 */
export function handleImminentPayment(
  originalScheduledFor: Date,
  notifyTime: string,
  now: Date = new Date()
): Date {
  // If scheduled time is in the future, no adjustment needed
  if (isAfter(originalScheduledFor, now)) {
    return originalScheduledFor;
  }

  // Scheduled time has passed - check if we can still notify today
  const [hours, minutes] = notifyTime.split(":").map(Number);
  const todayAtNotifyTime = set(now, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });

  // If today's notify time hasn't passed, use it
  if (isAfter(todayAtNotifyTime, now)) {
    return todayAtNotifyTime;
  }

  // Both original and today's time have passed - schedule for immediate
  // Story 4.4 will handle showing notification on next check
  return now;
}

/**
 * Calculate notification schedule for all eligible subscriptions.
 *
 * Preconditions checked:
 * - notificationsEnabled must be true
 * - notificationPermission must be "granted"
 *
 * Subscription filters:
 * - Only active subscriptions (isActive === true)
 * - Only future payment dates
 *
 * @param subscriptions - All subscriptions from store
 * @param settings - Notification settings from store
 * @param now - Current time (injectable for testing)
 * @returns Array of scheduled notification entries
 */
export function calculateNotificationSchedule(
  subscriptions: Subscription[],
  settings: ScheduleSettings,
  now: Date = new Date()
): NotificationScheduleEntry[] {
  // Check preconditions
  if (!settings.notificationsEnabled) {
    return [];
  }

  if (settings.notificationPermission !== "granted") {
    return [];
  }

  const today = startOfDay(now);
  const schedule: NotificationScheduleEntry[] = [];

  for (const subscription of subscriptions) {
    // Filter: only active subscriptions
    if (!subscription.isActive) {
      continue;
    }

    const paymentDate = new Date(subscription.nextPaymentDate);

    // Filter: only future payments (including today)
    if (isBefore(paymentDate, today)) {
      continue;
    }

    // Calculate scheduled notification time
    const scheduledFor = calculateScheduledTime(
      subscription.nextPaymentDate,
      settings.notificationDaysBefore,
      settings.notificationTime
    );

    // Handle imminent payments where scheduled time has passed
    const adjustedScheduledFor = handleImminentPayment(
      scheduledFor,
      settings.notificationTime,
      now
    );

    schedule.push({
      subscriptionId: subscription.id,
      scheduledFor: adjustedScheduledFor.toISOString(),
      paymentDueAt: subscription.nextPaymentDate,
    });
  }

  // Sort by scheduledFor ascending (earliest first)
  schedule.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  return schedule;
}
