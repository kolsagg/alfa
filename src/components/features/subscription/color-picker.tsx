import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRESET_COLORS } from "./color-picker-constants";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>Renk</Label>
      <p className="text-xs text-muted-foreground -mt-1">
        Abonelik kartının vurgu rengi
      </p>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={cn(
              "w-full h-11 min-h-[44px] rounded-md border-2 transition-all",
              value === preset.value
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-border hover:border-primary/50"
            )}
            style={{ backgroundColor: preset.value }}
            aria-label={preset.label}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
