import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, CreditCard, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/features/subscription/color-picker";
import { PRESET_COLORS } from "@/components/features/subscription/color-picker-constants";
import { useCardStore } from "@/stores/card-store";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import type { Card, CardInput, CardType } from "@/types/card";
import { cn } from "@/lib/utils";

/**
 * CardFormDialog - Add/Edit Card Dialog
 *
 * Story 6.2: AC3, AC4
 * Story 6.2b: Added card type selector, bank name, conditional cutoff date
 * - Dual mode: add / edit
 * - Card type selection: credit / debit
 * - Conditional cutoff date (only for credit cards)
 * - Optional bank name field
 * - Reuses existing ColorPicker component
 * - Real-time Zod validation with inline error display
 * - Delete confirmation via AlertDialog
 * - Toast notifications on success (sonner)
 */

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialValues?: Card | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  lastFourDigits?: string;
  cutoffDate?: string;
  bankName?: string;
}

// Default color from preset palette
const DEFAULT_COLOR = PRESET_COLORS[3]?.value || "oklch(0.6 0.2 250)"; // Blue

export function CardFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  onSuccess,
  onCancel,
}: CardFormDialogProps) {
  // Form state
  const [name, setName] = useState("");
  const [cardType, setCardType] = useState<CardType>("credit");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [cutoffDate, setCutoffDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store actions
  const addCard = useCardStore((s) => s.addCard);
  const updateCard = useCardStore((s) => s.updateCard);
  const deleteCard = useCardStore((s) => s.deleteCard);

  // Reset form when opening or when initialValues change
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        setName(initialValues.name);
        setCardType(initialValues.type ?? "credit");
        setLastFourDigits(initialValues.lastFourDigits);
        setCutoffDate(
          initialValues.cutoffDate ? String(initialValues.cutoffDate) : ""
        );
        setBankName(initialValues.bankName ?? "");
        setColor(initialValues.color || DEFAULT_COLOR);
      } else {
        setName("");
        setCardType("credit");
        setLastFourDigits("");
        setCutoffDate("");
        setBankName("");
        setColor(DEFAULT_COLOR);
      }
      setErrors({});
    }
  }, [open, mode, initialValues]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = WALLET_STRINGS.ERROR_NAME_REQUIRED;
    } else if (name.length > 50) {
      newErrors.name = WALLET_STRINGS.ERROR_NAME_MAX;
    }

    // Last 4 digits validation
    if (!lastFourDigits) {
      newErrors.lastFourDigits = WALLET_STRINGS.ERROR_LAST_FOUR_REQUIRED;
    } else if (!/^\d{4}$/.test(lastFourDigits)) {
      newErrors.lastFourDigits = WALLET_STRINGS.ERROR_LAST_FOUR_FORMAT;
    }

    // Cut-off date validation - only required for credit cards
    if (cardType === "credit") {
      const cutoffNum = parseInt(cutoffDate, 10);
      if (!cutoffDate) {
        newErrors.cutoffDate = WALLET_STRINGS.ERROR_CUTOFF_REQUIRED;
      } else if (isNaN(cutoffNum) || cutoffNum < 1 || cutoffNum > 31) {
        newErrors.cutoffDate = WALLET_STRINGS.ERROR_CUTOFF_RANGE;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const cardInput: CardInput = {
      name: name.trim(),
      type: cardType,
      lastFourDigits,
      cutoffDate: cardType === "credit" ? parseInt(cutoffDate, 10) : undefined,
      bankName: bankName.trim() || undefined,
      color,
    };

    try {
      if (mode === "add") {
        const result = addCard(cardInput);
        if (result) {
          toast.success(WALLET_STRINGS.TOAST_ADD_SUCCESS);
          onSuccess?.();
        }
      } else if (mode === "edit" && initialValues) {
        const success = updateCard(initialValues.id, cardInput);
        if (success) {
          toast.success(WALLET_STRINGS.TOAST_UPDATE_SUCCESS);
          onSuccess?.();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (initialValues) {
      const success = deleteCard(initialValues.id);
      if (success) {
        toast.success(WALLET_STRINGS.TOAST_DELETE_SUCCESS);
        onSuccess?.();
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        data-testid="card-form-dialog"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle data-testid="card-form-title">
            {mode === "add"
              ? WALLET_STRINGS.ADD_CARD
              : WALLET_STRINGS.EDIT_CARD}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? WALLET_STRINGS.WALLET_DESCRIPTION
              : `${initialValues?.name || ""} kartını düzenleyin`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Type Selector (Story 6.2b: AC1) */}
          <div className="space-y-2">
            <Label>{WALLET_STRINGS.CARD_TYPE_LABEL}</Label>
            <div
              className="grid grid-cols-2 gap-2"
              data-testid="card-type-selector"
            >
              <button
                type="button"
                onClick={() => setCardType("credit")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all min-h-[44px]",
                  cardType === "credit"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
                disabled={isSubmitting}
                data-testid="card-type-credit"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {WALLET_STRINGS.CARD_TYPE_CREDIT}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCardType("debit")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all min-h-[44px]",
                  cardType === "debit"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
                disabled={isSubmitting}
                data-testid="card-type-debit"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {WALLET_STRINGS.CARD_TYPE_DEBIT}
                </span>
              </button>
            </div>
          </div>

          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="card-name">{WALLET_STRINGS.CARD_NAME_LABEL}</Label>
            <Input
              id="card-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={WALLET_STRINGS.CARD_NAME_PLACEHOLDER}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              data-testid="card-form-name"
              disabled={isSubmitting}
              maxLength={50}
            />
            {errors.name && (
              <p
                id="name-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Bank Name (Story 6.2b: AC3) */}
          <div className="space-y-2">
            <Label htmlFor="card-bank-name">
              {WALLET_STRINGS.BANK_NAME_LABEL}
              <span className="text-xs text-muted-foreground ml-1">
                (opsiyonel)
              </span>
            </Label>
            <Input
              id="card-bank-name"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder={WALLET_STRINGS.BANK_NAME_PLACEHOLDER}
              data-testid="card-form-bank-name"
              disabled={isSubmitting}
              maxLength={30}
            />
          </div>

          {/* Last 4 Digits */}
          <div className="space-y-2">
            <Label htmlFor="card-last-four">
              {WALLET_STRINGS.LAST_FOUR_LABEL}
            </Label>
            <div className="space-y-1">
              <Input
                id="card-last-four"
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={lastFourDigits}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setLastFourDigits(val);
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData("text");
                  const val = pastedData.replace(/\D/g, "").slice(0, 4);
                  setLastFourDigits(val);
                }}
                placeholder={WALLET_STRINGS.LAST_FOUR_PLACEHOLDER}
                aria-invalid={!!errors.lastFourDigits}
                aria-describedby={
                  errors.lastFourDigits ? "last-four-error" : "privacy-note"
                }
                data-testid="card-form-last-four"
                disabled={isSubmitting}
              />
              <p
                id="privacy-note"
                className="text-xs text-muted-foreground"
                data-testid="card-form-privacy-note"
              >
                {WALLET_STRINGS.PRIVACY_NOTE}
              </p>
            </div>
            {errors.lastFourDigits && (
              <p
                id="last-four-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.lastFourDigits}
              </p>
            )}
          </div>

          {/* Cut-off Date - Only for credit cards (Story 6.2b: AC2) */}
          {cardType === "credit" && (
            <div className="space-y-2">
              <Label htmlFor="card-cutoff">
                {WALLET_STRINGS.CUTOFF_DATE_LABEL}
              </Label>
              <Input
                id="card-cutoff"
                type="number"
                min={1}
                max={31}
                value={cutoffDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (
                    val === "" ||
                    (parseInt(val) >= 1 && parseInt(val) <= 31)
                  ) {
                    setCutoffDate(val);
                  } else if (parseInt(val) > 31) {
                    setCutoffDate("31");
                  }
                }}
                placeholder={WALLET_STRINGS.CUTOFF_DATE_PLACEHOLDER}
                aria-invalid={!!errors.cutoffDate}
                aria-describedby={
                  errors.cutoffDate ? "cutoff-error" : undefined
                }
                data-testid="card-form-cutoff"
                disabled={isSubmitting}
              />
              {errors.cutoffDate && (
                <p
                  id="cutoff-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.cutoffDate}
                </p>
              )}
            </div>
          )}

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>{WALLET_STRINGS.COLOR_LABEL}</Label>
            <ColorPicker
              value={color}
              onChange={setColor}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px]"
              data-testid="card-form-submit"
            >
              {isSubmitting ? "..." : WALLET_STRINGS.SAVE_CARD}
            </Button>

            {mode === "edit" && initialValues && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="min-h-[44px] gap-2"
                    disabled={isSubmitting}
                    data-testid="card-form-delete-trigger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {WALLET_STRINGS.DELETE_CARD}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-testid="card-delete-confirm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {WALLET_STRINGS.DELETE_CONFIRM_TITLE}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {WALLET_STRINGS.DELETE_CONFIRM_DESC}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="card-delete-cancel">
                      {WALLET_STRINGS.CANCEL}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-testid="card-delete-confirm-button"
                    >
                      {WALLET_STRINGS.DELETE_CARD}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="min-h-[44px]"
              data-testid="card-form-cancel"
            >
              {WALLET_STRINGS.CANCEL}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
