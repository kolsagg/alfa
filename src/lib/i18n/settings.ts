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
  // Story 8.6: Data Section Strings
  EXPORT_BUTTON: "Dışa Aktar", // "Export"
  IMPORT_BUTTON: "İçe Aktar", // "Import"
  LAST_BACKUP_LABEL: "Son yedek:", // "Last backup:"
  LAST_BACKUP_NEVER: "Henüz yedeklenmedi", // "Never backed up"
  // Export feedback
  EXPORT_SUCCESS: "Yedekleme başarılı", // "Backup successful"
  EXPORT_SIZE_WARNING:
    "Yedek dosyası 5MB'ı aşıyor. Büyük bir veri setiniz var.", // "Backup file exceeds 5MB..."
  EXPORT_ERROR: "Yedekleme başarısız", // "Backup failed"
  // Import confirmation dialog (Danger Zone)
  CONFIRM_TITLE: "Tehlike Bölgesi", // "Danger Zone"
  CONFIRM_MESSAGE: "Bu işlem mevcut verilerinizin üzerine yazacaktır.", // "This will overwrite your current data."
  CONFIRM_BACKUP_FIRST: "Verileri değiştirmeden önce otomatik yedek al", // "Auto-backup before import"
  CONFIRM_SUBSCRIPTION_COUNT: "abone içeriyor", // "contains subscriptions"
  CONFIRM_MOST_RECENT: "En son eklenen:", // "Most recently added:"
  CONFIRM_CANCEL: "İptal", // "Cancel"
  CONFIRM_PROCEED: "Verileri Değiştir", // "Replace Data"
  // Import validation errors
  VERSION_MISMATCH_ERROR:
    "Görünen o ki daha yeni bir uygulama versiyonundan yedek yüklemeye çalışıyorsunuz.", // "Trying to load backup from newer version"
  EMPTY_BACKUP_ERROR: "Yedek dosyası boş veya geçersiz", // "Backup file is empty or invalid"
  INVALID_FILE_ERROR: "Geçersiz dosya formatı", // "Invalid file format"
  IMPORT_SUCCESS: "Veriler başarıyla yüklendi", // "Data imported successfully"
  IMPORT_ERROR: "Veri yükleme başarısız", // "Import failed"
  // Processing states
  PROCESSING: "İşleniyor...", // "Processing..."

  SECTION_ABOUT_TITLE: "Hakkında", // "About"
  SECTION_ABOUT_DESC: "Uygulama bilgileri ve gizlilik", // "App info and privacy"
  VERSION: "Versiyon", // "Version"
  DATA_STORAGE: "Veri Depolama", // "Data Storage"
  LOCAL_ONLY: "Yalnızca Yerel (localStorage)", // "Local Only (localStorage)"
  PRIVACY_STATEMENT:
    "SubTracker tüm verilerinizi cihazınızda saklar. Hiçbir veri sunucuya gönderilmez. Gizliliğinize saygı duyuyoruz.", // "SubTracker stores all your data on your device. No data is sent to the server. We respect your privacy."

  // Story 8.7: About Section Enhanced Strings
  APP_NAME: "SubTracker", // App identity
  TAGLINE: "Abonelik Takip Uygulaması", // "Subscription Tracking App"
  STORAGE_USAGE_LABEL: "Kullanılan Alan", // "Storage Used"
  PRIVACY_TITLE: "Gizlilik", // "Privacy"
  NO_TRACKING_STATEMENT: "Verileriniz asla sunucuya gönderilmez", // "Your data is never sent to the server"
  NO_THIRD_PARTY: "Üçüncü taraf izleme scripti kullanılmamaktadır", // "No third-party tracking script included"
  COPYRIGHT: "© 2025 SubTracker. Tüm hakları saklıdır.", // Copyright footer
  PWA_MODE: "Uygulama", // "App" - PWA standalone mode
  BROWSER_MODE: "Tarayıcı", // "Browser" - web mode
  PLATFORM_LABEL: "Platform", // "Platform"

  // Story 5.4: Backup Reminder Banner Strings
  BACKUP_REMINDER_TITLE: "Yedekleme Hatırlatıcısı", // "Backup Reminder"
  BACKUP_REMINDER_DESCRIPTION: "Son yedeğinizin üzerinden 7 gün geçti", // "It's been 7 days since your last backup"
  BACKUP_NOW_BUTTON: "Şimdi Yedekle", // "Backup Now"
  REMIND_LATER_BUTTON: "Daha Sonra Hatırlat", // "Remind Me Later"
  DONT_REMIND_BUTTON: "Bir Daha Gösterme", // "Don't remind me again"
  BACKUP_SUCCESS_TOAST: "Yedek başarıyla oluşturuldu", // "Backup created successfully"
  FIRST_BACKUP_SUGGESTION: "Verilerinizi yedeklemeyi düşünün", // "Consider backing up your data"
  BACKUP_REMINDERS_TOGGLE: "Yedek Hatırlatıcıları", // "Backup Reminders"
  BACKUP_REMINDERS_HELPER: "Düzenli yedekleme hatırlatıcıları al", // "Get regular backup reminders"

  // Story 5.5: Storage Limit Warnings
  STORAGE_WARNING_TITLE: "Depolama Alanı Uyarısı", // "Storage Warning"
  STORAGE_WARNING_CRITICAL_TITLE: "Depolama Alanı Dolu", // "Storage Full"
  STORAGE_WARNING_DESCRIPTION:
    "Depolama alanı %80 doluluk oranına ulaştı ({used} / {total}).", // "Storage usage reached 80%..."
  STORAGE_FULL_DESCRIPTION:
    "Depolama alanı tamamen doldu. Yeni veri kaydedilemiyor. Lütfen gereksiz verileri silin.",
  RECORD_COUNT_WARNING_TITLE: "Yüksek Kayıt Sayısı", // "High Record Count"
  RECORD_COUNT_WARNING_DESCRIPTION:
    "{count} kayıt var. Performans için yedek alıp geçmiş verileri temizlemeyi düşünün.", // AC1: Accurate count with placeholder
  MANAGE_DATA_BUTTON: "Verileri Yönet", // "Manage Data"

  // Story 7.2: Privacy-First Data Handling (AC5)
  PRIVACY_BADGE_TEXT: "Veri cihazınızda kalır", // "Data stays on your device"
  PRIVACY_BADGE_TOOLTIP:
    "SubTracker tüm verilerinizi yalnızca bu cihazda saklar. Hiçbir veri dışarı gönderilmez.", // "SubTracker stores all data only on this device..."
  PRIVACY_GUARANTEE_TITLE: "Gizlilik Öncelikli Garanti", // "Privacy-First Guarantee"
  PRIVACY_GUARANTEE_DESC:
    "Verileriniz asla sunucuya gönderilmez ve üçüncü taraf izleme araçları kullanılmaz.", // "Your data is never sent to servers..."

  // Story 7.3: Developer Options
  DEVELOPER_OPTIONS_TITLE: "Geliştirici Seçenekleri", // "Developer Options"
  EXPORT_DEBUG_LOGS: "Debug Loglarını Dışa Aktar", // "Export Debug Logs"
  CLEAR_LOGS: "Logları Temizle", // "Clear Logs"
  CLEAR_LOGS_CONFIRM: "Tüm debug loglarını silmek istediğinize emin misiniz?", // "Are you sure you want to delete all debug logs?"
  LOG_COUNT: "{count} log kaydı", // "{count} log entries"
  ESTIMATED_SIZE: "Tahmini boyut: {size}", // "Estimated size: {size}"
  SIZE_WARNING: "Dosya boyutu 1MB'dan büyük", // "File size exceeds 1MB"
  DEBUG_PRIVACY_BANNER:
    "Bu dosya kişisel veri içermez - sadece anonim debug bilgisi", // "This file contains no personal data - only anonymous debug info"
  DEV_MODE_ENABLED: "Geliştirici modu aktif", // "Developer mode enabled"
  DEV_MODE_DISABLED: "Geliştirici modu devre dışı", // "Developer mode disabled"
  DEV_MODE_BADGE: "🛠️", // Developer mode badge icon
  CHECKSUM_LABEL: "SHA-256:", // Checksum label
  MINIFY_EXPORT: "Küçült (Minify)", // "Minify"
  EXPORT_PREVIEW_TITLE: "Debug Export Önizleme", // "Debug Export Preview"
  EXPORT_DOWNLOAD: "İndir", // "Download"
  EXPORT_CLOSE: "Kapat", // "Close"
  TOGGLE_DEV_MODE: "Geliştirici Modu", // "Developer Mode"
} as const;

export type SettingsStrings = typeof SETTINGS_STRINGS;
