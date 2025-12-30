import { createHashRouter, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import { OnboardingGate } from "@/components/layout/onboarding-gate";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { RootErrorBoundary } from "./error-boundary";
import { ROUTES } from "./routes";

// Lazy load page components for code-splitting
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const WalletPage = lazy(() => import("@/pages/wallet-page"));

/**
 * Route configuration exported for testing
 * Story 9.1: Uses OnboardingGate for first-run onboarding flow
 */
export const routeConfig = [
  {
    path: ROUTES.DASHBOARD,
    element: <OnboardingGate />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<LoadingSkeleton />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "wallet",
        element: (
          <Suspense fallback={<LoadingSkeleton />}>
            <WalletPage />
          </Suspense>
        ),
      },
      // Catch-all: redirect unknown routes to dashboard
      {
        path: "*",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
    ],
  },
];

/**
 * Hash-based router for PWA compatibility
 * - Works without server-side configuration
 * - Deep-linking reliable when app reopened from home screen
 * - URLs use format: /#/, /#/settings, /#/wallet
 */
export const router = createHashRouter(routeConfig);
