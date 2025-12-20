import { Button } from "@/components/ui/button";
import type { QuickAddService } from "@/config/quick-add-services";
import { categories } from "@/config/categories";
import { cn } from "@/lib/utils";

export interface QuickAddTileProps {
  service: QuickAddService;
  onSelect: (service: QuickAddService) => void;
  disabled?: boolean;
}

/**
 * Individual tile for Quick-Add Grid
 * Displays service icon and name with 44px minimum touch target
 * Uses category color for hover/active states
 */
export function QuickAddTile({
  service,
  onSelect,
  disabled = false,
}: QuickAddTileProps) {
  const Icon = service.Icon;
  const categoryMeta = categories.get(service.categoryId);

  return (
    <Button
      variant="outline"
      onClick={() => onSelect(service)}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-3",
        "min-h-[44px] min-w-[44px] h-auto",
        "transition-colors",
        "hover:bg-[var(--hover-bg)] focus-visible:ring-2 focus-visible:ring-primary"
      )}
      style={
        {
          // Subtle category color on hover via CSS variable
          "--hover-bg": `color-mix(in oklch, ${categoryMeta.color} 10%, transparent)`,
        } as React.CSSProperties
      }
      aria-label={`${service.name} aboneliği ekle`}
    >
      <Icon className="h-5 w-5" style={{ color: categoryMeta.color }} />
      <span className="text-xs font-medium text-center leading-tight">
        {service.name}
      </span>
    </Button>
  );
}
