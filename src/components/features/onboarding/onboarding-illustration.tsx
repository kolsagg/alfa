import {
  Smartphone,
  ListChecks,
  Calendar,
  PieChart,
  TrendingUp,
  CreditCard,
} from "lucide-react";

/**
 * Illustration variant types for onboarding slides
 */
export type IllustrationVariant = "control" | "visibility" | "insights";

/**
 * Props for OnboardingIllustration component
 */
export interface OnboardingIllustrationProps {
  /** Which illustration variant to display */
  variant: IllustrationVariant;
  /** Whether the illustration is currently active (controls animation) */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Icon size for desktop viewport (AC1 responsive scaling)
 * CSS handles mobile sizing via responsive utility classes
 */
const ICON_SIZE_DESKTOP = 64;

/**
 * OnboardingIllustration Component
 *
 * Story 9.2: AC1, AC5 - Icon-based illustrations for onboarding slides
 *
 * Features:
 * - 3 variants: control (subscriptions list), visibility (calendar), insights (chart)
 * - Uses lucide-react icons composed together
 * - Animations only run when isActive=true (battery/resource optimization)
 * - Responsive scaling: 48px mobile / 64px desktop
 * - Uses text-primary color with motion-safe animations
 * - NO external assets - stays under 2KB gzipped
 */
export function OnboardingIllustration({
  variant,
  isActive = false,
  className = "",
}: OnboardingIllustrationProps) {
  // Base container classes with responsive sizing
  const containerClasses = `
    relative flex items-center justify-center
    h-40 w-40 sm:h-48 sm:w-48
    rounded-full bg-primary/10
    ${className}
  `.trim();

  // Animation classes - only animate when active (AC1: battery optimization)
  const pulseAnimation = isActive ? "motion-safe:animate-pulse" : "";
  const bounceAnimation = isActive
    ? "motion-safe:animate-bounce motion-safe:animation-duration-2000"
    : "";

  // Icon classes with responsive sizing
  const primaryIconClasses = `
    text-primary
    w-12 h-12 sm:w-16 sm:h-16
    ${pulseAnimation}
  `.trim();

  const secondaryIconClasses = `
    text-primary/70
    w-6 h-6 sm:w-8 sm:h-8
    absolute
  `.trim();

  switch (variant) {
    case "control":
      // Slide 1: Control - Smartphone with subscription list icons
      return (
        <div
          className={containerClasses}
          data-testid="onboarding-illustration-control"
          aria-hidden="true"
        >
          <Smartphone
            className={primaryIconClasses}
            size={ICON_SIZE_DESKTOP}
            strokeWidth={1.5}
          />
          {/* Subscription list icons around the phone */}
          <ListChecks
            className={`${secondaryIconClasses} -right-2 top-6 ${
              isActive
                ? "motion-safe:animate-fade-in motion-safe:animation-delay-200"
                : "opacity-70"
            }`}
            size={24}
            strokeWidth={2}
          />
          <CreditCard
            className={`${secondaryIconClasses} -left-2 bottom-6 ${
              isActive
                ? "motion-safe:animate-fade-in motion-safe:animation-delay-400"
                : "opacity-70"
            }`}
            size={24}
            strokeWidth={2}
          />
        </div>
      );

    case "visibility":
      // Slide 2: Visibility - Calendar with upcoming payment indicator
      return (
        <div
          className={containerClasses}
          data-testid="onboarding-illustration-visibility"
          aria-hidden="true"
        >
          <Calendar
            className={primaryIconClasses}
            size={ICON_SIZE_DESKTOP}
            strokeWidth={1.5}
          />
          {/* Notification dot for upcoming payment - Use destructive color for urgency */}
          <div
            className={`absolute -right-1 -top-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-destructive ${bounceAnimation}`}
          />
          {/* Payment indicator badge */}
          <div
            className={`absolute -bottom-2 right-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ${
              isActive
                ? "motion-safe:animate-fade-in motion-safe:animation-delay-300"
                : ""
            }`}
          >
            3
          </div>
        </div>
      );

    case "insights":
      // Slide 3: Insights - Pie chart with trending indicator
      return (
        <div
          className={containerClasses}
          data-testid="onboarding-illustration-insights"
          aria-hidden="true"
        >
          <PieChart
            className={primaryIconClasses}
            size={ICON_SIZE_DESKTOP}
            strokeWidth={1.5}
          />
          {/* Trending up indicator - Use chart color for positive trend */}
          <TrendingUp
            className={`${secondaryIconClasses} -right-1 -top-1 text-chart-2 ${
              isActive
                ? "motion-safe:animate-fade-in motion-safe:animation-delay-200"
                : "opacity-70"
            }`}
            size={28}
            strokeWidth={2.5}
          />
        </div>
      );

    default:
      // Fallback - should never happen with TypeScript
      return null;
  }
}

// Export types for external use
export type { OnboardingIllustrationProps as OnboardingIllustrationPropsType };
