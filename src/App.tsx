import { useState } from "react";
import { ThemeProvider } from "./components/providers/theme-provider";
import { IOSInstallGuidance } from "./components/ui/ios-install-guidance";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { CountdownHero } from "./components/dashboard/countdown-hero";
import { SubscriptionList } from "./components/features/subscription/subscription-list";
import { useSubscriptionStore } from "./stores/subscription-store";
import { SpendingSummary } from "./components/features/spending";
import { TimelineView } from "./components/features/timeline";
import { CategoryBreakdown } from "./components/features/analytics/category-breakdown";
import { useNotificationScheduleSync } from "./hooks/use-notification-schedule-sync";
import { useNotificationLifecycle } from "./hooks/use-notification-lifecycle";
import "./App.css";

/**
 * Main Application Component
 *
 * FOREGROUND-ONLY NOTIFICATION SCHEDULING (Story 4.3):
 * useNotificationScheduleSync() calculates notification schedules when the app is open.
 * Notifications can only fire when the browser tab is open/in background (browser-dependent).
 * This is a client-side PWA limitation - no server-push capabilities.
 */
function App() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const hasSubscriptions = subscriptions.length > 0;

  // Shared category filter state for sync between Breakdown and List
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Story 4.3: Sync notification schedule with subscriptions and settings
  // This hook recalculates schedule on mount and when dependencies change
  useNotificationScheduleSync();

  // Story 4.4: Handle notification display, clicks, and permission syncing
  useNotificationLifecycle();

  return (
    <ThemeProvider>
      <IOSInstallGuidance />
      <DashboardLayout>
        <div className="space-y-6">
          <SpendingSummary />
          <CountdownHero />
          {hasSubscriptions && <TimelineView />}
          {hasSubscriptions && (
            <CategoryBreakdown
              subscriptions={subscriptions}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          )}
          <SubscriptionList
            externalCategoryFilter={selectedCategory}
            onExternalCategoryChange={setSelectedCategory}
          />
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
