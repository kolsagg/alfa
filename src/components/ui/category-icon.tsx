import * as React from "react";
import { categories } from "@/config/categories";
import type { Category } from "@/types/common";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  categoryId?: Category;
  size?: number;
  className?: string;
}

/**
 * CategoryIcon renders just the icon for a category
 * Useful when you need the icon without the badge styling
 */
export const CategoryIcon = React.forwardRef<SVGSVGElement, CategoryIconProps>(
  ({ categoryId, size = 16, className }, ref) => {
    const category = categories.get(categoryId);
    const Icon = category.icon;

    return (
      <Icon
        ref={ref}
        size={size}
        className={cn("shrink-0", className)}
        aria-hidden="true"
      />
    );
  }
);
CategoryIcon.displayName = "CategoryIcon";
