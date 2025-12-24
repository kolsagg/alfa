/**
 * Settings & Theme Localization Strings
 *
 * Story 8.4: Centralized i18n constants for settings components.
 * Primary language: Turkish (TR)
 */

export const SETTINGS_STRINGS = {
  // ThemeSelector (AC1, AC3)
  THEME_LABEL_LIGHT: "Açık", // "Light"
  THEME_LABEL_DARK: "Koyu", // "Dark"
  THEME_LABEL_SYSTEM: "Sistem", // "System"
  THEME_ARIA_LABEL: "Tema seçimi", // "Theme selection"
  THEME_SYSTEM_INDICATOR: "Şu anki sistem tercihi:", // "Current system preference:"

  // SettingsPage (AC3)
  PAGE_TITLE: "Ayarlar", // "Settings"
  SECTION_THEME_TITLE: "Görünüm", // "Appearance"
  SECTION_THEME_DESC: "Uygulama temasını özelleştirin", // "Customize application theme"
  SECTION_THEME_SUBTITLE: "Tema", // "Theme"
  SECTION_THEME_HELPER: "Açık, koyu veya sistem tercihine göre temayı seçin", // "Choose theme based on light, dark or system preference"

  SECTION_NOTIFICATIONS_TITLE: "Bildirimler", // "Notifications"
  SECTION_NOTIFICATIONS_DESC: "Ödeme hatırlatıcılarınızı yönetin", // "Manage your payment reminders"
  // Story 8.5: Notification Section Expansion
  SECTION_NOTIFICATIONS_SUBTITLE: "Hatırlatma Ayarları", // "Reminder Settings"
  DAYS_BEFORE_LABEL: "Kaç gün önce hatırlat", // "How many days before to remind"
  DAYS_BEFORE_HELPER: "Ödeme tarihinden önce kaç gün bildirim al", // "How many days before payment date to receive notification"
  DAYS_BEFORE_UNIT: "gün", // "day(s)"
  TIME_LABEL: "Bildirim saati", // "Notification time"
  TIME_HELPER: "Bildirimlerin gönderileceği saat (24h)", // "Time notifications will be sent (24h)"
  TIME_ERROR: "Geçersiz saat formatı (ÖRN: 09:00)", // "Invalid time format (e.g., 09:00)"
  PREVIEW_LABEL: "Bir sonraki hatırlatıcı:", // "Next reminder:"
  NO_UPCOMING_REMINDER: "Planlı hatırlatıcı yok", // "No scheduled reminder"

  SECTION_DATA_TITLE: "Veri Yönetimi", // "Data Management"
  SECTION_DATA_DESC: "Verilerinizi yedekleyin ve geri yükleyin", // "Backup and restore your data"
  SECTION_DATA_COMING_SOON: "Yakında: Veri dışa/içe aktarma", // "Coming soon: Data export/import"

  SECTION_ABOUT_TITLE: "Hakkında", // "About"
  SECTION_ABOUT_DESC: "Uygulama bilgileri ve gizlilik", // "App info and privacy"
  VERSION: "Versiyon", // "Version"
  DATA_STORAGE: "Veri Depolama", // "Data Storage"
  LOCAL_ONLY: "Yalnızca Yerel (localStorage)", // "Local Only (localStorage)"
  PRIVACY_STATEMENT:
    "SubTracker tüm verilerinizi cihazınızda saklar. Hiçbir veri sunucuya gönderilmez. Gizliliğinize saygı duyuyoruz.", // "SubTracker stores all your data on your device. No data is sent to the server. We respect your privacy."
} as const;

export type SettingsStrings = typeof SETTINGS_STRINGS;
