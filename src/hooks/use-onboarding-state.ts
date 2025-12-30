import { useSyncExternalStore, useCallback } from "react";
import { z } from "zod";

/**
 * Onboarding State Hook
 *
 * Story 9.1: AC1 - useOnboardingState Hook
 *
 * Features:
 * - localStorage persistence with schema validation
 * - Environment-aware storage key (-dev suffix for development)
 * - Selector pattern to minimize re-renders
 * - Zod schema validation on rehydration
 */

// Schema for onboarding state validation (AC1: Zod schema)
const OnboardingStateSchema = z.object({
  onboarding_completed: z.boolean(),
  currentStep: z.number().int().min(0),
  version: z.number().int().optional(),
});

type OnboardingPersistedState = z.infer<typeof OnboardingStateSchema>;

// Environment-aware storage key (AC1: -dev suffix for development)
const STORAGE_KEY =
  import.meta.env.MODE === "development"
    ? "subtracker-onboarding-dev"
    : "subtracker-onboarding";

// Current schema version for migrations
const SCHEMA_VERSION = 1;

// Default state
const DEFAULT_STATE: OnboardingPersistedState = {
  onboarding_completed: false,
  currentStep: 0,
  version: SCHEMA_VERSION,
};

// In-memory cache for SSR and initial render
let cachedState: OnboardingPersistedState | null = null;

/**
 * Read and validate state from localStorage
 */
function getStoredState(): OnboardingPersistedState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  // Return cached state if available
  if (cachedState !== null) {
    return cachedState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      cachedState = DEFAULT_STATE;
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(stored);
    const result = OnboardingStateSchema.safeParse(parsed);

    if (!result.success) {
      console.warn(
        "[useOnboardingState] Invalid stored data, resetting:",
        result.error.flatten()
      );
      cachedState = DEFAULT_STATE;
      return DEFAULT_STATE;
    }

    cachedState = result.data;
    return result.data;
  } catch (error) {
    console.warn("[useOnboardingState] Failed to read localStorage:", error);
    cachedState = DEFAULT_STATE;
    return DEFAULT_STATE;
  }
}

/**
 * Persist state to localStorage and update cache
 */
function persistState(state: OnboardingPersistedState): void {
  if (typeof window === "undefined") return;

  try {
    cachedState = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Notify subscribers of change
    storageEventTarget.dispatchEvent(new Event("onboarding-change"));
  } catch (error) {
    console.error("[useOnboardingState] Failed to persist state:", error);
  }
}

// Event target for notifying subscribers (selector pattern)
const storageEventTarget = new EventTarget();

/**
 * Subscribe to state changes (for useSyncExternalStore)
 */
function subscribe(callback: () => void): () => void {
  storageEventTarget.addEventListener("onboarding-change", callback);

  // Also listen for storage events from other tabs
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedState = null; // Invalidate cache
      callback();
    }
  };
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    storageEventTarget.removeEventListener("onboarding-change", callback);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

/**
 * Get snapshot for useSyncExternalStore
 */
function getSnapshot(): OnboardingPersistedState {
  return getStoredState();
}

/**
 * Get server snapshot (for SSR)
 */
function getServerSnapshot(): OnboardingPersistedState {
  return DEFAULT_STATE;
}

export interface OnboardingState {
  /** Whether user has completed onboarding (AC1) */
  hasCompletedOnboarding: boolean;
  /** Current step index (0-based) (AC1) */
  currentStep: number;
  /** Mark onboarding as complete (AC1) */
  markComplete: () => void;
  /** Set current step (AC1) */
  setStep: (step: number) => void;
  /** Reset onboarding state (AC1) */
  reset: () => void;
}

/**
 * Hook for managing onboarding state
 *
 * @example
 * ```tsx
 * const { hasCompletedOnboarding, currentStep, markComplete } = useOnboardingState();
 *
 * if (!hasCompletedOnboarding) {
 *   return <OnboardingCarousel />;
 * }
 * ```
 */
export function useOnboardingState(): OnboardingState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const markComplete = useCallback(() => {
    const current = getStoredState();
    persistState({
      ...current,
      onboarding_completed: true,
      version: SCHEMA_VERSION,
    });
  }, []);

  const setStep = useCallback((step: number) => {
    if (step < 0) {
      console.warn("[useOnboardingState] Step cannot be negative:", step);
      return;
    }
    const current = getStoredState();
    persistState({
      ...current,
      currentStep: step,
      version: SCHEMA_VERSION,
    });
  }, []);

  const reset = useCallback(() => {
    persistState(DEFAULT_STATE);
  }, []);

  return {
    hasCompletedOnboarding: state.onboarding_completed,
    currentStep: state.currentStep,
    markComplete,
    setStep,
    reset,
  };
}

// Export for testing
export { STORAGE_KEY, OnboardingStateSchema, DEFAULT_STATE };

/**
 * Invalidate cached state - for testing purposes only
 * Call this in beforeEach to ensure clean state between tests
 */
export function invalidateCache(): void {
  cachedState = null;
}
