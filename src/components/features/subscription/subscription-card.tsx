import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Subscription } from "@/types/subscription";
import { CategoryBadge } from "@/components/ui/category-badge";
import { formatCurrency } from "./utils";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick?: (subscription: Subscription) => void;
  className?: string;
}

/**
 * SubscriptionCard displays a subscription with its details
 * - Shows name, amount, currency, next payment date, category
 * - Keyboard accessible with Enter/Space triggering click
 * - Hover effect for visual feedback
 */
export function SubscriptionCard({
  subscription,
  onClick,
  className,
}: SubscriptionCardProps) {
  const handleClick = () => {
    onClick?.(subscription);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(subscription);
    }
  };

  const formattedAmount = formatCurrency(
    subscription.amount,
    subscription.currency
  );

  const formattedDate = format(
    new Date(subscription.nextPaymentDate),
    "d MMM yyyy",
    { locale: tr }
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-all",
        "cursor-pointer hover:shadow-md hover:scale-[1.01]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-h-[80px]",
        className
      )}
      aria-label={`${subscription.name}, ${formattedAmount}, sonraki ödeme ${formattedDate}`}
    >
      {/* Left: Name and Category */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-medium text-foreground truncate">
          {subscription.name}
        </span>
        <div className="flex items-center gap-2">
          <CategoryBadge categoryId={subscription.categoryId} size="sm" />
          <span className="text-xs text-muted-foreground truncate">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Right: Amount */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-lg font-semibold text-foreground">
          {formattedAmount}
        </span>
        <span className="text-xs text-muted-foreground">
          {subscription.billingCycle === "monthly" && "Aylık"}
          {subscription.billingCycle === "yearly" && "Yıllık"}
          {subscription.billingCycle === "weekly" && "Haftalık"}
          {subscription.billingCycle === "custom" && "Özel"}
        </span>
      </div>
    </div>
  );
}
