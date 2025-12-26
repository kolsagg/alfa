import React from "react";
import * as Icons from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { POPULAR_ICONS } from "./icon-picker-constants";

const ICON_LABELS: Record<string, string> = {
  Tv: "Televizyon",
  Music: "Müzik Notası",
  Briefcase: "Çanta",
  GraduationCap: "Kep",
  HeartPulse: "Nabız",
  Archive: "Kutu",
  Smartphone: "Telefon",
  Cloud: "Bulut",
  Book: "Kitap",
  Coffee: "Kahve",
  Gamepad2: "Oyun Kolu",
  Dumbbell: "Ağırlık",
  Sparkles: "Işıltı",
  Github: "Github",
  Youtube: "Youtube",
  ShoppingCart: "Sepet",
  Globe: "Dünya",
};

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Get selected icon component safely
  const IconComponent = value
    ? (Icons[value as keyof typeof Icons] as React.ComponentType<{
        size?: number;
        className?: string;
      }>)
    : null;

  const displayLabel = ICON_LABELS[value] || value;

  return (
    <div className="space-y-2">
      <Label>İkon</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 px-3 font-normal"
            disabled={disabled}
          >
            {value ? (
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent size={20} />}
                <span className="text-foreground">{displayLabel}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">İkon seç</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-3" align="start">
          <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {POPULAR_ICONS.map((iconName) => {
              const Icon = Icons[
                iconName as keyof typeof Icons
              ] as React.ComponentType<{
                size?: number;
                className?: string;
              }>;

              if (!Icon) return null;

              const isSelected = value === iconName;
              const label = ICON_LABELS[iconName] || iconName;

              return (
                <Button
                  key={iconName}
                  variant={isSelected ? "default" : "ghost"}
                  type="button"
                  className={cn(
                    "h-10 w-10 p-0 rounded-md transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                  )}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  title={label}
                >
                  <Icon size={20} />
                  <span className="sr-only">{label}</span>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
