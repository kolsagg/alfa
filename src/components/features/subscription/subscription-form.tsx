import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { useSubscriptionStore } from "@/stores/subscription-store";
import type { SubscriptionInput } from "@/stores/subscription-store";
import { SubscriptionSchema } from "@/types/subscription";
import type { Currency, BillingCycle, Category } from "@/types/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelect } from "@/components/forms/category-select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { categories } from "@/config/categories";
import { calculateNextPaymentDate, formatCurrency } from "./utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

export interface SubscriptionFormProps {
  initialValues?: Partial<SubscriptionInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRESET_COLORS = [
  { name: "Primary", value: "oklch(0.75 0.12 180)" },
  { name: "Secondary", value: "oklch(0.65 0.15 260)" },
  { name: "Attention", value: "oklch(0.8 0.15 85)" },
  { name: "Urgent", value: "oklch(0.65 0.2 25)" },
  { name: "Critical", value: "oklch(0.55 0.25 25)" },
  { name: "Success", value: "oklch(0.7 0.15 165)" },
  { name: "Subtle", value: "oklch(0.85 0.05 220)" },
  { name: "Muted", value: "oklch(0.6 0.05 250)" },
];

const POPULAR_ICONS = [
  "Tv",
  "Music",
  "Briefcase",
  "GraduationCap",
  "HeartPulse",
  "Archive",
  "Smartphone",
  "Cloud",
  "Book",
  "Coffee",
  "Gamepad2",
  "Dumbbell",
];

export function SubscriptionForm({
  initialValues,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) {
  // Form state
  const [name, setName] = useState(initialValues?.name || "");
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || "");
  const [currency, setCurrency] = useState<Currency>(
    initialValues?.currency || "TRY"
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    initialValues?.billingCycle || "monthly"
  );
  const [firstPaymentDate, setFirstPaymentDate] = useState<Date | undefined>(
    initialValues?.nextPaymentDate
      ? new Date(initialValues.nextPaymentDate)
      : new Date()
  );
  const [category, setCategory] = useState<Category | undefined>(
    initialValues?.categoryId
  );
  const [color, setColor] = useState(initialValues?.color || "");
  const [icon, setIcon] = useState(initialValues?.icon || "");
  const [cardId, setCardId] = useState(initialValues?.cardId || "");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [manuallySetColor, setManuallySetColor] = useState(
    !!initialValues?.color
  );
  const [manuallySetIcon, setManuallySetIcon] = useState(!!initialValues?.icon);

  // Store
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription
  );

  // Auto-populate color/icon when category changes
  useEffect(() => {
    if (category && !manuallySetColor) {
      const categoryData = categories.get(category);
      setColor(categoryData.color);
    }
    if (category && !manuallySetIcon) {
      const categoryData = categories.get(category);
      const IconComponent = categoryData.icon;
      // Get icon name from the component
      const iconName = Object.keys(Icons).find(
        (key) => Icons[key as keyof typeof Icons] === IconComponent
      );
      setIcon(iconName || "");
    }
  }, [category, manuallySetColor, manuallySetIcon]);

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setAmount("");
    setCurrency("TRY");
    setBillingCycle("monthly");
    setFirstPaymentDate(new Date());
    setCategory(undefined);
    setColor("");
    setIcon("");
    setCardId("");
    setManuallySetColor(false);
    setManuallySetIcon(false);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Client-side validation for empty required fields
      const validationErrors: Record<string, string> = {};

      if (!name.trim()) {
        validationErrors.name = "İsim gereklidir";
      } else if (name.length > 100) {
        validationErrors.name = "İsim 100 karakterden fazla olamaz";
      }

      if (!amount || isNaN(parseFloat(amount))) {
        validationErrors.amount = "Geçerli bir tutar giriniz";
      } else if (parseFloat(amount) <= 0) {
        validationErrors.amount = "Tutar pozitif olmalıdır";
      }

      if (!firstPaymentDate) {
        validationErrors.firstPaymentDate = "İlk ödeme tarihi gereklidir";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);

        // Focus first invalid field
        const firstErrorField = Object.keys(validationErrors)[0];
        const fieldElement = document.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        if (fieldElement) {
          fieldElement.focus();
        }

        setIsSubmitting(false);
        return;
      }

      // Calculate nextPaymentDate before validation
      const nextPaymentDate = calculateNextPaymentDate(
        firstPaymentDate || new Date(),
        billingCycle
      );

      // Get category defaults if not set
      const finalCategory = category || "other";
      const categoryData = categories.get(finalCategory);
      const finalColor = color || categoryData.color;
      const finalIcon =
        icon ||
        Object.keys(Icons).find(
          (key) => Icons[key as keyof typeof Icons] === categoryData.icon
        ) ||
        "Archive";

      const formData: SubscriptionInput = {
        name,
        amount: parseFloat(amount),
        currency,
        billingCycle,
        nextPaymentDate: nextPaymentDate.toISOString(),
        isActive: true,
        categoryId: finalCategory,
        color: finalColor,
        icon: finalIcon,
        cardId: cardId || undefined,
      };

      // Custom validation schema with Turkish error messages
      const inputSchema = SubscriptionSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }).extend({
        name: SubscriptionSchema.shape.name
          .min(1, "İsim gereklidir")
          .max(100, "İsim 100 karakterden fazla olamaz"),
        amount: SubscriptionSchema.shape.amount.positive(
          "Tutar pozitif olmalıdır"
        ),
      });

      const result = inputSchema.safeParse(formData);

      if (!result.success) {
        const fieldErrors = Object.fromEntries(
          result.error.issues.map((e) => [e.path[0], e.message])
        );
        setErrors(fieldErrors);

        // Focus first invalid field
        const firstErrorField = Object.keys(fieldErrors)[0];
        const fieldElement = document.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        if (fieldElement) {
          fieldElement.focus();
        }

        setIsSubmitting(false);
        return;
      }

      const created = addSubscription(formData);

      if (!created) {
        toast.error("Abonelik eklenemedi", {
          description: "Veri doğrulama hatası",
        });
        setIsSubmitting(false);
        return;
      }

      toast.success(`${created.name} eklendi`, {
        description: `${formatCurrency(created.amount, created.currency)}/ay`,
      });

      resetForm();
      onSuccess?.();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          error.message.includes("QuotaExceeded"))
      ) {
        toast.error("Depolama alanı dolu", {
          description: "Verilerinizi dışa aktarın",
        });
      } else {
        toast.error("Beklenmeyen hata");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="space-y-4"
    >
      {/* Name */}
      <div>
        <Label htmlFor="name">
          Abonelik İsmi <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Netflix, Spotify vb."
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="h-11 min-h-[44px]"
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      {/* Amount & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">
            Tutar <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className="h-11 min-h-[44px]"
          />
          {errors.amount && (
            <p id="amount-error" className="mt-1 text-sm text-destructive">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currency">Para Birimi</Label>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v as Currency)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="currency" className="h-11 min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRY">₺ TRY</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Cycle */}
      <div>
        <Label htmlFor="billingCycle">Periyot</Label>
        <Select
          value={billingCycle}
          onValueChange={(v) => setBillingCycle(v as BillingCycle)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="billingCycle" className="h-11 min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Aylık</SelectItem>
            <SelectItem value="yearly">Yıllık</SelectItem>
            <SelectItem value="weekly">Haftalık</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* First Payment Date */}
      <div>
        <Label htmlFor="firstPaymentDate">
          İlk Ödeme Tarihi <span className="text-destructive">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="firstPaymentDate"
              variant="outline"
              className={cn(
                "w-full h-11 min-h-[44px] justify-start text-left font-normal",
                !firstPaymentDate && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {firstPaymentDate ? (
                format(firstPaymentDate, "PPP", { locale: tr })
              ) : (
                <span>Tarih seç</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={firstPaymentDate}
              onSelect={setFirstPaymentDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {firstPaymentDate && firstPaymentDate < new Date() && (
          <p className="mt-1 text-sm text-muted-foreground">
            Bir sonraki ödeme:{" "}
            {format(
              calculateNextPaymentDate(firstPaymentDate, billingCycle),
              "PPP",
              { locale: tr }
            )}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Kategori Seç</Label>
        <CategorySelect
          value={category}
          onValueChange={setCategory}
          disabled={isSubmitting}
        />
      </div>

      {/* Color Picker */}
      <div>
        <Label>Renk</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                setColor(preset.value);
                setManuallySetColor(true);
              }}
              className={cn(
                "w-full h-11 min-h-[44px] rounded-md border-2 transition-all",
                color === preset.value
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              )}
              style={{ backgroundColor: preset.value }}
              aria-label={preset.name}
              disabled={isSubmitting}
            />
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div>
        <Label htmlFor="icon">İkon</Label>
        <Select
          value={icon}
          onValueChange={(v) => {
            setIcon(v);
            setManuallySetIcon(true);
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger id="icon" className="h-11 min-h-[44px]">
            <SelectValue placeholder="İkon seç">
              {icon &&
                (() => {
                  const IconComponent = Icons[
                    icon as keyof typeof Icons
                  ] as React.ComponentType<{ size?: number }>;
                  return IconComponent ? (
                    <span className="flex items-center gap-2">
                      <IconComponent size={16} />
                      {icon}
                    </span>
                  ) : (
                    icon
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
                <SelectItem key={iconName} value={iconName}>
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-11 min-h-[44px]"
          >
            İptal
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-11 min-h-[44px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Kaydet"
          )}
        </Button>
      </div>
    </form>
  );
}
