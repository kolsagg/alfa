/**
 * useStatementSpending Hook
 *
 * Story 6.5: AC1, AC2, AC5
 * - Calculates actual statement amounts for credit cards
 * - Memoized for performance (AC6)
 * - Supports toggle between normalized and actual spending modes
 */

import { useMemo } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useCardStore } from "@/stores/card-store";
import {
  calculateCardSpending,
  calculateActualStatementAmount,
  type SpendingInfo,
  type StatementTotals,
} from "@/lib/spending-calculator";

export type SpendingMode = "normalized" | "actual";

export interface StatementSpending {
  /** Current spending mode */
  mode: SpendingMode;
  /** Whether card supports statement view (credit with cutoff) */
  supportsStatement: boolean;
  /** Normalized monthly spending (Story 6.4) */
  normalized: SpendingInfo;
  /** Statement-based spending (Story 6.5) - only available for credit cards */
  statement: StatementTotals | null;
  /** Active spending info based on current mode */
  activeSpending: SpendingInfo;
}

/**
 * Hook for per-card spending with statement support
 *
 * @param cardId - Card ID to calculate spending for
 * @param mode - Whether to show "normalized" (monthly average) or "actual" (statement) view
 * @returns StatementSpending object with spending info based on mode
 */
export function useStatementSpending(
  cardId: string,
  mode: SpendingMode = "normalized"
): StatementSpending {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const cards = useCardStore((state) => state.cards);

  return useMemo(() => {
    const card = cards.find((c) => c.id === cardId);

    // Calculate normalized spending (always available)
    const normalized = calculateCardSpending(cardId, subscriptions);

    // Check if card supports statement view
    const supportsStatement =
      card?.type === "credit" && card.cutoffDate !== undefined;

    // Calculate statement spending if applicable
    let statement: StatementTotals | null = null;
    if (supportsStatement && card?.cutoffDate) {
      statement = calculateActualStatementAmount(
        cardId,
        card.cutoffDate,
        subscriptions
      );
    }

    // Determine active spending based on mode
    const activeSpending =
      mode === "actual" && statement ? statement.currentBill : normalized;

    return {
      mode,
      supportsStatement,
      normalized,
      statement,
      activeSpending,
    };
  }, [cardId, subscriptions, cards, mode]);
}

/**
 * Hook for getting statement spending for all cards
 * Used by dashboard/overview components
 */
export function useAllCardsStatementSpending() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const cards = useCardStore((state) => state.cards);

  return useMemo(() => {
    return cards.map((card) => {
      const normalized = calculateCardSpending(card.id, subscriptions);
      const supportsStatement =
        card.type === "credit" && card.cutoffDate !== undefined;

      let statement: StatementTotals | null = null;
      if (supportsStatement && card.cutoffDate) {
        statement = calculateActualStatementAmount(
          card.id,
          card.cutoffDate,
          subscriptions
        );
      }

      return {
        card,
        normalized,
        supportsStatement,
        statement,
      };
    });
  }, [cards, subscriptions]);
}
