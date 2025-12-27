/**
 * Wallet Page Localization Strings
 *
 * Story 8.8: Centralized i18n constants for Wallet page.
 * Story 6.2: Card Management UI (Add/Edit/Delete)
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

  // Card Management - Buttons (Story 6.2)
  ADD_CARD: "Kart Ekle", // "Add Card"
  ADD_FIRST_CARD: "İlk Kartınızı Ekleyin", // "Add Your First Card"
  EDIT_CARD: "Kartı Düzenle", // "Edit Card"
  DELETE_CARD: "Kartı Sil", // "Delete Card"
  SAVE_CARD: "Kaydet", // "Save"
  CANCEL: "İptal", // "Cancel"

  // Card Form - Labels (Story 6.2)
  CARD_NAME_LABEL: "Kart Adı", // "Card Name"
  CARD_NAME_PLACEHOLDER: "Örn: Ana Kart", // "E.g.: Main Card"
  LAST_FOUR_LABEL: "Son 4 Hane", // "Last 4 Digits"
  LAST_FOUR_PLACEHOLDER: "1234", // "1234"
  CUTOFF_DATE_LABEL: "Ekstre Kesim Tarihi", // "Cut-off Date"
  CUTOFF_DATE_PLACEHOLDER: "1-31 arası bir gün", // "A day between 1-31"
  COLOR_LABEL: "Kart Rengi", // "Card Color"

  // Privacy Note (NFR06)
  PRIVACY_NOTE: "Sadece son 4 hane saklanır", // "Only last 4 digits stored"

  // Delete Confirmation Dialog (Story 6.2)
  DELETE_CONFIRM_TITLE: "Kartı silmek istiyor musunuz?", // "Do you want to delete this card?"
  DELETE_CONFIRM_DESC:
    "Bu işlem geri alınamaz. Kart kalıcı olarak silinecektir.", // "This action cannot be undone. The card will be permanently deleted."

  // Toast Messages (Story 6.2)
  TOAST_ADD_SUCCESS: "Kart başarıyla eklendi", // "Card added successfully"
  TOAST_UPDATE_SUCCESS: "Kart başarıyla güncellendi", // "Card updated successfully"
  TOAST_DELETE_SUCCESS: "Kart silindi", // "Card deleted"

  // Validation Errors (Story 6.2)
  ERROR_NAME_REQUIRED: "Kart adı zorunludur", // "Card name is required"
  ERROR_NAME_MAX: "Kart adı en fazla 50 karakter olabilir", // "Card name can be max 50 characters"
  ERROR_LAST_FOUR_REQUIRED: "Son 4 hane zorunludur", // "Last 4 digits required"
  ERROR_LAST_FOUR_FORMAT: "Tam 4 rakam girilmelidir", // "Must be exactly 4 digits"
  ERROR_CUTOFF_REQUIRED: "Ekstre kesim tarihi zorunludur", // "Cut-off date required"
  ERROR_CUTOFF_RANGE: "1-31 arasında bir gün olmalıdır", // "Must be between 1-31"

  // Card Type (Story 6.2b)
  CARD_TYPE_LABEL: "Kart Türü", // "Card Type"
  CARD_TYPE_CREDIT: "Kredi Kartı", // "Credit Card"
  CARD_TYPE_DEBIT: "Banka Kartı", // "Debit Card"

  // Bank Name (Story 6.2b)
  BANK_NAME_LABEL: "Banka Adı", // "Bank Name"
  BANK_NAME_PLACEHOLDER: "Örn: Garanti", // "E.g.: Garanti"

  // Card Badges (Story 6.2b)
  CARD_BADGE_CREDIT: "Kredi", // "Credit"
  CARD_BADGE_DEBIT: "Banka", // "Debit"

  // Per-Card Spending Display (Story 6.4)
  MONTHLY_SPENDING_LABEL: "Aylık Harcama", // "Monthly Spending"
  NO_SUBSCRIPTIONS: "Abonelik yok", // "No subscriptions"
  CUTOFF_DAY: "Kesim günü", // "Cut-off day"
  UNASSIGNED_TITLE: "Kartsız Abonelikler", // "Unassigned Subscriptions"
  UNASSIGNED_DESCRIPTION: "Bu abonelikler henüz bir karta atanmadı", // "These subscriptions are not assigned to any card"
  VIEW_DETAILS: "Detayları Gör", // "View Details"
  SPENDING_MIXED_CURRENCY: "+", // Separator for mixed currencies "₺1.200 + $40"

  // Statement Display (Story 6.5)
  THIS_STATEMENT: "Bu Ekstre", // "This Statement"
  NEXT_STATEMENT: "Sonraki Ekstre", // "Next Statement"
  DAYS_REMAINING: "gün kaldı", // "days remaining"
  ACTUAL_BILL: "Ekstre Tutarı", // "Statement Amount" / "Actual Bill"
  NORMALIZED_LOAD: "Aylık Ortalama", // "Monthly Average" - Normalized view
  STATEMENT_PROGRESS: "Ekstre Dönemi", // "Statement Period"
} as const;

export type WalletStrings = typeof WALLET_STRINGS;
