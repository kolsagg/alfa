import * as React from "react";
import { cn } from "@/lib/utils";
import { categories } from "@/config/categories";
import type { Category } from "@/types/common";

interface CategoryBadgeProps {
  categoryId?: Category;
  size?: "sm" | "default";
  className?: string;
  /** Show only icon without label */
  iconOnly?: boolean;
}

/**
 * CategoryBadge displays a category with its icon and label
 * Uses OKLCH colors from category metadata with dark mode support
 */
export const CategoryBadge = React.forwardRef<
  HTMLSpanElement,
  CategoryBadgeProps
>(({ categoryId, size = "default", className, iconOnly = false }, ref) => {
  const category = categories.get(categoryId);
  const Icon = category.icon;
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        category.colorClass,
        className
      )}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {!iconOnly && <span>{category.label}</span>}
    </span>
  );
});
CategoryBadge.displayName = "CategoryBadge";
