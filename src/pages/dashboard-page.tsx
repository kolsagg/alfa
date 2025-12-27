import { useState } from "react";
import { CountdownHero } from "@/components/dashboard/countdown-hero";
import { SubscriptionList } from "@/components/features/subscription/subscription-list";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { SpendingSummary } from "@/components/features/spending";
import { TimelineView } from "@/components/features/timeline";
import { CategoryBreakdown } from "@/components/features/analytics/category-breakdown";
import { DashboardAlerts } from "@/components/features/dashboard-alerts";
import { PrivacyBadge } from "@/components/ui/privacy-badge";

/**
 * Dashboard Page Component
 *
 * Main dashboard view with spending summary, countdown hero,
 * timeline, category breakdown, and subscription list.
 */
export default function DashboardPage() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const hasSubscriptions = subscriptions.length > 0;

  // Shared category filter state for sync between Breakdown and List
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Story 5.5: Centralized Alerts Container */}
      <DashboardAlerts />
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

      {/* Story 7.2: Privacy Reassurance */}
      <div className="flex justify-center pt-4 opacity-70">
        <PrivacyBadge variant="standard" />
      </div>
    </div>
  );
}
