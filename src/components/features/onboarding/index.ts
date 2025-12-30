/**
 * Onboarding Feature Components
 *
 * Story 9.1: Barrel exports for onboarding module
 * Story 9.2: Added illustration and slide config exports
 */

export { OnboardingCarousel } from "./onboarding-carousel";
export type {
  OnboardingCarouselPropsType as OnboardingCarouselProps,
  OnboardingStepConfigType as OnboardingStepConfig,
} from "./onboarding-carousel";

export { OnboardingStep } from "./onboarding-step";
export type { OnboardingStepPropsType as OnboardingStepProps } from "./onboarding-step";

export { OnboardingIllustration } from "./onboarding-illustration";
export type {
  IllustrationVariant,
  OnboardingIllustrationPropsType as OnboardingIllustrationProps,
} from "./onboarding-illustration";

export {
  SLIDE_CONFIG,
  createOnboardingSteps,
  getSlideTitleByIndex,
  getTotalSlides,
} from "./slide-config";
export type { Slide } from "./slide-config";
