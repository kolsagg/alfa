/**
 * Formats a numeric amount into a currency string
 * @param amount - Number to format
 * @param currency - Currency code (TRY, USD, EUR)
 * @returns Formatted currency string (e.g., "99.99 ₺")
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  const symbol = symbols[currency] || currency;
  return `${amount.toFixed(2)} ${symbol}`;
}

/**
 * Formats large hero numbers with tabular figures support
 */
export function formatHeroNumber(
  amount: number,
  currency: string = "TRY"
): string {
  const formatter = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const symbol = currency === "TRY" ? "₺" : currency;
  return `${symbol}${formatter.format(amount)}`;
}
