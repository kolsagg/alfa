import { ThemeProvider } from "./components/providers/theme-provider";
import { IOSInstallGuidance } from "./components/ui/ios-install-guidance";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { CountdownHeroPlaceholder } from "./components/dashboard/countdown-hero-placeholder";
import { SubscriptionList } from "./components/features/subscription/subscription-list";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <IOSInstallGuidance />
      <DashboardLayout>
        <div className="space-y-6">
          <CountdownHeroPlaceholder />
          <SubscriptionList />
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
