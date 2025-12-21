import { useEffect } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useFXStore } from "@/stores/fx-store";
import { SummaryCard } from "./summary-card";
import {
  calculateTotalMonthly,
  calculateTotalYearly,
  hasMixedCurrencies,
} from "@/lib/spending-calculations";
import { formatHeroNumber } from "@/lib/formatters";

export function SpendingSummary() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const { rates, fetchRates, isLoading } = useFXStore();

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const totalMonthly = calculateTotalMonthly(subscriptions, rates);
  const totalYearly = calculateTotalYearly(subscriptions, rates);
  const mixed = hasMixedCurrencies(subscriptions);

  const subtext = mixed ? "(Döviz kurları dahil)" : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SummaryCard
        label="Aylık Toplam"
        value={formatHeroNumber(totalMonthly, "TRY")}
        subtext={subtext}
        isLoading={isLoading}
        className="bg-gradient-to-br from-primary/10 via-background to-background"
      />
      <SummaryCard
        label="Yıllık Tahmin"
        value={formatHeroNumber(totalYearly, "TRY")}
        subtext={subtext}
        isLoading={isLoading}
        className="bg-gradient-to-br from-secondary/10 via-background to-background"
      />
    </div>
  );
}
