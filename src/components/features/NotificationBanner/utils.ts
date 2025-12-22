/**
 * NotificationBanner utility functions
 *
 * Story 4.2: Helpers for banner visibility logic
 */

import { NOTIFICATION_CONFIG } from "@/config/notifications";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const { BANNER_VISIBILITY_DAYS, IMMINENT_PAYMENT_DAYS } = NOTIFICATION_CONFIG;

/**
 * Helper to determine if banner should be shown based on settings and next payment
 */
export function shouldShowNotificationBanner(
  settings: {
    notificationPermission: string;
    notificationPermissionDeniedAt?: string;
    notificationBannerDismissedAt?: string;
  },
  nextPaymentDate?: string | Date
): boolean {
  // Not denied = no banner
  if (settings.notificationPermission !== "denied") {
    return false;
  }

  // Already dismissed = no banner
  if (settings.notificationBannerDismissedAt) {
    return false;
  }

  // Calculate days since denial
  const deniedAt = settings.notificationPermissionDeniedAt
    ? new Date(settings.notificationPermissionDeniedAt)
    : null;

  const now = new Date();

  // If we don't have denial timestamp, show banner (legacy denied state)
  if (!deniedAt) {
    return true;
  }

  const daysSinceDenial = (now.getTime() - deniedAt.getTime()) / MS_PER_DAY;

  // Within 7 days of denial: always show
  if (daysSinceDenial <= BANNER_VISIBILITY_DAYS) {
    return true;
  }

  // After 7 days: only show if payment is imminent
  if (nextPaymentDate) {
    const paymentDate =
      typeof nextPaymentDate === "string"
        ? new Date(nextPaymentDate)
        : nextPaymentDate;
    const daysUntilPayment =
      (paymentDate.getTime() - now.getTime()) / MS_PER_DAY;

    if (daysUntilPayment >= 0 && daysUntilPayment <= IMMINENT_PAYMENT_DAYS) {
      return true;
    }
  }

  return false;
}
