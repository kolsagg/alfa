/**
 * Subscription-related Localization Strings
 *
 * Story 6.3: Card Assignment to Subscriptions
 * Primary language: Turkish (TR)
 */

export const SUBSCRIPTION_STRINGS = {
  // Card Select (AC1, AC5)
  CARD_SELECT_LABEL: "Ödeme Kartı", // "Payment Card"
  CARD_SELECT_PLACEHOLDER: "Kart seçilmedi", // "No card selected"
  NO_CARDS_AVAILABLE: "Henüz kart yok", // "No cards yet"
  NO_CARD_ASSIGNED: "Kart atanmamış", // "No card assigned"
  GO_TO_WALLET: "Cüzdana Git", // "Go to Wallet"

  // Unsaved changes warning (AC5)
  UNSAVED_CHANGES_TITLE: "Kaydedilmemiş Değişiklikler", // "Unsaved Changes"
  UNSAVED_CHANGES_DESC:
    "Formdaki değişiklikler kaybolacak. Devam etmek istiyor musunuz?", // "Changes in the form will be lost. Do you want to continue?"
  UNSAVED_CHANGES_CONTINUE: "Devam Et", // "Continue"
  UNSAVED_CHANGES_CANCEL: "Vazgeç", // "Cancel"
} as const;

export type SubscriptionStrings = typeof SUBSCRIPTION_STRINGS;
