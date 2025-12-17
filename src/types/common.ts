import { z } from "zod";

export const CurrencySchema = z.enum(["TRY", "USD", "EUR"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const BillingCycleSchema = z.enum([
  "monthly",
  "yearly",
  "weekly",
  "custom",
]);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const CategorySchema = z.enum([
  "entertainment", // Eğlence
  "productivity", // İş
  "tools", // Araçlar
  "education", // Eğitim
  "health", // Sağlık
  "other", // Diğer
]);
export type Category = z.infer<typeof CategorySchema>;
