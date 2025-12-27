import { ChevronDown, CreditCard } from "lucide-react";
import * as Icons from "lucide-react";
import { useState } from "react";
import {
  renderSpendingDisplay,
  formatCurrencyAmount,
  type SpendingInfo,
} from "@/lib/spending-calculator";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/types/subscription";

/**
 * UnassignedSpending - Displays spending for unassigned subscriptions
 *
 * Story 6.4: AC3
 * - Shows "Kartsız Abonelikler" section
 * - Displays total monthly spending per currency
 * - Expandable list showing subscription names and amounts
 */

interface UnassignedSpendingProps {
  spending: SpendingInfo;
  subscriptions: Subscription[];
  className?: string;
}

export function UnassignedSpending({
  spending,
  subscriptions,
  className,
}: UnassignedSpendingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no unassigned subscriptions
  if (spending.subscriptionCount === 0) {
    return null;
  }

  // Get icon component for subscription
  const getIconComponent = (iconName?: string) => {
    if (iconName && Icons[iconName as keyof typeof Icons]) {
      return Icons[iconName as keyof typeof Icons] as React.ComponentType<{
        size?: number;
        className?: string;
      }>;
    }
    return CreditCard;
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4",
        className
      )}
      data-testid="unassigned-spending"
    >
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 min-h-[44px]"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={WALLET_STRINGS.UNASSIGNED_TITLE}
        data-testid="unassigned-spending-toggle"
      >
        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Title & Count */}
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm" data-testid="unassigned-title">
            {WALLET_STRINGS.UNASSIGNED_TITLE}
          </p>
          <p className="text-xs text-muted-foreground">
            {spending.subscriptionCount} abonelik
          </p>
        </div>

        {/* Spending Amount */}
        <p
          className="text-lg font-bold tabular-nums"
          data-testid="unassigned-spending-amount"
        >
          {renderSpendingDisplay(
            spending,
            WALLET_STRINGS.NO_SUBSCRIPTIONS,
            WALLET_STRINGS.SPENDING_MIXED_CURRENCY
          )}
        </p>

        {/* Expand Icon */}
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded Content - Subscription List */}
      {isExpanded && (
        <div
          className="mt-3 pt-3 border-t border-muted-foreground/20 space-y-2"
          data-testid="unassigned-spending-details"
        >
          <p className="text-xs text-muted-foreground mb-3">
            {WALLET_STRINGS.UNASSIGNED_DESCRIPTION}
          </p>
          {subscriptions.map((sub) => {
            const IconComponent = getIconComponent(sub.icon);
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: sub.color || "var(--muted)" }}
                  >
                    <IconComponent size={14} className="text-white" />
                  </div>
                  <span className="text-sm truncate">{sub.name}</span>
                </div>
                <span className="text-sm font-medium tabular-nums flex-shrink-0">
                  {formatCurrencyAmount(sub.amount, sub.currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
