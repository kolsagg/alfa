import type { Category } from "@/types/common";
import {
  Tv,
  Briefcase,
  Wrench,
  GraduationCap,
  HeartPulse,
  Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Category metadata interface with display properties
 */
export interface CategoryMetadata {
  id: Category;
  label: string;
  icon: LucideIcon;
  color: string; // OKLCH value
  colorClass: string; // Tailwind class for backgrounds
}

/**
 * Complete category metadata for all subscription categories
 * Labels are in Turkish as per UX requirements
 */
export const CATEGORY_METADATA: Record<Category, CategoryMetadata> = {
  entertainment: {
    id: "entertainment",
    label: "Eğlence",
    icon: Tv,
    color: "var(--color-primary)",
    colorClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  productivity: {
    id: "productivity",
    label: "İş",
    icon: Briefcase,
    color: "var(--color-secondary)",
    colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  tools: {
    id: "tools",
    label: "Araçlar",
    icon: Wrench,
    color: "var(--color-success)",
    colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  education: {
    id: "education",
    label: "Eğitim",
    icon: GraduationCap,
    color: "var(--color-attention)",
    colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  health: {
    id: "health",
    label: "Sağlık",
    icon: HeartPulse,
    color: "var(--color-urgent)",
    colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  other: {
    id: "other",
    label: "Diğer",
    icon: Archive,
    color: "var(--color-muted)",
    colorClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
} satisfies Record<Category, CategoryMetadata>;

/**
 * Category option type for Select components
 */
export interface CategoryOption {
  value: Category;
  label: string;
  icon: LucideIcon;
}

/**
 * Helper object for category operations
 */
export const categories = {
  /**
   * Get category metadata by ID, defaults to "other" for unknown/undefined
   */
  get: (id?: Category | string): CategoryMetadata =>
    CATEGORY_METADATA[id as Category] ?? CATEGORY_METADATA.other,

  /**
   * Get all category metadata as array
   */
  all: (): CategoryMetadata[] => Object.values(CATEGORY_METADATA),

  /**
   * Get options formatted for Select component
   */
  options: (): CategoryOption[] =>
    Object.entries(CATEGORY_METADATA).map(([id, meta]) => ({
      value: id as Category,
      label: meta.label,
      icon: meta.icon,
    })),

  /**
   * Check if a string is a valid category ID
   */
  isValid: (id: string): id is Category => id in CATEGORY_METADATA,
};
