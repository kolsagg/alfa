/**
 * Onboarding Localization Strings
 *
 * Story 9.1: AC6 - i18n Integration
 * Story 9.2: AC2 - Slide content with Turkish copy
 * Primary language: Turkish (TR)
 *
 * Keys for onboarding carousel UI elements and slide content.
 */

export const ONBOARDING_STRINGS = {
  // Navigation buttons (AC6)
  SKIP_BUTTON: "Atla", // "Skip"
  NEXT_BUTTON: "İleri", // "Next"
  START_BUTTON: "Başlayalım!", // "Let's Start!"

  // Accessibility (AC5, AC6)
  STEP_INDICATOR: "Adım {current}/{total}", // "Step 1/3"
  STEP_INDICATOR_ARIA: "Adım {current} / {total}", // For screen readers

  // Navigation hints (AC5)
  PREV_STEP: "Önceki adım", // "Previous step"
  NEXT_STEP: "Sonraki adım", // "Next step"
  GO_TO_STEP: "Adım {step}'e git", // "Go to step X"

  // Carousel ARIA labels (AC5)
  CAROUSEL_LABEL: "Tanıtım slaytları", // "Introduction slides"
  PAGINATION_LABEL: "Sayfa göstergesi", // "Page indicator"

  // Slide 1: Control - Aboneliklerini Kontrol Altına Al
  SLIDE_1_TITLE: "Aboneliklerini Kontrol Altına Al", // "Take Control of Your Subscriptions"
  SLIDE_1_DESCRIPTION:
    "Tüm aboneliklerini tek bir yerde görüntüle. Netflix, Spotify, iCloud... Hiçbirini kaçırma.", // "View all your subscriptions in one place. Netflix, Spotify, iCloud... Never miss one."

  // Slide 2: Visibility - Yaklaşan Ödemeleri Gör
  SLIDE_2_TITLE: "Yaklaşan Ödemeleri Gör", // "See Upcoming Payments"
  SLIDE_2_DESCRIPTION:
    "Hangi ödeme ne zaman? Takvim görünümüyle her şey bir bakışta.", // "Which payment is when? Everything at a glance with calendar view."

  // Slide 3: Insights - Harcamalarını Takip Et
  SLIDE_3_TITLE: "Harcamalarını Takip Et", // "Track Your Spending"
  SLIDE_3_DESCRIPTION:
    "Aylık ve yıllık harcamalarını analiz et. Abonelik şokundan kurtul!", // "Analyze monthly and yearly spending. Break free from subscription shock!"
} as const;

export type OnboardingStrings = typeof ONBOARDING_STRINGS;
export type OnboardingStringKey = keyof OnboardingStrings;

/**
 * Helper function to interpolate step indicator
 *
 * @example
 * formatStepIndicator(1, 3) // "Adım 1/3"
 */
export function formatStepIndicator(current: number, total: number): string {
  return ONBOARDING_STRINGS.STEP_INDICATOR.replace(
    "{current}",
    String(current)
  ).replace("{total}", String(total));
}

/**
 * Helper function for ARIA step indicator
 */
export function formatStepIndicatorAria(
  current: number,
  total: number
): string {
  return ONBOARDING_STRINGS.STEP_INDICATOR_ARIA.replace(
    "{current}",
    String(current)
  ).replace("{total}", String(total));
}

/**
 * Helper function for go-to-step ARIA label
 */
export function formatGoToStep(step: number): string {
  return ONBOARDING_STRINGS.GO_TO_STEP.replace("{step}", String(step));
}
