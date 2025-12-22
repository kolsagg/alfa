import * as React from "react";
import { cn } from "@/lib/utils";
import { categories } from "@/config/categories";
import { formatCurrency } from "@/lib/formatters";
import {
  calculateCategoryBreakdown,
  shouldShowBreakdown,
} from "@/lib/category-breakdown-utils";
import type { Subscription } from "@/types/subscription";
import type { Category } from "@/types/common";

interface CategoryBreakdownProps {
  subscriptions: Subscription[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  className?: string;
}

/**
 * CategoryBreakdown displays spending distribution by category
 * - Groups by currency for multi-currency support
 * - Each category is clickable for filtering
 * - Returns null if only 1 category exists (AC3)
 */
export function CategoryBreakdown({
  subscriptions,
  selectedCategory,
  onCategorySelect,
  className,
}: CategoryBreakdownProps) {
  // Memoize breakdown calculation for performance
  const breakdown = React.useMemo(
    () => calculateCategoryBreakdown(subscriptions),
    [subscriptions]
  );

  // AC3: Don't render if only 1 category
  if (!shouldShowBreakdown(breakdown)) {
    return null;
  }

  const handleCategoryClick = (categoryId: string) => {
    // Toggle: if already selected, deselect (show all)
    if (selectedCategory === categoryId) {
      onCategorySelect(null);
    } else {
      onCategorySelect(categoryId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCategoryClick(categoryId);
    }
  };

  return (
    <section
      className={cn("space-y-4", className)}
      aria-label="Kategori dağılımı"
    >
      {Object.entries(breakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([currency, items]) => (
          <div key={currency} className="space-y-3">
            {/* Currency header (only show if multiple currencies) */}
            {Object.keys(breakdown).length > 1 && (
              <h3 className="text-sm font-medium text-muted-foreground">
                {currency} Kategorileri
              </h3>
            )}

            {/* Category bars */}
            <div className="space-y-2">
              {items.map((item) => {
                const categoryMeta = categories.get(
                  item.categoryId as Category
                );
                const Icon = categoryMeta.icon;
                const isSelected = selectedCategory === item.categoryId;

                return (
                  <div
                    key={`${currency}-${item.categoryId}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCategoryClick(item.categoryId)}
                    onKeyDown={(e) => handleKeyDown(e, item.categoryId)}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "min-h-[44px]", // Accessibility: 44px touch target
                      isSelected && "ring-2 ring-primary bg-muted/30"
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${categoryMeta.label}: ${formatCurrency(
                      item.total,
                      item.currency
                    )}, %${item.percentage}`}
                  >
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md"
                      style={{ backgroundColor: categoryMeta.color }}
                    >
                      <Icon
                        size={16}
                        className="text-white"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: name and amount */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate">
                          {categoryMeta.label}
                        </span>
                        <span className="tabular-nums text-sm text-foreground">
                          {formatCurrency(item.total, item.currency)}
                        </span>
                      </div>

                      {/* Progress bar with ARIA */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div
                          role="progressbar"
                          aria-valuenow={item.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${categoryMeta.label} yüzdesi`}
                          className="flex-1 h-2 bg-secondary rounded-full overflow-hidden"
                        >
                          <div
                            className="h-full rounded-full transition-[width] duration-300 ease-in-out"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: categoryMeta.color,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-xs text-muted-foreground font-medium w-10 text-right">
                          %{item.percentage}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </section>
  );
}
