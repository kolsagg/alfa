import { useMemo } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { getUpcomingPayments } from "@/lib/timeline-utils";
import { TimelineItem } from "./timeline-item";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { startOfDay } from "date-fns";

interface TimelineViewProps {
  isLoading?: boolean;
}

export function TimelineView({ isLoading }: TimelineViewProps) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const { pastDue, upcoming } = useMemo(() => {
    const today = startOfDay(new Date());
    return getUpcomingPayments(subscriptions, today);
  }, [subscriptions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const hasNoPayments = pastDue.length === 0 && upcoming.length === 0;

  if (hasNoPayments) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarClock className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-foreground mb-1">
          Yaklaşan ödeme yok
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Abonelik ekleyerek ödeme takibine başlayabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Past Due Section */}
      {pastDue.length > 0 && (
        <section aria-label="Gecikmiş ödemeler">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[var(--color-critical)]" />
            <h2 className="text-sm font-semibold text-[var(--color-critical)] uppercase tracking-wider">
              Gecikmiş ({pastDue.length})
            </h2>
          </div>
          <div className="space-y-3" role="list">
            {pastDue.map((sub) => (
              <TimelineItem key={sub.id} subscription={sub} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <section aria-label="Yaklaşan ödemeler">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Yaklaşan ({upcoming.length})
            </h2>
          </div>
          <div className="space-y-3" role="list">
            {upcoming.map((sub) => (
              <TimelineItem key={sub.id} subscription={sub} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
