import { z } from "zod";
import { CurrencySchema, BillingCycleSchema, CategorySchema } from "./common";

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: CurrencySchema,
  billingCycle: BillingCycleSchema,
  nextPaymentDate: z.string().datetime(),
  isActive: z.boolean().default(true),
  categoryId: CategorySchema.optional(),
  cardId: z.string().uuid().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// Partial schema for updates
export const SubscriptionUpdateSchema = SubscriptionSchema.partial().omit({
  id: true,
  createdAt: true,
});
export type SubscriptionUpdate = z.infer<typeof SubscriptionUpdateSchema>;
