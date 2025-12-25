/**
 * Wallet Page Localization Strings
 *
 * Story 8.8: Centralized i18n constants for Wallet page.
 * Primary language: Turkish (TR)
 */

export const WALLET_STRINGS = {
  // Page header (AC1, AC3)
  WALLET_TITLE: "Cüzdan", // "Wallet"
  WALLET_DESCRIPTION: "Kartlarınızı ve ödeme yöntemlerinizi yönetin", // "Manage your cards and payment methods"

  // Empty state (AC2, AC3)
  EMPTY_TITLE: "Henüz kart eklenmedi", // "No cards added yet"
  EMPTY_DESCRIPTION:
    "Kart ekleyerek aboneliklerinizi hangi karttan ödediğinizi takip edin ve kart bazlı harcama özetlerinizi görün.", // "Add cards to track which card pays for your subscriptions and see per-card spending summaries."

  // Coming Soon badge (AC2)
  COMING_SOON_BADGE: "Yakında", // "Coming Soon"
} as const;

export type WalletStrings = typeof WALLET_STRINGS;
