import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { z } from "zod";
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
import { calculateNextPaymentDate } from "./utils";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ColorPicker } from "./color-picker";
import { IconPicker } from "./icon-picker";

export interface SubscriptionFormProps {
  initialValues?: Partial<SubscriptionInput>;
  mode?: "add" | "edit";
  subscriptionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function SubscriptionForm({
  initialValues,
  mode = "add",
  subscriptionId,
  onSuccess,
  onCancel,
  onSubmittingChange,
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
  const [customDays, setCustomDays] = useState(
    initialValues?.customDays?.toString() || "30"
  );

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
  const updateSubscription = useSubscriptionStore(
    (state) => state.updateSubscription
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
      // Get icon name from the component, preferring non-prefixed names
      const iconName =
        Object.keys(Icons).find(
          (key) =>
            !key.startsWith("Lucide") &&
            Icons[key as keyof typeof Icons] === IconComponent
        ) ||
        Object.keys(Icons).find(
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
    setCustomDays("30");
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

      if (billingCycle === "custom") {
        const days = parseInt(customDays);
        if (isNaN(days) || days < 1 || days > 365) {
          validationErrors.customDays = "1-365 arası bir değer giriniz";
        }
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
        onSubmittingChange?.(false);
        return;
      }

      // Calculate nextPaymentDate before validation
      const nextPaymentDate = calculateNextPaymentDate(
        firstPaymentDate || new Date(),
        billingCycle,
        parseInt(customDays) || 30
      );

      // In edit mode, we might want to preserve the existing nextPaymentDate
      // unless the user intended to reset the cycle by changing the first payment date
      let finalNextPaymentDate = nextPaymentDate;
      if (mode === "edit" && initialValues?.nextPaymentDate) {
        const existingNextDate = new Date(initialValues.nextPaymentDate);
        // We compare with the initial form date to see if user changed it
        const initialFormDate = initialValues.nextPaymentDate
          ? new Date(initialValues.nextPaymentDate).toISOString().split("T")[0]
          : null;
        const currentFormDate = firstPaymentDate
          ? firstPaymentDate.toISOString().split("T")[0]
          : null;

        const firstPaymentChanged = initialFormDate !== currentFormDate;

        // If nothing critical changed, keep the existing next payment date
        // to avoid "jumping" dates when editing on the payment day
        if (
          !firstPaymentChanged &&
          billingCycle === initialValues.billingCycle
        ) {
          finalNextPaymentDate = existingNextDate;
        }
      }

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
        nextPaymentDate: finalNextPaymentDate.toISOString(),
        isActive: true,
        categoryId: finalCategory,
        color: finalColor,
        icon: finalIcon,
        cardId: cardId || undefined,
        ...(billingCycle === "custom" && {
          customDays: parseInt(customDays) || 30,
        }),
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
        customDays:
          billingCycle === "custom"
            ? z.number().int().min(1).max(365, "1-365 arası bir değer giriniz")
            : z.number().optional(),
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
        onSubmittingChange?.(false);
        return;
      }

      // EDIT MODE
      if (mode === "edit" && subscriptionId) {
        if (updateSubscription) {
          const success = updateSubscription(subscriptionId, formData);
          if (success) {
            toast.success(`${name} güncellendi`, {
              description: `${formatCurrency(
                formData.amount,
                formData.currency
              )}/ay`,
            });
            onSuccess?.();
          } else {
            toast.error("Güncelleme başarısız");
          }
        }
      } else {
        // ADD MODE
        const created = addSubscription(formData);

        if (!created) {
          toast.error("Abonelik eklenemedi", {
            description: "Veri doğrulama hatası",
          });
          setIsSubmitting(false);
          onSubmittingChange?.(false);
          return;
        }

        toast.success(`${created.name} eklendi`, {
          description: `${formatCurrency(created.amount, created.currency)}/ay`,
        });

        resetForm();
        onSuccess?.();
      }
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
      onSubmittingChange?.(false);
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
      <div className="space-y-4">
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
              <SelectItem value="custom">Özel (Gün)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {billingCycle === "custom" && (
          <div>
            <Label htmlFor="customDays">
              Gün Sayısı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customDays"
              name="customDays"
              type="number"
              min="1"
              max="365"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="30"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.customDays}
              aria-describedby={
                errors.customDays ? "customDays-error" : undefined
              }
              className="h-11 min-h-[44px]"
            />
            {errors.customDays && (
              <p
                id="customDays-error"
                className="mt-1 text-sm text-destructive"
              >
                {errors.customDays}
              </p>
            )}
          </div>
        )}
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
              calculateNextPaymentDate(
                firstPaymentDate,
                billingCycle,
                parseInt(customDays) || 30
              ),
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
      <ColorPicker
        value={color}
        onChange={(v) => {
          setColor(v);
          setManuallySetColor(true);
        }}
        disabled={isSubmitting}
      />

      {/* Icon Picker */}
      <IconPicker
        value={icon}
        onChange={(v) => {
          setIcon(v);
          setManuallySetIcon(true);
        }}
        disabled={isSubmitting}
      />

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
              {mode === "edit" ? "Güncelleniyor..." : "Kaydediliyor..."}
            </>
          ) : mode === "edit" ? (
            "Güncelle"
          ) : (
            "Kaydet"
          )}
        </Button>
      </div>
    </form>
  );
}
