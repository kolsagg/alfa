import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { AddSubscriptionDialog } from "@/components/features/subscription/add-subscription-dialog";
import { NotificationBanner } from "@/components/features/NotificationBanner";
import { useNotificationScheduleSync } from "@/hooks/use-notification-schedule-sync";
import { useNotificationLifecycle } from "@/hooks/use-notification-lifecycle";
import { PAGE_TITLES, ROUTES } from "@/router/routes";
import { IOSInstallGuidance } from "@/components/ui/ios-install-guidance";

/**
 * Root Layout Component
 *
 * This component wraps all pages and provides:
 * - Shared layout (Header, BottomNav)
 * - Notification hooks that run regardless of active page
 * - NotificationBanner for cross-page visibility
 * - Page title updates based on current route
 */
export function RootLayout() {
  const location = useLocation();

  // Story 4.3: Sync notification schedule with subscriptions and settings
  // This hook recalculates schedule on mount and when dependencies change
  useNotificationScheduleSync();

  // Story 4.4: Handle notification display, clicks, and permission syncing
  useNotificationLifecycle();

  // AC7: Update document title based on current route
  useEffect(() => {
    const path = location.pathname;
    document.title = PAGE_TITLES[path] || PAGE_TITLES[ROUTES.DASHBOARD];
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background font-jakarta">
      <Header />
      <IOSInstallGuidance />
      <div className="px-4 pt-2">
        <NotificationBanner />
      </div>
      <main className="flex-1 px-4 py-6 pb-24">
        <Outlet />
      </main>
      <BottomNav />
      <AddSubscriptionDialog />
    </div>
  );
}
