import { useState, useCallback, useMemo } from "react";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import {
  OnboardingCarousel,
  createOnboardingSteps,
} from "@/components/features/onboarding";
import { RootLayout } from "./root-layout";
import { logger } from "@/lib/event-logger";

/**
 * OnboardingGate Component
 *
 * Story 9.1: AC4 - Conditional Rendering Integration
 * Story 9.2: Real slide content with illustrations and funnel analytics
 *
 * Renders OnboardingCarousel for first-time users (full-screen, no Header/BottomNav)
 * Renders RootLayout for returning users (normal app experience)
 */
export function OnboardingGate() {
  const { hasCompletedOnboarding } = useOnboardingState();

  // Track current step for animation state (AC1: animations only on active slide)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Handle step changes from carousel
  const handleStepChange = useCallback((stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  }, []);

  // Story 9.2: Memoize steps to prevent unnecessary re-renders of the carousel items
  const steps = useMemo(
    () => createOnboardingSteps(currentStepIndex),
    [currentStepIndex]
  );

  // First-time user: show onboarding (AC4)
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingCarousel
        steps={steps}
        onStepChange={handleStepChange}
        onComplete={() => {
          // Navigation will happen via hook state change causing re-render
          logger.log("onboarding_completed");
        }}
        onSkip={() => {
          logger.log("onboarding_skipped");
        }}
      />
    );
  }

  // Returning user: normal app experience
  return <RootLayout />;
}
