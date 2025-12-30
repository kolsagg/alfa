import {
  ONBOARDING_STRINGS,
  type OnboardingStringKey,
} from "@/lib/i18n/onboarding";
import { OnboardingIllustration } from "./onboarding-illustration";
import type { IllustrationVariant } from "./onboarding-illustration";
import type { OnboardingStepConfig } from "./onboarding-carousel";

/**
 * Slide Interface for type-safe configuration
 * Story 9.2 Dev Notes: Type Safety
 */
export interface Slide {
  /** Unique identifier for the slide */
  id: string;
  /** i18n key for the title */
  titleKey: OnboardingStringKey;
  /** i18n key for the description */
  descriptionKey: OnboardingStringKey;
  /** Illustration variant to display */
  variant: IllustrationVariant;
}

/**
 * Static slide configuration
 * Content aligned with strategic intent:
 * - Control: Track subscriptions
 * - Visibility: See upcoming payments
 * - Insights: Analyze spending
 */
export const SLIDE_CONFIG: Slide[] = [
  {
    id: "control",
    titleKey: "SLIDE_1_TITLE",
    descriptionKey: "SLIDE_1_DESCRIPTION",
    variant: "control",
  },
  {
    id: "visibility",
    titleKey: "SLIDE_2_TITLE",
    descriptionKey: "SLIDE_2_DESCRIPTION",
    variant: "visibility",
  },
  {
    id: "insights",
    titleKey: "SLIDE_3_TITLE",
    descriptionKey: "SLIDE_3_DESCRIPTION",
    variant: "insights",
  },
];

/**
 * Map slide config to OnboardingStepConfig
 * Creates the step configuration with resolved i18n strings and illustrations
 *
 * @param currentStepIndex - Current active step index for animation control
 * @returns Array of OnboardingStepConfig ready for OnboardingCarousel
 */
export function createOnboardingSteps(
  currentStepIndex: number = 0
): OnboardingStepConfig[] {
  return SLIDE_CONFIG.map((slide, index) => ({
    id: slide.id,
    title: ONBOARDING_STRINGS[slide.titleKey],
    description: ONBOARDING_STRINGS[slide.descriptionKey],
    illustration: (
      <OnboardingIllustration
        variant={slide.variant}
        isActive={index === currentStepIndex}
      />
    ),
  }));
}

/**
 * Get slide title by index (for event logging)
 */
export function getSlideTitleByIndex(index: number): string {
  const slide = SLIDE_CONFIG[index];
  if (!slide) return "unknown";
  return ONBOARDING_STRINGS[slide.titleKey];
}

/**
 * Get total number of slides
 */
export function getTotalSlides(): number {
  return SLIDE_CONFIG.length;
}
