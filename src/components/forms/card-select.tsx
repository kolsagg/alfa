import { CreditCard, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/stores/card-store";
import { SUBSCRIPTION_STRINGS } from "@/lib/i18n/subscriptions";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import { cn } from "@/lib/utils";

export interface CardSelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Callback when user wants to navigate to wallet (for adding cards) */
  onNavigateToWallet?: () => void;
}

/** Sentinel value for "no card selected" option */
const NO_CARD_VALUE = "__no_card__";

/**
 * CardSelect component for subscription forms
 * Allows selecting a card from the card store
 * Matches CategorySelect UI patterns
 */
export function CardSelect({
  value,
  onValueChange,
  label = SUBSCRIPTION_STRINGS.CARD_SELECT_LABEL,
  placeholder = SUBSCRIPTION_STRINGS.CARD_SELECT_PLACEHOLDER,
  disabled,
  className,
  onNavigateToWallet,
}: CardSelectProps) {
  // Use optimized selector to get only card data needed
  const cards = useCardStore((state) => state.cards);

  const hasCards = cards.length > 0;

  // Find selected card for display
  const selectedCard = value ? cards.find((c) => c.id === value) : undefined;

  // Handle value change - convert sentinel back to undefined
  const handleValueChange = (newValue: string) => {
    if (newValue === NO_CARD_VALUE) {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {hasCards ? (
        <Select
          value={value || NO_CARD_VALUE}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-full h-11 min-h-[44px]"
            aria-label={label}
          >
            <SelectValue placeholder={placeholder}>
              {selectedCard ? (
                <span className="flex items-center gap-2">
                  <CreditCard size={16} className="shrink-0" />
                  <span className="truncate">{selectedCard.name}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0",
                      selectedCard.type === "credit"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {selectedCard.type === "credit"
                      ? WALLET_STRINGS.CARD_BADGE_CREDIT
                      : WALLET_STRINGS.CARD_BADGE_DEBIT}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    *{selectedCard.lastFourDigits}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard size={16} className="shrink-0" />
                  <span>{placeholder}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {/* No card option */}
            <SelectItem value={NO_CARD_VALUE} className="min-h-[44px]">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CreditCard size={16} className="shrink-0 opacity-50" />
                <span>{SUBSCRIPTION_STRINGS.CARD_SELECT_PLACEHOLDER}</span>
              </span>
            </SelectItem>

            {/* Card options */}
            {cards.map((card) => (
              <SelectItem
                key={card.id}
                value={card.id}
                className="min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  <CreditCard size={16} className="shrink-0" />
                  <span className="truncate">{card.name}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0",
                      card.type === "credit"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {card.type === "credit"
                      ? WALLET_STRINGS.CARD_BADGE_CREDIT
                      : WALLET_STRINGS.CARD_BADGE_DEBIT}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    *{card.lastFourDigits}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        /* Empty state: No cards available */
        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed bg-muted/30">
          <Wallet size={18} className="text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground flex-1">
            {SUBSCRIPTION_STRINGS.NO_CARDS_AVAILABLE}
          </span>
          {onNavigateToWallet && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNavigateToWallet}
              disabled={disabled}
              className="shrink-0"
            >
              {SUBSCRIPTION_STRINGS.GO_TO_WALLET}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
