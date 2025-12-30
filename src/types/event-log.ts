/**
 * Event Logging Types and Schemas
 *
 * Story 7.1: Anonymous Event Logging System
 * - Privacy-first event logging for debugging
 * - Session-based anonymous tracking
 * - Automated PII scrubbing
 */
import { z } from "zod";

// App version - should be updated on releases
export const APP_VERSION = "1.0.0";
export const SCHEMA_VERSION = 1;

/**
 * Event Types - All tracked events in the application
 * AC3: Required event types coverage
 */
export const EventTypeSchema = z.enum([
  "subscription_added",
  "subscription_updated",
  "subscription_deleted",
  "notification_shown",
  "notification_denied",
  "export_triggered",
  "import_triggered",
  "card_added",
  "card_deleted",
  "theme_changed",
  "app_opened",
  "audit_shown",
  "audit_answered",
  "error_caught", // Story 7.3: Error boundary caught errors
  "onboarding_completed", // Story 9.1: User completed onboarding
  "onboarding_skipped", // Story 9.1: User skipped onboarding
  "onboarding_step_viewed", // Story 9.2: Track slide views for funnel analysis
]);

export type EventType = z.infer<typeof EventTypeSchema>;

/**
 * App Metadata - Included in every event
 * AC1: Every event includes app_metadata
 */
export const AppMetadataSchema = z.object({
  version: z.string(),
  schema_version: z.number(),
});

export type AppMetadata = z.infer<typeof AppMetadataSchema>;

/**
 * Event Log Entry - Full event structure
 * AC1: Structured format with session_id, timestamp, app_metadata
 */
export const EventLogEntrySchema = z.object({
  type: EventTypeSchema,
  timestamp: z.string().datetime(),
  session_id: z.string().uuid(),
  app_metadata: AppMetadataSchema,
  metadata: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
      ])
    )
    .optional(),
});

export type EventLogEntry = z.infer<typeof EventLogEntrySchema>;

/**
 * Event Log Storage - Array of entries
 */
export const EventLogStorageSchema = z.array(EventLogEntrySchema).max(1000);

export type EventLogStorage = z.infer<typeof EventLogStorageSchema>;
