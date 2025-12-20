import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/config/categories";
import type { Category } from "@/types/common";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  value?: Category;
  onValueChange: (value: Category) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Optional label shown above the select */
  label?: string;
}

/**
 * CategorySelect wraps shadcn Select with category-specific options
 * Displays all 6 categories with their icons
 */
export function CategorySelect({
  value,
  onValueChange,
  placeholder = "Kategori seç...",
  className,
  disabled,
  label,
}: CategorySelectProps) {
  const options = categories.options();

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className="w-full"
          aria-label={label || "Kategori seçimi"}
        >
          <SelectValue placeholder={placeholder}>
            {value && (
              <span className="flex items-center gap-2">
                {(() => {
                  const category = categories.get(value);
                  const Icon = category.icon;
                  return (
                    <>
                      <Icon size={16} className="shrink-0" />
                      <span>{category.label}</span>
                    </>
                  );
                })()}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0" />
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
