/**
 * Notification Schedule Types
 *
 * Defines the schema and types for notification scheduling.
 * This is the data layer for Story 4.3 - Notification Scheduling Logic.
 *
 * IMPORTANT: This handles SCHEDULE data only.
 * Actual notification dispatch is handled by Story 4.4.
 */

import { z } from "zod";

/**
 * Single scheduled notification entry.
 *
 * @property subscriptionId - UUID of the subscription this notification is for
 * @property scheduledFor - ISO datetime when notification should fire
 * @property paymentDueAt - ISO datetime of the actual payment (for context/recovery)
 * @property notifiedAt - ISO datetime when notification was actually shown (undefined if pending)
 */
export const NotificationScheduleEntrySchema = z.object({
  subscriptionId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  paymentDueAt: z.string().datetime(),
  notifiedAt: z.string().datetime().optional(),
});

/**
 * Full notification schedule - array of entries
 */
export const NotificationScheduleSchema = z.array(
  NotificationScheduleEntrySchema
);

// Type exports using z.infer
export type NotificationScheduleEntry = z.infer<
  typeof NotificationScheduleEntrySchema
>;
export type NotificationSchedule = z.infer<typeof NotificationScheduleSchema>;
