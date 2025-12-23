import { useState } from "react";
import { CountdownHero } from "@/components/dashboard/countdown-hero";
import { SubscriptionList } from "@/components/features/subscription/subscription-list";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { SpendingSummary } from "@/components/features/spending";
import { TimelineView } from "@/components/features/timeline";
import { CategoryBreakdown } from "@/components/features/analytics/category-breakdown";

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
  );
}
