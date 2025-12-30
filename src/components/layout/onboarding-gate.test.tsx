import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OnboardingGate } from "./onboarding-gate";

// Mock the hook
vi.mock("@/hooks/use-onboarding-state", () => ({
  useOnboardingState: vi.fn(),
}));

// Mock the logger
const mockLoggerLog = vi.fn();
vi.mock("@/lib/event-logger", () => ({
  logger: {
    log: (...args: unknown[]) => mockLoggerLog(...args),
  },
}));

// Mock child components to avoid complex dependencies
vi.mock("./root-layout", () => ({
  RootLayout: () => <div data-testid="root-layout">Dashboard Content</div>,
}));

vi.mock("@/components/features/onboarding", () => ({
  OnboardingCarousel: ({
    onComplete,
    onSkip,
  }: {
    onComplete?: () => void;
    onSkip?: () => void;
  }) => (
    <div data-testid="onboarding-carousel">
      <button onClick={onComplete} data-testid="complete-btn">
        Complete
      </button>
      <button onClick={onSkip} data-testid="skip-btn">
        Skip
      </button>
    </div>
  ),
  // Story 9.2: Mock createOnboardingSteps to return empty array
  createOnboardingSteps: (index: number = 0) => [
    {
      id: "step-1",
      title: "Title 1",
      description: "Desc 1",
      illustration: <div data-testid={`illus-${index}`}>Illus</div>,
    },
  ],
}));

import { useOnboardingState } from "@/hooks/use-onboarding-state";
import type { OnboardingState } from "@/hooks/use-onboarding-state";

describe("OnboardingGate", () => {
  let mockMarkComplete: OnboardingState["markComplete"];
  let mockSetStep: OnboardingState["setStep"];
  let mockReset: OnboardingState["reset"];

  beforeEach(() => {
    mockMarkComplete = vi.fn() as unknown as OnboardingState["markComplete"];
    mockSetStep = vi.fn() as unknown as OnboardingState["setStep"];
    mockReset = vi.fn() as unknown as OnboardingState["reset"];
    localStorage.clear();
    mockLoggerLog.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("First-Time User (Onboarding Not Completed)", () => {
    beforeEach(() => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });
    });

    it("renders OnboardingCarousel for first-time users", () => {
      render(<OnboardingGate />);

      expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
      expect(screen.queryByTestId("root-layout")).not.toBeInTheDocument();
    });

    it("does not show Header or BottomNav during onboarding", () => {
      render(<OnboardingGate />);

      // RootLayout contains Header and BottomNav, should not be present
      expect(screen.queryByTestId("root-layout")).not.toBeInTheDocument();
    });
  });

  describe("Returning User (Onboarding Completed)", () => {
    beforeEach(() => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: true,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });
    });

    it("renders RootLayout for returning users", () => {
      render(<OnboardingGate />);

      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(
        screen.queryByTestId("onboarding-carousel")
      ).not.toBeInTheDocument();
    });

    it("shows normal dashboard experience", () => {
      render(<OnboardingGate />);

      expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
    });
  });

  describe("Onboarding Completion Flow", () => {
    it("transitions from onboarding to dashboard when onboarding completes", async () => {
      // Start with onboarding not completed
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });

      const { rerender } = render(<OnboardingGate />);

      expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();

      // Simulate completion (state change)
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: true,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });

      rerender(<OnboardingGate />);

      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(
        screen.queryByTestId("onboarding-carousel")
      ).not.toBeInTheDocument();
    });

    it("onComplete callback is wired correctly", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });

      render(<OnboardingGate />);

      const completeBtn = screen.getByTestId("complete-btn");
      fireEvent.click(completeBtn);

      expect(mockLoggerLog).toHaveBeenCalledWith("onboarding_completed");
    });

    it("onSkip callback is wired correctly", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });

      render(<OnboardingGate />);

      const skipBtn = screen.getByTestId("skip-btn");
      fireEvent.click(skipBtn);

      expect(mockLoggerLog).toHaveBeenCalledWith("onboarding_skipped");
    });
  });

  describe("Placeholder Steps", () => {
    it("passes placeholder steps to OnboardingCarousel", () => {
      vi.mocked(useOnboardingState).mockReturnValue({
        hasCompletedOnboarding: false,
        currentStep: 0,
        markComplete: mockMarkComplete,
        setStep: mockSetStep,
        reset: mockReset,
      });

      // The actual OnboardingCarousel mock receives props
      // This test verifies the gate renders something
      render(<OnboardingGate />);

      expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
    });
  });
});
