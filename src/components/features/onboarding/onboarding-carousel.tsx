import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { OnboardingStep } from "./onboarding-step";
import {
  ONBOARDING_STRINGS,
  formatStepIndicator,
  formatStepIndicatorAria,
  formatGoToStep,
} from "@/lib/i18n/onboarding";
import { logger } from "@/lib/event-logger";

/**
 * Configuration for a single onboarding step
 */
export interface OnboardingStepConfig {
  /** Unique identifier for the step */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Optional illustration/visual content */
  illustration?: ReactNode;
}

/**
 * Props for OnboardingCarousel component
 */
export interface OnboardingCarouselProps {
  /** Array of step configurations (min 1, max 5) */
  steps: OnboardingStepConfig[];
  /** Optional callback when onboarding completes */
  onComplete?: () => void;
  /** Optional callback when user skips onboarding */
  onSkip?: () => void;
  /** Optional callback when step changes (for rebuilding steps with animation state) */
  onStepChange?: (stepIndex: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * OnboardingCarousel Component
 *
 * Story 9.1: AC3, AC4, AC5 - Carousel container for onboarding slides
 *
 * Features:
 * - 3-4 slide container with pagination dots
 * - "İleri" button advances to next step
 * - "Atla" button skips entire onboarding
 * - On last step, button becomes "Başlayalım!" and marks complete
 * - Keyboard navigation: ArrowLeft/ArrowRight
 * - Full-screen standalone view (no Header/BottomNav)
 * - ARIA live regions for accessibility
 */
export function OnboardingCarousel({
  steps,
  onComplete,
  onSkip,
  onStepChange,
  className = "",
}: OnboardingCarouselProps) {
  const { currentStep, setStep, markComplete } = useOnboardingState();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef<number>(-1);

  // Clamp step to valid range
  const totalSteps = steps.length;
  const safeCurrentStep = Math.min(Math.max(0, currentStep), totalSteps - 1);
  const isLastStep = safeCurrentStep === totalSteps - 1;

  // Story 9.2 AC3: Log onboarding_step_viewed event on slide change
  // Story 9.2 AC4: Programmatic focus management on slide change
  useEffect(() => {
    // Skip initial render and only trigger on actual step changes
    if (previousStepRef.current !== safeCurrentStep) {
      const stepConfig = steps[safeCurrentStep];
      if (stepConfig) {
        // AC3: Log step view event for funnel analysis
        logger.log("onboarding_step_viewed", {
          step_number: safeCurrentStep + 1,
          step_title: stepConfig.title,
        });

        // Notify parent of step change (for animation state updates)
        onStepChange?.(safeCurrentStep);
      }

      // AC4: Move focus to title element on slide change
      // Skip on initial render (previousStepRef.current === -1)
      if (previousStepRef.current !== -1) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          titleRef.current?.focus();
        });
      }

      previousStepRef.current = safeCurrentStep;
    }
  }, [safeCurrentStep, steps, onStepChange]);

  // Handle navigation
  const goToNext = useCallback(() => {
    if (isLastStep) {
      markComplete();
      onComplete?.();
    } else {
      setStep(safeCurrentStep + 1);
    }
  }, [isLastStep, safeCurrentStep, setStep, markComplete, onComplete]);

  const goToPrev = useCallback(() => {
    if (safeCurrentStep > 0) {
      setStep(safeCurrentStep - 1);
    }
  }, [safeCurrentStep, setStep]);

  const handleSkip = useCallback(() => {
    markComplete();
    onSkip?.();
  }, [markComplete, onSkip]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setStep(step);
      }
    },
    [totalSteps, setStep]
  );

  // Keyboard navigation (AC3)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          if (!isLastStep) {
            goToNext();
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          goToPrev();
          break;
        case "Enter":
        case " ":
          // Allow buttons to handle Enter/Space
          break;
      }
    },
    [isLastStep, goToNext, goToPrev]
  );

  // Sync step if out of bounds
  useEffect(() => {
    if (currentStep !== safeCurrentStep) {
      setStep(safeCurrentStep);
    }
  }, [currentStep, safeCurrentStep, setStep]);

  const currentStepConfig = steps[safeCurrentStep];

  return (
    <div
      data-testid="onboarding-carousel"
      className={`flex min-h-screen flex-col bg-background ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={ONBOARDING_STRINGS.CAROUSEL_LABEL}
      aria-roledescription="carousel"
    >
      {/* Skip button - top right */}
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={ONBOARDING_STRINGS.SKIP_BUTTON}
        >
          {ONBOARDING_STRINGS.SKIP_BUTTON}
        </button>
      </div>

      {/* Step content with aria-live for accessibility */}
      <div
        className="flex-1"
        role="group"
        aria-roledescription="slide"
        aria-label={formatStepIndicatorAria(safeCurrentStep + 1, totalSteps)}
        aria-live="polite"
        aria-atomic="true"
      >
        <OnboardingStep
          key={currentStepConfig.id}
          title={currentStepConfig.title}
          description={currentStepConfig.description}
          illustration={currentStepConfig.illustration}
          titleRef={titleRef}
        />
      </div>

      {/* Bottom navigation */}
      <div className="flex flex-col items-center gap-6 p-6 pb-safe">
        {/* Pagination dots */}
        <nav
          className="flex items-center gap-2"
          role="tablist"
          aria-label={ONBOARDING_STRINGS.PAGINATION_LABEL}
        >
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={index === safeCurrentStep}
              aria-controls="onboarding-slide-content"
              aria-label={formatGoToStep(index + 1)}
              onClick={() => goToStep(index)}
              className={`h-2 rounded-full transition-all duration-300 motion-safe:transition-all ${
                index === safeCurrentStep
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </nav>

        {/* Step indicator text */}
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          {formatStepIndicator(safeCurrentStep + 1, totalSteps)}
        </span>

        {/* Navigation button */}
        <button
          type="button"
          onClick={goToNext}
          className="min-h-[44px] w-full max-w-xs rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] motion-safe:transition-all"
          aria-label={
            isLastStep
              ? ONBOARDING_STRINGS.START_BUTTON
              : ONBOARDING_STRINGS.NEXT_BUTTON
          }
        >
          {isLastStep
            ? ONBOARDING_STRINGS.START_BUTTON
            : ONBOARDING_STRINGS.NEXT_BUTTON}
        </button>
      </div>
    </div>
  );
}

// Export types
export type {
  OnboardingCarouselProps as OnboardingCarouselPropsType,
  OnboardingStepConfig as OnboardingStepConfigType,
};
