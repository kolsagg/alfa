/**
 * NotificationSettings Component
 *
 * Story 8.5: Enhanced notification settings with configurable reminder timing.
 * AC1: Enhanced section UI with days before, time, and preview
 * AC2: Days Before Select (1-30 days)
 * AC3: Notification Time Input (HH:MM format)
 * AC4: Conditional visibility based on notification state
 * AC5: Accessibility & design consistency with ThemeSelector
 * AC6: Real-time schedule sync and preview
 * AC7: Native UX with type="time" input
 */

import { useState, useCallback, useMemo, useId } from "react";
import { Clock, Calendar, Bell } from "lucide-react";
import { NotificationToggle } from "@/components/features/NotificationSettings/notification-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotificationScheduleStore } from "@/stores/notification-schedule-store";
import { isPushNotificationActive } from "@/lib/notification/utils";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

interface NotificationSettingsProps {
  /** Callback when iOS Safari detected - triggers iOS PWA modal */
  onIOSSafariDetected?: () => void;
}

// Generate days options array (1-30)
const DAYS_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);

// Time validation regex matching NotificationSettingsSchema
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function NotificationSettings({
  onIOSSafariDetected,
}: NotificationSettingsProps) {
  // Store state
  const {
    notificationsEnabled,
    notificationPermission,
    notificationDaysBefore,
    notificationTime,
    setNotificationDaysBefore,
    setNotificationTime,
  } = useSettingsStore();

  // Schedule store for preview
  const schedule = useNotificationScheduleStore((state) => state.schedule);

  // Local time input state for validation
  const [timeValue, setTimeValue] = useState(notificationTime);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Unique IDs for accessibility
  const daysSelectId = useId();
  const timeInputId = useId();

  // AC4: Conditional visibility - only show controls when notifications are effectively enabled
  const isEffectivelyEnabled = useMemo(
    () =>
      isPushNotificationActive(notificationsEnabled, notificationPermission),
    [notificationsEnabled, notificationPermission]
  );

  // AC6: Get next scheduled notification for preview
  const nextReminder = useMemo(() => {
    if (!schedule.length) return null;

    // Find earliest pending entry
    const pending = schedule
      .filter((entry) => !entry.notifiedAt)
      .sort(
        (a, b) =>
          new Date(a.scheduledFor).getTime() -
          new Date(b.scheduledFor).getTime()
      );

    return pending[0] || null;
  }, [schedule]);

  // Handle days change
  const handleDaysChange = useCallback(
    (value: string) => {
      const days = parseInt(value, 10);
      if (!isNaN(days)) {
        setNotificationDaysBefore(days);
      }
    },
    [setNotificationDaysBefore]
  );

  // Handle time input change with validation
  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTimeValue(value);

      // Validate format
      if (!value) {
        setTimeError(null);
        return;
      }

      if (TIME_REGEX.test(value)) {
        setTimeError(null);
        const success = setNotificationTime(value);
        if (!success) {
          setTimeError(SETTINGS_STRINGS.TIME_ERROR);
        }
      } else {
        setTimeError(SETTINGS_STRINGS.TIME_ERROR);
      }
    },
    [setNotificationTime]
  );

  // Format next reminder date for preview
  const previewText = useMemo(() => {
    if (!nextReminder) return null;

    const date = new Date(nextReminder.scheduledFor);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, [nextReminder]);

  return (
    <div className="space-y-4">
      {/* Main Toggle - existing NotificationToggle */}
      <NotificationToggle onIOSSafariDetected={onIOSSafariDetected} />

      {/* AC4: Conditional controls - only show when effectively enabled */}
      {isEffectivelyEnabled && (
        <div
          className={cn(
            "mt-6 space-y-5 pt-5 border-t",
            // AC4: Smooth fade-in animation
            "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          )}
        >
          {/* Subtitle */}
          <p className="text-sm font-medium text-muted-foreground">
            {SETTINGS_STRINGS.SECTION_NOTIFICATIONS_SUBTITLE}
          </p>

          {/* AC2: Days Before Select */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Label htmlFor={daysSelectId} className="text-sm font-medium">
                {SETTINGS_STRINGS.DAYS_BEFORE_LABEL}
              </Label>
            </div>
            <p
              className="text-xs text-muted-foreground ml-6"
              id={`${daysSelectId}-desc`}
            >
              {SETTINGS_STRINGS.DAYS_BEFORE_HELPER}
            </p>
            <Select
              value={notificationDaysBefore.toString()}
              onValueChange={handleDaysChange}
            >
              <SelectTrigger
                id={daysSelectId}
                className={cn(
                  "w-full ml-6", // Removed w-fit conflict by keeping w-full as intended for mobile-first layout
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "motion-reduce:transition-none"
                )}
                aria-describedby={`${daysSelectId}-desc`}
              >
                <SelectValue placeholder="Gün seçin" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OPTIONS.map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day} {SETTINGS_STRINGS.DAYS_BEFORE_UNIT}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AC3: Notification Time Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Label htmlFor={timeInputId} className="text-sm font-medium">
                {SETTINGS_STRINGS.TIME_LABEL}
              </Label>
            </div>
            <p
              className="text-xs text-muted-foreground ml-6"
              id={`${timeInputId}-desc`}
            >
              {SETTINGS_STRINGS.TIME_HELPER}
            </p>
            <Input
              id={timeInputId}
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className={cn(
                "w-full ml-6",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "motion-reduce:transition-none",
                timeError && "border-destructive focus-visible:ring-destructive"
              )}
              aria-describedby={
                timeError ? `${timeInputId}-error` : `${timeInputId}-desc`
              }
              aria-invalid={!!timeError}
            />
            {/* Inline error feedback */}
            {timeError && (
              <p
                id={`${timeInputId}-error`}
                className="text-xs text-destructive ml-6"
                role="alert"
              >
                {timeError}
              </p>
            )}
          </div>

          {/* AC6: Reminder Preview */}
          {previewText && (
            <div
              className={cn(
                "flex items-center gap-2 ml-6",
                "text-xs font-medium text-primary bg-primary/5 p-2 rounded-md",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
              )}
            >
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {SETTINGS_STRINGS.PREVIEW_LABEL} <strong>{previewText}</strong>
              </span>
            </div>
          )}

          {/* No upcoming reminder message */}
          {!previewText && (
            <p className="text-xs text-muted-foreground ml-6 italic">
              {SETTINGS_STRINGS.NO_UPCOMING_REMINDER}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
