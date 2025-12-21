import type { Subscription } from "@/types/subscription";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  formatDaysRemaining,
  getUrgencyLevel,
  getDaysUntilPayment,
} from "@/lib/timeline-utils";
import { CategoryBadge } from "@/components/ui/category-badge";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  subscription: Subscription;
  className?: string;
}

const urgencyStyles = {
  subtle: "border-l-[var(--color-subtle)]",
  attention: "border-l-[var(--color-attention)]",
  urgent: "border-l-[var(--color-urgent)]",
  critical: "border-l-[var(--color-critical)]",
} as const;

export function TimelineItem({ subscription, className }: TimelineItemProps) {
  const daysUntil = getDaysUntilPayment(subscription.nextPaymentDate);
  const urgency = getUrgencyLevel(daysUntil);
  const formattedDate = format(
    new Date(subscription.nextPaymentDate),
    "d MMM",
    { locale: tr }
  );
  const formattedAmount = formatCurrency(
    subscription.amount,
    subscription.currency
  );
  const daysText = formatDaysRemaining(daysUntil);

  const ariaLabel = `${subscription.name}, ${formattedAmount}, ${daysText}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // In a real app, this would open details.
    }
  };

  const initial = (subscription.name || "?").charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 bg-card rounded-lg border-l-4 transition-colors",
        urgencyStyles[urgency],
        className
      )}
      role="listitem"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon placeholder - can use subscription.icon in future */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-lg font-semibold text-muted-foreground">
            {initial}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {subscription.name}
            </h3>
            {subscription.categoryId && (
              <CategoryBadge categoryId={subscription.categoryId} size="sm" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <div className="flex flex-col items-end flex-shrink-0 ml-3">
        <span className="font-bold tabular-nums text-foreground">
          {formattedAmount}
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            urgency === "critical" && "text-[var(--color-critical)]",
            urgency === "urgent" && "text-[var(--color-urgent)]",
            urgency === "attention" && "text-[var(--color-attention)]",
            urgency === "subtle" && "text-muted-foreground"
          )}
        >
          {daysText}
        </span>
      </div>
    </div>
  );
}
