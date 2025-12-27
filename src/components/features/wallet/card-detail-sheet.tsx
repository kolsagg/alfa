/**
 * CardDetailSheet - Bottom sheet showing card statement details
 *
 * Story 6.5: AC1, AC3, AC5
 * - Shows "Bu Ekstre" (This Statement) and "Sonraki Ekstre" (Next Statement) sections
 * - Lists subscriptions with their calculated cost for each period
 * - Statement progress bar showing time remaining in current cycle
 * - Only visible for credit cards with cutoff date
 */

import { useMemo } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, ArrowRight, CreditCard, Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import {
  calculateActualStatementAmount,
  calculateOccurrencesInPeriod,
  renderSpendingDisplay,
  formatCurrencyAmount,
  type SpendingInfo,
} from "@/lib/spending-calculator";
import { useSubscriptionStore } from "@/stores/subscription-store";
import type { Card } from "@/types/card";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";

interface CardDetailSheetProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (card: Card) => void;
  onDelete?: (card: Card) => void;
}

interface SubscriptionInPeriod {
  subscription: Subscription;
  occurrences: number;
  total: number;
}

/**
 * Calculate subscriptions with their occurrences in a period
 */
function getSubscriptionsInPeriod(
  subscriptions: Subscription[],
  cardId: string,
  start: Date,
  end: Date
): SubscriptionInPeriod[] {
  const cardSubs = subscriptions.filter(
    (sub) => sub.cardId === cardId && sub.isActive
  );

  return cardSubs
    .map((sub) => {
      const amounts = calculateOccurrencesInPeriod(sub, start, end);
      return {
        subscription: sub,
        occurrences: amounts.length,
        total: amounts.reduce((sum, amt) => sum + amt, 0),
      };
    })
    .filter((item) => item.occurrences > 0)
    .sort((a, b) => b.total - a.total);
}

export function CardDetailSheet({
  card,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CardDetailSheetProps) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  // Calculate statement totals if card has cutoff date
  const statementData = useMemo(() => {
    if (!card || card.type !== "credit" || !card.cutoffDate) {
      return null;
    }

    const totals = calculateActualStatementAmount(
      card.id,
      card.cutoffDate,
      subscriptions
    );

    const currentSubs = getSubscriptionsInPeriod(
      subscriptions,
      card.id,
      totals.currentPeriod.start,
      totals.currentPeriod.end
    );

    const nextSubs = getSubscriptionsInPeriod(
      subscriptions,
      card.id,
      totals.nextPeriod.start,
      totals.nextPeriod.end
    );

    // Calculate progress percentage (days elapsed / total days)
    const totalDays = Math.ceil(
      (totals.currentPeriod.end.getTime() -
        totals.currentPeriod.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const elapsedDays = totalDays - totals.daysRemaining;
    const progressPercent = Math.round((elapsedDays / totalDays) * 100);

    return {
      totals,
      currentSubs,
      nextSubs,
      progressPercent,
    };
  }, [card, subscriptions]);

  if (!card || !statementData) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {card.name}
            </SheetTitle>
            <div className="flex items-center gap-1 mr-8">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(card);
                  }}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label={WALLET_STRINGS.EDIT_CARD}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(card);
                  }}
                  className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                  aria-label={WALLET_STRINGS.DELETE_CARD}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <SheetDescription>
            {WALLET_STRINGS.CUTOFF_DAY}: {card.cutoffDate}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-4">
          {/* Statement Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {WALLET_STRINGS.STATEMENT_PROGRESS}
              </span>
              <span className="font-medium">
                {statementData.totals.daysRemaining}{" "}
                {WALLET_STRINGS.DAYS_REMAINING}
              </span>
            </div>
            <Progress
              value={statementData.progressPercent}
              className="h-2"
              data-testid="statement-progress"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {format(statementData.totals.currentPeriod.start, "d MMM", {
                  locale: tr,
                })}
              </span>
              <span>
                {format(statementData.totals.currentPeriod.end, "d MMM", {
                  locale: tr,
                })}
              </span>
            </div>
          </div>

          {/* This Statement Section */}
          <StatementSection
            title={WALLET_STRINGS.THIS_STATEMENT}
            spending={statementData.totals.currentBill}
            subscriptions={statementData.currentSubs}
            variant="current"
          />

          {/* Next Statement Section */}
          <StatementSection
            title={WALLET_STRINGS.NEXT_STATEMENT}
            spending={statementData.totals.nextBill}
            subscriptions={statementData.nextSubs}
            variant="next"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Statement section with subscription list
 */
interface StatementSectionProps {
  title: string;
  spending: SpendingInfo;
  subscriptions: SubscriptionInPeriod[];
  variant: "current" | "next";
}

function StatementSection({
  title,
  spending,
  subscriptions,
  variant,
}: StatementSectionProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        variant === "current"
          ? "border-primary/30 bg-primary/5"
          : "border-muted bg-muted/30"
      )}
      data-testid={`statement-section-${variant}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          {variant === "current" ? (
            <Calendar className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {title}
        </h3>
        <span className="text-lg font-bold tabular-nums">
          {renderSpendingDisplay(
            spending,
            WALLET_STRINGS.NO_SUBSCRIPTIONS,
            WALLET_STRINGS.SPENDING_MIXED_CURRENCY
          )}
        </span>
      </div>

      {subscriptions.length > 0 ? (
        <ul className="space-y-2">
          {subscriptions.map((item) => (
            <li
              key={item.subscription.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                {item.subscription.icon && (
                  <span className="text-base flex-shrink-0">
                    {item.subscription.icon}
                  </span>
                )}
                <span className="truncate">{item.subscription.name}</span>
                {item.occurrences > 1 && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ×{item.occurrences}
                  </span>
                )}
              </span>
              <span className="font-medium tabular-nums flex-shrink-0 ml-2">
                {formatCurrencyAmount(item.total, item.subscription.currency)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {WALLET_STRINGS.NO_SUBSCRIPTIONS}
        </p>
      )}
    </div>
  );
}

export default CardDetailSheet;
