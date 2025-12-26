import React, { useMemo } from "react";
import { CreditCard, Wallet } from "lucide-react";
import type { Card } from "@/types/card";
import {
  renderSpendingDisplay,
  type SpendingInfo,
} from "@/lib/spending-calculator";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import { PRESET_COLORS } from "@/components/features/subscription/color-picker-constants";
import { getContrastType } from "@/lib/colors";
import { cn } from "@/lib/utils";

/**
 * CardVisual - Visual representation of a payment card
 *
 * Story 6.2: AC2
 * Story 6.2b: AC4 - Enhanced with type badge, bank name, conditional cutoff
 * Story 6.4: AC1, AC2, AC4 - Per-card spending display with multi-currency support
 * - Glassmorphism styling with OKLCH color support
 * - Standard credit card aspect ratio (1.586)
 * - Displays: Card Name, Masked digits (**** 1234), formatted Cut-off date
 * - Type badge: "Kredi" or "Banka"
 * - Bank name (optional)
 * - Spending info with multi-currency support
 * - Next statement hint for credit cards
 * - Privacy Note: "Sadece son 4 hane saklanır" (NFR06)
 * - 44x44px touch target compliance
 */

interface CardVisualProps {
  card: Card;
  spending?: SpendingInfo;
  onClick?: () => void;
  className?: string;
}

// Get default color from preset palette
const DEFAULT_CARD_COLOR = PRESET_COLORS[3]?.value || "oklch(0.6 0.2 250)"; // Blue

export const CardVisual = React.memo(function CardVisual({
  card,
  spending,
  onClick,
  className = "",
}: CardVisualProps) {
  const cardColor = card.color || DEFAULT_CARD_COLOR;
  const cardType = card.type ?? "credit";

  // Determine ideal text color based on background lightness
  // Since we use opacity-40 for the color layer, we need to consider contrast
  const contrastType = useMemo(() => getContrastType(cardColor), [cardColor]);

  const textColorClass =
    contrastType === "dark"
      ? "text-slate-900 group-hover:text-black"
      : "text-white group-hover:text-white";

  const mutedTextClass =
    contrastType === "dark"
      ? "text-slate-800/70 group-hover:text-slate-900/80"
      : "text-white/70 group-hover:text-white/90";

  // Badge styles based on card type
  const badgeClass =
    cardType === "credit"
      ? "bg-amber-500/30 text-amber-900 dark:text-amber-200"
      : "bg-emerald-500/30 text-emerald-900 dark:text-emerald-200";

  const CardIcon = cardType === "credit" ? CreditCard : Wallet;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full aspect-[1.586] overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all hover:border-white/30 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-black/10 min-h-[44px]",
        className
      )}
      aria-label={`${card.name} - **** ${card.lastFourDigits}`}
      data-testid={`card-visual-${card.id}`}
    >
      {/* Dynamic Background Color Layer */}
      <div
        className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-50"
        style={{ backgroundColor: cardColor }}
        data-testid="card-visual-color-layer"
      />

      {/* Card Type Badge (Story 6.2b: AC4) */}
      <span
        className={cn(
          "absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm z-10",
          badgeClass
        )}
        data-testid="card-visual-badge"
      >
        {cardType === "credit"
          ? WALLET_STRINGS.CARD_BADGE_CREDIT
          : WALLET_STRINGS.CARD_BADGE_DEBIT}
      </span>

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-4 pt-8 text-left">
        {/* Top Section: Card Icon & Name */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p
              className={cn(
                "text-lg font-semibold line-clamp-1 transition-colors",
                textColorClass
              )}
              data-testid="card-visual-name"
            >
              {card.name}
            </p>
            {/* Bank Name (Story 6.2b: AC4) */}
            {card.bankName && (
              <p
                className={cn(
                  "text-xs font-medium transition-colors line-clamp-1",
                  mutedTextClass
                )}
                data-testid="card-visual-bank"
              >
                {card.bankName}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors flex-shrink-0",
              contrastType === "dark" ? "bg-black/10" : "bg-white/20"
            )}
            aria-hidden="true"
          >
            <CardIcon
              className={cn(
                "h-5 w-5 transition-colors",
                contrastType === "dark" ? "text-black/70" : "text-white/80"
              )}
            />
          </div>
        </div>

        {/* Middle Section: Spending Display (Story 6.4: AC1, AC2) */}
        {spending && (
          <div
            className="flex-shrink-0 h-8 flex items-center"
            data-testid="card-visual-spending"
          >
            <p
              className={cn(
                "text-lg font-bold tabular-nums transition-colors",
                textColorClass
              )}
            >
              {renderSpendingDisplay(
                spending,
                WALLET_STRINGS.NO_SUBSCRIPTIONS,
                WALLET_STRINGS.SPENDING_MIXED_CURRENCY
              )}
            </p>
          </div>
        )}

        {/* Bottom Section: Card Number & Cut-off */}
        <div className="space-y-1">
          {/* Masked Card Number */}
          <p
            className={cn(
              "font-mono text-xl tracking-wider transition-colors",
              textColorClass
            )}
            data-testid="card-visual-number"
          >
            •••• •••• •••• {card.lastFourDigits}
          </p>

          {/* Cut-off Date / Next Statement - Only for credit cards (Story 6.4: AC4) */}
          <div className="flex items-center justify-between">
            {cardType === "credit" && card.cutoffDate ? (
              <p
                className={cn("text-xs transition-colors", mutedTextClass)}
                data-testid="card-visual-cutoff"
              >
                {WALLET_STRINGS.CUTOFF_DAY}: {card.cutoffDate}
              </p>
            ) : (
              <p
                className={cn("text-xs transition-colors", mutedTextClass)}
                data-testid="card-visual-privacy"
              >
                {WALLET_STRINGS.PRIVACY_NOTE}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});
