import { z } from "zod";

export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

// Notification-specific settings schema for partial updates
export const NotificationSettingsSchema = z.object({
  notificationsEnabled: z.boolean(),
  notificationDaysBefore: z.number().int().min(1).max(30),
  notificationTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

export const SettingsSchema = z.object({
  theme: ThemeSchema.default("system"),
  notificationPermission: z
    .enum(["default", "granted", "denied"])
    .default("default"),
  // Notification settings with defaults
  notificationsEnabled: z.boolean().default(true),
  notificationDaysBefore: z.number().int().min(1).max(30).default(3),
  notificationTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .default("09:00"),
  // Epic 4.8 forward compatibility: tracks last notification check for recovery
  lastNotificationCheck: z.string().datetime().optional(),
  // Story 4.2: Notification permission tracking
  notificationPermissionDeniedAt: z.string().datetime().optional(),
  notificationBannerDismissedAt: z.string().datetime().optional(),
  // Existing fields
  lastBackupDate: z.string().datetime().optional(),
  onboardingCompleted: z.boolean().default(false),
  lastIOSPromptDismissed: z.string().datetime().optional(),
  hasSeenNotificationPrompt: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;
