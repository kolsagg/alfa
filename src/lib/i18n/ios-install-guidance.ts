/**
 * iOS Install Guidance Localization Strings
 *
 * Story 4.6: Centralized i18n constants for IOSInstallGuidance component.
 * Primary language: Turkish (TR)
 * Comments contain English translations for future i18n support.
 */

export const IOS_INSTALL_GUIDANCE_STRINGS = {
  // Modal Titles
  TITLE_SETTINGS: "Bildirimler için Ana Ekrana Ekle", // "Add to Home Screen for Notifications"
  TITLE_AUTOMATIC: "Ana Ekrana Ekle", // "Add to Home Screen"

  // Modal Descriptions
  DESCRIPTION_SETTINGS:
    "iOS'ta bildirim almak için SubTracker'ı ana ekranınıza eklemeniz gerekiyor.", // "To receive notifications on iOS, you need to add SubTracker to your home screen."
  DESCRIPTION_AUTOMATIC:
    "SubTracker'ı tam ekran modunda kullanmak ve bildirimlerden haberdar olmak için ana ekranınıza ekleyin.", // "Add SubTracker to your home screen to use it in fullscreen mode and stay informed about notifications."

  // Step Instructions
  STEP_1_TITLE: "1. Paylaş Simgesi", // "1. Share Icon"
  STEP_1_DESCRIPTION:
    "Tarayıcınızın alt kısmındaki yukarı oklu kutucuğa dokunun.", // "Tap the share icon at the bottom of your browser."
  STEP_1_OVERLAY: "Safari'de 'Paylaş' simgesine dokunun", // "Tap the 'Share' icon in Safari"

  STEP_2_TITLE: "2. Ana Ekrana Ekle", // "2. Add to Home Screen"
  STEP_2_DESCRIPTION:
    'Açılan menüde aşağı kaydırıp "Ana Ekrana Ekle" butonunu bulun.', // 'Scroll down in the menu and find "Add to Home Screen" button.'
  STEP_2_OVERLAY: "'Ana Ekrana Ekle' seçeneğini seçin", // "Select 'Add to Home Screen'"

  // Buttons
  BUTTON_UNDERSTOOD: "Anladım", // "Got it"
  BUTTON_INSTALLED: "Kurdum", // "I've Installed It"
  BUTTON_LATER: "Sonra", // "Later"
  BUTTON_CHECKING: "Kontrol ediliyor...", // "Checking..."
  BUTTON_CLOSE_ARIA: "Kapat", // "Close"

  // Screenshot Alt
  GUIDANCE_IMAGE_ALT: "iOS Kurulum Rehberi", // "iOS Installation Guide"

  // Toast Messages
  TOAST_INSTALL_SUCCESS: "Harika! SubTracker ana ekranınıza eklendi. 🎉", // "Great! SubTracker has been added to your home screen. 🎉"
  TOAST_INSTALL_PENDING:
    "Henüz PWA modunda değilsiniz. Lütfen adımları takip edin.", // "You're not in PWA mode yet. Please follow the steps."
} as const;

// Type export for strict type checking
export type IOSInstallGuidanceStrings = typeof IOS_INSTALL_GUIDANCE_STRINGS;
