import React from "react";
import * as Icons from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POPULAR_ICONS } from "./icon-picker-constants";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="icon-picker">İkon</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="icon-picker" className="h-11 min-h-[44px]">
          <SelectValue placeholder="İkon seç">
            {value &&
              (() => {
                const IconComponent = Icons[
                  value as keyof typeof Icons
                ] as React.ComponentType<{ size?: number }>;
                return IconComponent ? (
                  <span className="flex items-center gap-2">
                    <IconComponent size={16} />
                    {value}
                  </span>
                ) : (
                  value
                );
              })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {POPULAR_ICONS.map((iconName) => {
            const IconComponent = Icons[
              iconName as keyof typeof Icons
            ] as React.ComponentType<{ size?: number }>;
            return (
              <SelectItem
                key={iconName}
                value={iconName}
                className="min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  {IconComponent && <IconComponent size={16} />}
                  {iconName}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
