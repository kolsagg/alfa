import type { Category } from "@/types/common";
import type { LucideIcon } from "lucide-react";
import {
  Tv,
  Music,
  Cloud,
  Briefcase,
  Sparkles,
  Github,
  Youtube,
  ShoppingCart,
} from "lucide-react";

/**
 * Quick-Add Service configuration interface
 * Used for pre-populating subscription form with popular services
 */
export interface QuickAddService {
  id: string;
  name: string;
  iconName: string; // String name for form storage (e.g., "Tv")
  Icon: LucideIcon; // Component reference for grid rendering
  categoryId: Category;
}

/**
 * Popular subscription services for Quick-Add Grid
 * Each service maps to a lucide-react icon and a category
 */
export const QUICK_ADD_SERVICES: QuickAddService[] = [
  {
    id: "netflix",
    name: "Netflix",
    iconName: "Tv",
    Icon: Tv,
    categoryId: "entertainment",
  },
  {
    id: "spotify",
    name: "Spotify",
    iconName: "Music",
    Icon: Music,
    categoryId: "entertainment",
  },
  {
    id: "icloud",
    name: "iCloud",
    iconName: "Cloud",
    Icon: Cloud,
    categoryId: "tools",
  },
  {
    id: "adobe-cc",
    name: "Adobe Creative Cloud",
    iconName: "Briefcase",
    Icon: Briefcase,
    categoryId: "productivity",
  },
  {
    id: "chatgpt-plus",
    name: "ChatGPT Plus",
    iconName: "Sparkles",
    Icon: Sparkles,
    categoryId: "productivity",
  },
  {
    id: "github-pro",
    name: "GitHub Pro",
    iconName: "Github",
    Icon: Github,
    categoryId: "tools",
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    iconName: "Youtube",
    Icon: Youtube,
    categoryId: "entertainment",
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    iconName: "ShoppingCart",
    Icon: ShoppingCart,
    categoryId: "entertainment",
  },
];
