import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  useOnboardingState,
  STORAGE_KEY,
  OnboardingStateSchema,
  DEFAULT_STATE,
  invalidateCache,
} from "./use-onboarding-state";

describe("useOnboardingState", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the cached state
    invalidateCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initial State", () => {
    it("returns default state when no data in localStorage", () => {
      const { result } = renderHook(() => useOnboardingState());

      expect(result.current.hasCompletedOnboarding).toBe(false);
      expect(result.current.currentStep).toBe(0);
    });

    it("restores state from localStorage on mount", () => {
      // Pre-populate localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          onboarding_completed: true,
          currentStep: 2,
          version: 1,
        })
      );
      // Invalidate cache so hook reads from localStorage
      invalidateCache();

      const { result } = renderHook(() => useOnboardingState());

      expect(result.current.hasCompletedOnboarding).toBe(true);
      expect(result.current.currentStep).toBe(2);
    });

    it("handles corrupted localStorage data gracefully", () => {
      // Simulate corrupted data
      localStorage.setItem(STORAGE_KEY, "not-valid-json");
      invalidateCache();

      const { result } = renderHook(() => useOnboardingState());

      expect(result.current.hasCompletedOnboarding).toBe(false);
      expect(result.current.currentStep).toBe(0);
    });

    it("handles invalid schema data gracefully", () => {
      // Valid JSON but invalid schema
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          onboarding_completed: "not-a-boolean",
          currentStep: "not-a-number",
        })
      );
      invalidateCache();

      const { result } = renderHook(() => useOnboardingState());

      expect(result.current.hasCompletedOnboarding).toBe(false);
      expect(result.current.currentStep).toBe(0);
    });
  });

  describe("markComplete Action", () => {
    it("marks onboarding as complete", async () => {
      const { result } = renderHook(() => useOnboardingState());

      expect(result.current.hasCompletedOnboarding).toBe(false);

      act(() => {
        result.current.markComplete();
      });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(true);
      });
    });

    it("persists completed state to localStorage", () => {
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.markComplete();
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      expect(stored.onboarding_completed).toBe(true);
    });

    it("preserves currentStep when marking complete", async () => {
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.setStep(3);
      });

      await waitFor(() => {
        expect(result.current.currentStep).toBe(3);
      });

      act(() => {
        result.current.markComplete();
      });

      await waitFor(() => {
        expect(result.current.currentStep).toBe(3);
        expect(result.current.hasCompletedOnboarding).toBe(true);
      });
    });
  });

  describe("setStep Action", () => {
    it("updates current step", async () => {
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.setStep(2);
      });

      await waitFor(() => {
        expect(result.current.currentStep).toBe(2);
      });
    });

    it("persists step to localStorage", () => {
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.setStep(1);
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      expect(stored.currentStep).toBe(1);
    });

    it("ignores negative step values", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.setStep(-1);
      });

      // Step should remain at 0
      expect(result.current.currentStep).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Step cannot be negative"),
        -1
      );

      warnSpy.mockRestore();
    });

    it("allows step 0", async () => {
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.setStep(2);
      });

      await waitFor(() => {
        expect(result.current.currentStep).toBe(2);
      });

      act(() => {
        result.current.setStep(0);
      });

      await waitFor(() => {
        expect(result.current.currentStep).toBe(0);
      });
    });
  });

  describe("reset Action", () => {
    it("resets state to defaults", async () => {
      const { result } = renderHook(() => useOnboardingState());

      // Set some state first
      act(() => {
        result.current.setStep(3);
        result.current.markComplete();
      });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(true);
        expect(result.current.currentStep).toBe(3);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(false);
        expect(result.current.currentStep).toBe(0);
      });
    });

    it("persists reset state to localStorage", () => {
      const { result } = renderHook(() => useOnboardingState());

      act(() => {
        result.current.markComplete();
        result.current.reset();
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      expect(stored.onboarding_completed).toBe(false);
      expect(stored.currentStep).toBe(0);
    });
  });

  describe("Schema Validation", () => {
    it("validates correct state", () => {
      const result = OnboardingStateSchema.safeParse({
        onboarding_completed: true,
        currentStep: 2,
        version: 1,
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid onboarding_completed type", () => {
      const result = OnboardingStateSchema.safeParse({
        onboarding_completed: "yes",
        currentStep: 0,
      });

      expect(result.success).toBe(false);
    });

    it("rejects negative currentStep", () => {
      const result = OnboardingStateSchema.safeParse({
        onboarding_completed: false,
        currentStep: -1,
      });

      expect(result.success).toBe(false);
    });

    it("rejects non-integer currentStep", () => {
      const result = OnboardingStateSchema.safeParse({
        onboarding_completed: false,
        currentStep: 1.5,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Environment-Aware Storage Key", () => {
    it("uses correct storage key format", () => {
      // In test environment, it should use the dev suffix
      expect(STORAGE_KEY).toMatch(/^subtracker-onboarding(-dev)?$/);
    });
  });

  describe("Default State", () => {
    it("has correct default values", () => {
      expect(DEFAULT_STATE.onboarding_completed).toBe(false);
      expect(DEFAULT_STATE.currentStep).toBe(0);
      expect(DEFAULT_STATE.version).toBeDefined();
    });
  });

  describe("Cross-Hook Synchronization", () => {
    it("multiple hook instances share state updates", async () => {
      const { result: result1 } = renderHook(() => useOnboardingState());
      const { result: result2 } = renderHook(() => useOnboardingState());

      act(() => {
        result1.current.setStep(5);
      });

      await waitFor(() => {
        expect(result2.current.currentStep).toBe(5);
      });
    });
  });
});
