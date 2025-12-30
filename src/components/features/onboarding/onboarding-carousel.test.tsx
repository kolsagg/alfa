import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  OnboardingCarousel,
  type OnboardingStepConfig,
} from "./onboarding-carousel";
import { ONBOARDING_STRINGS } from "@/lib/i18n/onboarding";

// Mock the hook
vi.mock("@/hooks/use-onboarding-state", () => ({
  useOnboardingState: vi.fn(() => ({
    hasCompletedOnboarding: false,
    currentStep: 0,
    markComplete: vi.fn(),
    setStep: vi.fn(),
    reset: vi.fn() as unknown as OnboardingState["reset"],
  })),
}));

// Story 9.2: Mock the event logger for funnel analytics testing
const mockLoggerLog = vi.fn();
vi.mock("@/lib/event-logger", () => ({
  logger: {
    log: (...args: unknown[]) => mockLoggerLog(...args),
  },
}));

// Import the mocked module
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import type { OnboardingState } from "@/hooks/use-onboarding-state";

const mockSteps: OnboardingStepConfig[] = [
  {
    id: "step-1",
    title: "Welcome",
    description: "First step description",
    illustration: <span data-testid="illustration-1">🎉</span>,
  },
  {
    id: "step-2",
    title: "Track",
    description: "Second step description",
    illustration: <span data-testid="illustration-2">📊</span>,
  },
  {
    id: "step-3",
    title: "Start",
    description: "Third step description",
    illustration: <span data-testid="illustration-3">🚀</span>,
  },
];

describe("OnboardingCarousel", () => {
  let mockSetStep: OnboardingState["setStep"];
  let mockMarkComplete: OnboardingState["markComplete"];

  beforeEach(() => {
    mockSetStep = vi.fn() as unknown as OnboardingState["setStep"];
    mockMarkComplete = vi.fn() as unknown as OnboardingState["markComplete"];

    vi.mocked(useOnboardingState).mockReturnValue({
      hasCompletedOnboarding: false,
      currentStep: 0,
      markComplete: mockMarkComplete,
      setStep: mockSetStep,
      reset: vi.fn() as unknown as OnboardingState["reset"],
    });

    localStorage.clear();
    mockLoggerLog.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with correct data-testid", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
    });

    it("renders current step content", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(screen.getByText("First step description")).toBeInTheDocument();
    });

    it("renders skip button", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      expect(
        screen.getByRole("button", { name: ONBOARDING_STRINGS.SKIP_BUTTON })
      ).toBeInTheDocument();
    });

    it("renders pagination dots for all steps", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });

    it("renders next button on non-last step", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      expect(
        screen.getByRole("button", { name: ONBOARDING_STRINGS.NEXT_BUTTON })
      ).toBeInTheDocument();
    });

    it("renders start button on last step", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 2,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      expect(
        screen.getByRole("button", { name: ONBOARDING_STRINGS.START_BUTTON })
      ).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<OnboardingCarousel steps={mockSteps} className="custom-class" />);

      expect(screen.getByTestId("onboarding-carousel")).toHaveClass(
        "custom-class"
      );
    });
  });

  describe("Navigation - Next Button", () => {
    it("advances to next step on next button click", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const nextButton = screen.getByRole("button", {
        name: ONBOARDING_STRINGS.NEXT_BUTTON,
      });
      fireEvent.click(nextButton);

      expect(mockSetStep).toHaveBeenCalledWith(1);
    });

    it("calls markComplete on last step next click", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 2,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      const startButton = screen.getByRole("button", {
        name: ONBOARDING_STRINGS.START_BUTTON,
      });
      fireEvent.click(startButton);

      expect(mockMarkComplete).toHaveBeenCalled();
    });

    it("calls onComplete callback on last step completion", () => {
      const onComplete = vi.fn();

      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 2,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} onComplete={onComplete} />);

      const startButton = screen.getByRole("button", {
        name: ONBOARDING_STRINGS.START_BUTTON,
      });
      fireEvent.click(startButton);

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe("Navigation - Skip Button", () => {
    it("marks complete on skip", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const skipButton = screen.getByRole("button", {
        name: ONBOARDING_STRINGS.SKIP_BUTTON,
      });
      fireEvent.click(skipButton);

      expect(mockMarkComplete).toHaveBeenCalled();
    });

    it("calls onSkip callback on skip", () => {
      const onSkip = vi.fn();

      render(<OnboardingCarousel steps={mockSteps} onSkip={onSkip} />);

      const skipButton = screen.getByRole("button", {
        name: ONBOARDING_STRINGS.SKIP_BUTTON,
      });
      fireEvent.click(skipButton);

      expect(onSkip).toHaveBeenCalled();
    });
  });

  describe("Navigation - Pagination Dots", () => {
    it("clicking pagination dot navigates to that step", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[2]); // Click third dot

      expect(mockSetStep).toHaveBeenCalledWith(2);
    });

    it("current step dot is marked as selected", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 1,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("Keyboard Navigation", () => {
    it("ArrowRight advances to next step", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      fireEvent.keyDown(carousel, { key: "ArrowRight" });

      expect(mockSetStep).toHaveBeenCalledWith(1);
    });

    it("ArrowLeft goes to previous step", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 1,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      fireEvent.keyDown(carousel, { key: "ArrowLeft" });

      expect(mockSetStep).toHaveBeenCalledWith(0);
    });

    it("ArrowLeft does nothing on first step", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      fireEvent.keyDown(carousel, { key: "ArrowLeft" });

      expect(mockSetStep).not.toHaveBeenCalled();
    });

    it("ArrowRight does not advance past last step", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 2, // last step
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      fireEvent.keyDown(carousel, { key: "ArrowRight" });

      expect(mockSetStep).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("carousel has correct ARIA role and label", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByRole("region", {
        name: ONBOARDING_STRINGS.CAROUSEL_LABEL,
      });
      expect(carousel).toBeInTheDocument();
      expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    });

    it("slide container has aria-live polite", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const slideContainer = screen.getByRole("group");
      expect(slideContainer).toHaveAttribute("aria-live", "polite");
      expect(slideContainer).toHaveAttribute("aria-atomic", "true");
    });

    it("pagination has correct ARIA labels", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const nav = screen.getByRole("tablist", {
        name: ONBOARDING_STRINGS.PAGINATION_LABEL,
      });
      expect(nav).toBeInTheDocument();
    });

    it("carousel is focusable for keyboard navigation", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      expect(carousel).toHaveAttribute("tabIndex", "0");
    });

    it("main button has minimum touch target size", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const button = screen.getByRole("button", {
        name: ONBOARDING_STRINGS.NEXT_BUTTON,
      });
      // Check for min-h-[44px] class (44px minimum touch target)
      expect(button.className).toContain("min-h-[44px]");
    });
  });

  describe("Step Content Display", () => {
    it("displays correct content for each step", () => {
      // Step 0
      render(<OnboardingCarousel steps={mockSteps} />);
      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(screen.getByTestId("illustration-1")).toBeInTheDocument();
    });

    it("displays step 2 content when on step 2", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 1,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      expect(screen.getByText("Track")).toBeInTheDocument();
      expect(screen.getByText("Second step description")).toBeInTheDocument();
    });
  });

  describe("Step Indicator", () => {
    it("shows correct step indicator text", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      // Should show "Adım 1/3"
      expect(screen.getByText(/Adım 1\/3/)).toBeInTheDocument();
    });

    it("updates step indicator on navigation", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 1,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      expect(screen.getByText(/Adım 2\/3/)).toBeInTheDocument();
    });
  });

  describe("Full Screen Layout", () => {
    it("has min-h-screen for full viewport height", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      expect(carousel).toHaveClass("min-h-screen");
    });

    it("has flex-col layout", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const carousel = screen.getByTestId("onboarding-carousel");
      expect(carousel).toHaveClass("flex", "flex-col");
    });
  });

  describe("Edge Cases", () => {
    it("handles single step correctly", () => {
      const singleStep: OnboardingStepConfig[] = [
        { id: "only", title: "Only Step", description: "The only one" },
      ];

      render(<OnboardingCarousel steps={singleStep} />);

      // Should show start button immediately
      expect(
        screen.getByRole("button", { name: ONBOARDING_STRINGS.START_BUTTON })
      ).toBeInTheDocument();

      // Only one pagination dot
      expect(screen.getAllByRole("tab")).toHaveLength(1);
    });

    it("clamps step to valid range when out of bounds", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 10, // Out of bounds
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      // Should display last step
      expect(screen.getByText("Start")).toBeInTheDocument();
    });
  });

  // Story 9.2: Event Logging Tests (AC3)
  describe("Event Logging - Funnel Analytics", () => {
    it("logs onboarding_step_viewed event on initial render", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      expect(mockLoggerLog).toHaveBeenCalledWith("onboarding_step_viewed", {
        step_number: 1,
        step_title: "Welcome",
      });
    });

    it("logs event with correct step_number on step change", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 1, // Second step
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      expect(mockLoggerLog).toHaveBeenCalledWith("onboarding_step_viewed", {
        step_number: 2,
        step_title: "Track",
      });
    });

    it("logs event with correct metadata for last step", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 2, // Last step
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: vi.fn() as unknown as OnboardingState["reset"],
      });

      render(<OnboardingCarousel steps={mockSteps} />);

      expect(mockLoggerLog).toHaveBeenCalledWith("onboarding_step_viewed", {
        step_number: 3,
        step_title: "Start",
      });
    });

    it("calls onStepChange callback when step changes", () => {
      const onStepChange = vi.fn();

      render(
        <OnboardingCarousel steps={mockSteps} onStepChange={onStepChange} />
      );

      // Initial render should trigger onStepChange with 0
      expect(onStepChange).toHaveBeenCalledWith(0);
    });
  });

  // Story 9.2: Focus Management Tests (AC4)
  describe("Focus Management - Accessibility", () => {
    it("title element has tabIndex -1 for programmatic focus", () => {
      render(<OnboardingCarousel steps={mockSteps} />);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveAttribute("tabIndex", "-1");
    });
  });
});
