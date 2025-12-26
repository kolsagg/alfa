import { format } from "date-fns";
import { tr } from "date-fns/locale";
import * as Icons from "lucide-react";
import { CreditCard } from "lucide-react";
import type { Subscription } from "@/types/subscription";
import { CategoryBadge } from "@/components/ui/category-badge";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCardStore } from "@/stores/card-store";
import { SUBSCRIPTION_STRINGS } from "@/lib/i18n/subscriptions";

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick?: (subscription: Subscription) => void;
  className?: string;
}

/**
 * SubscriptionCard displays a subscription with its details
 * - Shows icon, name, amount, currency, next payment date, category
 * - Shows assigned card info (Story 6.3)
 * - Keyboard accessible with Enter/Space triggering click
 * - Hover effect for visual feedback
 */
export function SubscriptionCard({
  subscription,
  onClick,
  className,
}: SubscriptionCardProps) {
  // Get card info if assigned
  const getCardById = useCardStore((state) => state.getCardById);
  const assignedCard = subscription.cardId
    ? getCardById(subscription.cardId)
    : undefined;

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

  // Dynamic icon rendering with fallback
  const IconComponent =
    subscription.icon && Icons[subscription.icon as keyof typeof Icons]
      ? (Icons[subscription.icon as keyof typeof Icons] as React.ComponentType<{
          size?: number;
          className?: string;
        }>)
      : Icons.CreditCard;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex items-center gap-4 rounded-lg border bg-card p-4 transition-all",
        "cursor-pointer hover:shadow-md hover:scale-[1.01]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-h-[80px]",
        className
      )}
      aria-label={`${subscription.name}, ${formattedAmount}, sonraki ödeme ${formattedDate}`}
    >
      {/* Left: Icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg"
        style={{
          backgroundColor: subscription.color || "var(--color-primary)",
        }}
      >
        <IconComponent size={20} className="text-white" />
      </div>

      {/* Middle: Name and Category */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-medium text-foreground truncate">
          {subscription.name}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge categoryId={subscription.categoryId} size="sm" />
          {/* Card info pill (Story 6.3) */}
          {assignedCard ? (
            <div className="flex items-center gap-1 text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">
              <CreditCard size={10} className="shrink-0" />
              <span className="truncate max-w-[60px]" title={assignedCard.name}>
                *{assignedCard.lastFourDigits}
              </span>
            </div>
          ) : subscription.cardId ? (
            /* Orphan card reference - show graceful fallback */
            <div className="flex items-center gap-1 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              <CreditCard size={10} className="shrink-0 opacity-50" />
              <span>{SUBSCRIPTION_STRINGS.NO_CARD_ASSIGNED}</span>
            </div>
          ) : null}
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
          {subscription.billingCycle === "custom" &&
            subscription.customDays &&
            `${subscription.customDays} günde bir`}
        </span>
      </div>
    </div>
  );
}
