/**
 * Notification Localization Strings
 *
 * Story 4.7: Centralized i18n constants for notification components.
 * Primary language: Turkish (TR)
 * Comments contain English translations for future i18n support.
 */

export const NOTIFICATION_STRINGS = {
  // NotificationBanner (AC1)
  BANNER_DENIED: "Bildirimler kapalı — Tarayıcı ayarlarından açabilirsiniz.", // "Notifications off — You can enable them in browser settings."
  BANNER_DISMISS_ARIA: "Bir daha gösterme", // "Don't show again"

  // CountdownHero Alert Badge (AC4)
  HERO_NO_PUSH: "Push Yok", // "No Push"
  HERO_ALERT_TITLE: "Bildirimler kapalı - Buradan takip edin", // "Notifications off - Track from here"

  // ImminentPaymentsBadge (AC5)
  BADGE_IMMINENT_SINGULAR: "{{count}} ödeme yaklaşıyor", // "{{count}} payment approaching"
  BADGE_IMMINENT_PLURAL: "{{count}} ödeme yaklaşıyor", // "{{count}} payments approaching"
  BADGE_ARIA_LABEL: "Yaklaşan ödemeler: {{count}}", // "Approaching payments: {{count}}"

  // NotificationSettings (AC6)
  SETTINGS_UNSUPPORTED: "Bu tarayıcı bildirimleri desteklemiyor.", // "This browser does not support notifications."
  SETTINGS_DENIED: "Tarayıcı ayarlarından izin verin.", // "Grant permission from browser settings."
  SETTINGS_ACTIVE: "Bildirimler aktif", // "Notifications active"
  SETTINGS_GRANTED: "İzin verildi", // "Permission granted"

  // Missed Notifications Recovery (Story 4.8)
  MISSED_NOTIFICATIONS_TOAST: "{{count}} ödeme hatırlatmasını kaçırdınız", // "You missed {{count}} payment reminders"
  MISSED_NOTIFICATIONS_ACTION: "Görüntüle", // "View"
} as const;

// Type export for strict type checking
export type NotificationStrings = typeof NOTIFICATION_STRINGS;

/**
 * Helper to format badge count with localized string
 */
export function formatImminentBadgeLabel(count: number): string {
  return NOTIFICATION_STRINGS.BADGE_ARIA_LABEL.replace(
    "{{count}}",
    count.toString()
  );
}
