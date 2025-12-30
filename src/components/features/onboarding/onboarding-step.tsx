import type { ReactNode, RefObject } from "react";

/**
 * Props for OnboardingStep component
 */
export interface OnboardingStepProps {
  /** Step title (h2 element) */
  title: string;
  /** Step description text */
  description: string;
  /** Illustration or visual content (centered) */
  illustration?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Ref for the title element (for focus management - AC4) */
  titleRef?: RefObject<HTMLHeadingElement | null>;
}

/**
 * OnboardingStep Component
 *
 * Story 9.1: AC2 - Individual slide component for onboarding carousel
 * Story 9.2: AC4 - Focus management via titleRef
 *
 * Features:
 * - Title (h2, text-2xl font-bold)
 * - Description (text-muted-foreground)
 * - Illustration slot (React node, centered)
 * - Respects prefers-reduced-motion for animations
 * - Accessible with data-testid
 * - Supports programmatic focus via titleRef
 */
export function OnboardingStep({
  title,
  description,
  illustration,
  className = "",
  titleRef,
}: OnboardingStepProps) {
  return (
    <div
      id="onboarding-slide-content"
      data-testid="onboarding-step"
      className={`flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      {/* Illustration slot */}
      {illustration && (
        <div
          className="mb-8 flex items-center justify-center motion-safe:animate-fade-in"
          aria-hidden="true"
        >
          {illustration}
        </div>
      )}

      {/* Content */}
      <div className="max-w-md space-y-4">
        <h2
          ref={titleRef}
          tabIndex={-1}
          className="text-2xl font-bold text-foreground motion-safe:animate-slide-up focus:outline-none"
        >
          {title}
        </h2>
        <p className="text-base text-muted-foreground motion-safe:animate-slide-up motion-safe:animation-delay-100">
          {description}
        </p>
      </div>
    </div>
  );
}

// Export type for external use
export type { OnboardingStepProps as OnboardingStepPropsType };
