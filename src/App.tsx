import { ThemeProvider } from "./components/providers/theme-provider";
import { IOSInstallGuidance } from "./components/ui/ios-install-guidance";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { CountdownHeroPlaceholder } from "./components/dashboard/countdown-hero-placeholder";
import { SubscriptionList } from "./components/features/subscription/subscription-list";
import { useSubscriptionStore } from "./stores/subscription-store";
import { SpendingSummary } from "./components/features/spending";
import { TimelineView } from "./components/features/timeline";
import "./App.css";

function App() {
  const subscriptionCount = useSubscriptionStore((s) => s.subscriptions.length);
  const hasSubscriptions = subscriptionCount > 0;

  return (
    <ThemeProvider>
      <IOSInstallGuidance />
      <DashboardLayout>
        <div className="space-y-6">
          <SpendingSummary />
          {/* Hide CountdownHero when no subscriptions - prioritize EmptyState */}
          {hasSubscriptions && <CountdownHeroPlaceholder />}
          {hasSubscriptions && <TimelineView />}
          <SubscriptionList />
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
