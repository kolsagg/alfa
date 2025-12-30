import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routeConfig } from "./index";
import { ROUTES } from "./routes";

// Mock notification hooks (they're in RootLayout)
vi.mock("@/hooks/use-notification-schedule-sync", () => ({
  useNotificationScheduleSync: vi.fn(),
}));

vi.mock("@/hooks/use-notification-lifecycle", () => ({
  useNotificationLifecycle: vi.fn(),
}));

// Mock settings store for NotificationBanner
vi.mock("@/stores/settings-store", () => ({
  useSettingsStore: vi.fn(() => ({
    notificationPermission: "default",
    notificationPermissionDeniedAt: undefined,
    notificationBannerDismissedAt: undefined,
  })),
}));

// Mock notification-permission for isNotificationSupported
vi.mock("@/lib/notification-permission", () => ({
  isNotificationSupported: vi.fn(() => true),
  getBrowserNotificationPermission: vi.fn(() => "default"),
  requestAndUpdatePermission: vi.fn().mockResolvedValue(false),
}));

// Mock iOS detection for DashboardPage
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  useIOSPWADetection: vi.fn(() => ({ shouldShowPrompt: false })),
  detectIOSSafariNonStandalone: vi.fn(() => false),
}));

// Mock notification utils for NotificationToggle
vi.mock("@/lib/notification/utils", () => ({
  isPushNotificationActive: vi.fn(() => false),
}));

// Mock subscription store with selector support
vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: (
    selector?: (state: { subscriptions: unknown[] }) => unknown
  ) => {
    const mockState = {
      subscriptions: [],
    };
    if (selector) return selector(mockState);
    return mockState;
  },
}));

// Mock ui-store with proper selector function support
vi.mock("@/stores/ui-store", () => ({
  useUIStore: (selector?: (state: Record<string, unknown>) => unknown) => {
    const mockState = {
      openModal: vi.fn(),
      dateFilter: null,
      setDateFilter: vi.fn(),
      clearDateFilter: vi.fn(),
    };
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  },
}));

// Mock FX store
vi.mock("@/stores/fx-store", () => ({
  useFXStore: vi.fn(() => ({
    rates: { USD: 1, EUR: 0.85, TRY: 32.5 },
    fetchRates: vi.fn(),
    isLoading: false,
  })),
}));

// Mock onboarding state - simulate completed onboarding so routes are accessible
vi.mock("@/hooks/use-onboarding-state", () => ({
  useOnboardingState: vi.fn(() => ({
    hasCompletedOnboarding: true, // Always show pages, not onboarding
    currentStep: 0,
    markComplete: vi.fn(),
    setStep: vi.fn(),
    reset: vi.fn(),
  })),
}));

/**
 * Helper to render with router at specific path
 */
function renderWithRouter(initialPath: string) {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: [initialPath],
  });
  return render(<RouterProvider router={router} />);
}

describe("Router Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dashboard at root path", async () => {
    renderWithRouter(ROUTES.DASHBOARD);

    await waitFor(
      () => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render settings at /settings path", async () => {
    renderWithRouter(ROUTES.SETTINGS);

    await waitFor(
      () => {
        expect(screen.getByTestId("settings-page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render wallet at /wallet path", async () => {
    renderWithRouter(ROUTES.WALLET);

    await waitFor(
      () => {
        expect(screen.getByTestId("wallet-page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should redirect unknown routes to dashboard", async () => {
    renderWithRouter("/unknown-route");

    await waitFor(
      () => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render RootLayout with common elements", async () => {
    renderWithRouter(ROUTES.DASHBOARD);

    // First wait for dashboard page to load (lazy loading)
    await waitFor(
      () => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Then check common layout elements
    // Check for header (rendered in all routes via RootLayout)
    expect(screen.getByText("SubTracker")).toBeInTheDocument();
    expect(document.title).toBe("Dashboard | SubTracker");
    // Check for bottom nav (rendered in all routes via RootLayout)
    expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    // Both Header and BottomNav have "Ayarlar" label, so check at least one exists
    expect(screen.getAllByLabelText("Ayarlar").length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("should update document title based on route", async () => {
    renderWithRouter(ROUTES.SETTINGS);

    // First wait for Settings page to be rendered (lazy loaded)
    await waitFor(
      () => {
        expect(screen.getByTestId("settings-page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Then check title - it should update after RootLayout's useEffect runs
    await waitFor(
      () => {
        expect(document.title).toBe("Ayarlar | SubTracker");
      },
      { timeout: 3000 }
    );
  });
});

describe("Route Constants", () => {
  it("should have correct route paths", () => {
    expect(ROUTES.DASHBOARD).toBe("/");
    expect(ROUTES.SETTINGS).toBe("/settings");
    expect(ROUTES.WALLET).toBe("/wallet");
  });
});

/**
 * Story 9.1: First-Run Integration Tests
 * Tests onboarding flow for first-time users (AC4)
 */
describe("First-Run Onboarding Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render OnboardingCarousel for first-time users (hasCompletedOnboarding: false)", async () => {
    // Override mock for this test - first-time user
    const { useOnboardingState } = await import("@/hooks/use-onboarding-state");
    vi.mocked(useOnboardingState).mockReturnValue({
      hasCompletedOnboarding: false,
      currentStep: 0,
      markComplete: vi.fn(),
      setStep: vi.fn(),
      reset: vi.fn(),
    });

    renderWithRouter(ROUTES.DASHBOARD);

    // Should show onboarding carousel, not dashboard
    await waitFor(
      () => {
        expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Dashboard should NOT be visible
    expect(screen.queryByTestId("dashboard-page")).not.toBeInTheDocument();
  });

  it("should render full-screen onboarding without Header/BottomNav for first-time users", async () => {
    // Override mock for this test - first-time user
    const { useOnboardingState } = await import("@/hooks/use-onboarding-state");
    vi.mocked(useOnboardingState).mockReturnValue({
      hasCompletedOnboarding: false,
      currentStep: 0,
      markComplete: vi.fn(),
      setStep: vi.fn(),
      reset: vi.fn(),
    });

    renderWithRouter(ROUTES.DASHBOARD);

    await waitFor(
      () => {
        expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Header and BottomNav should NOT be present during onboarding
    expect(screen.queryByText("SubTracker")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Dashboard")).not.toBeInTheDocument();
  });

  it("should block navigation to /settings during onboarding (shows onboarding instead)", async () => {
    // Override mock for this test - first-time user
    const { useOnboardingState } = await import("@/hooks/use-onboarding-state");
    vi.mocked(useOnboardingState).mockReturnValue({
      hasCompletedOnboarding: false,
      currentStep: 0,
      markComplete: vi.fn(),
      setStep: vi.fn(),
      reset: vi.fn(),
    });

    // Try to navigate directly to settings
    renderWithRouter(ROUTES.SETTINGS);

    // Should still show onboarding, not settings
    await waitFor(
      () => {
        expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.queryByTestId("settings-page")).not.toBeInTheDocument();
  });
});
