import { z } from "zod";

/**
 * Card Type - Credit or Debit card
 * Story 6.2b: Debit card support
 */
export const CardType = z.enum(["credit", "debit"]);
export type CardType = z.infer<typeof CardType>;

/**
 * Card Schema - Wallet/Credit/Debit Card Definition
 *
 * NFR06 Privacy Compliance: Only lastFourDigits stored, never full card numbers
 * Story 6.2b: Added type, optional cutoffDate, bankName
 */
export const CardSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50),
    type: CardType.default("credit"),
    lastFourDigits: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
    cutoffDate: z.number().int().min(1).max(31).optional(),
    bankName: z.string().max(30).optional(),
    // Supports hex (#RRGGBB) and OKLCH (oklch(l c h)) color formats
    color: z
      .string()
      .refine(
        (val) =>
          /^#[0-9A-Fa-f]{6}$/.test(val) ||
          /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/.test(val),
        { message: "Must be hex (#RRGGBB) or OKLCH format" }
      )
      .optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((data) => data.type === "debit" || data.cutoffDate !== undefined, {
    message: "Credit cards require a cut-off date",
    path: ["cutoffDate"],
  });

export type Card = z.infer<typeof CardSchema>;

/**
 * Partial update schema - allows updating name, lastFourDigits, cutoffDate, color, type, bankName
 * id and createdAt are immutable, updatedAt is auto-set
 */
export const CardUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: CardType.optional(),
  lastFourDigits: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  cutoffDate: z.number().int().min(1).max(31).optional().nullable(),
  bankName: z.string().max(30).optional().nullable(),
  color: z
    .string()
    .refine(
      (val) =>
        /^#[0-9A-Fa-f]{6}$/.test(val) ||
        /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/.test(val),
      { message: "Must be hex (#RRGGBB) or OKLCH format" }
    )
    .optional(),
  updatedAt: z.string().datetime().optional(),
});

export type CardUpdate = z.infer<typeof CardUpdateSchema>;

/**
 * Input type for adding new cards
 * Omits auto-generated fields: id, createdAt, updatedAt
 */
export type CardInput = {
  name: string;
  type?: CardType;
  lastFourDigits: string;
  cutoffDate?: number;
  bankName?: string;
  color?: string;
};
