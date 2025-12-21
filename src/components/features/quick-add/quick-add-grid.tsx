import { QuickAddTile } from "./quick-add-tile";
import {
  QUICK_ADD_SERVICES,
  type QuickAddService,
} from "@/config/quick-add-services";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface QuickAddGridProps {
  onSelect: (service: QuickAddService) => void;
  onCustomClick?: () => void;
  disabled?: boolean;
}

/**
 * Quick-Add Grid displaying popular subscription services
 * Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
 * Each tile is focusable via Tab, activatable via Enter/Space (built into Button)
 */
export function QuickAddGrid({
  onSelect,
  onCustomClick,
  disabled = false,
}: QuickAddGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {QUICK_ADD_SERVICES.map((service) => (
          <QuickAddTile
            key={service.id}
            service={service}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>

      {onCustomClick && (
        <Button
          variant="ghost"
          onClick={onCustomClick}
          disabled={disabled}
          className="w-full min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Özel Abonelik Ekle
        </Button>
      )}
    </div>
  );
}
