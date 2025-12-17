import { z } from "zod";

export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const SettingsSchema = z.object({
  theme: ThemeSchema.default("system"),
  notificationPermission: z
    .enum(["default", "granted", "denied"])
    .default("default"),
  notificationDaysBefore: z.number().int().min(1).max(30).default(3),
  notificationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default("09:00"),
  lastBackupDate: z.string().datetime().optional(),
  onboardingCompleted: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;
