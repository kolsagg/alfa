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
import "./App.css";

function App() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const hasSubscriptions = subscriptions.length > 0;

  // Shared category filter state for sync between Breakdown and List
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
