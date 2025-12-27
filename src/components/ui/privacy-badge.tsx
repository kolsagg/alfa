/**
 * Privacy Badge Component
 *
 * Story 7.2: Privacy-First Data Handling
 * AC5: Visual indicator of privacy-first approach
 *
 * Used on sensitive views (Wallet, Dashboard) to reassure users
 * that their data stays local.
 */

import { Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PrivacyBadgeProps {
  /** Visual variant */
  variant?: "minimal" | "standard" | "prominent";
  /** Additional class names */
  className?: string;
  /** Show text label (default: true for standard/prominent) */
  showLabel?: boolean;
}

/**
 * Privacy Shield Badge
 *
 * Displays a visual indicator that data is stored locally only.
 * Three variants:
 * - minimal: Icon only with tooltip
 * - standard: Icon + short text
 * - prominent: Full width card style
 */
export function PrivacyBadge({
  variant = "standard",
  className,
  showLabel,
}: PrivacyBadgeProps) {
  // Default showLabel based on variant
  const displayLabel =
    showLabel !== undefined ? showLabel : variant !== "minimal";

  const IconComponent = variant === "prominent" ? ShieldCheck : Shield;

  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400",
                className
              )}
              aria-label={SETTINGS_STRINGS.PRIVACY_BADGE_TEXT}
            >
              <IconComponent className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs max-w-[200px]">
              {SETTINGS_STRINGS.PRIVACY_BADGE_TOOLTIP}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "prominent") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          "bg-emerald-50 dark:bg-emerald-950/30",
          "border border-emerald-200 dark:border-emerald-800",
          className
        )}
        role="status"
        aria-label={SETTINGS_STRINGS.PRIVACY_GUARANTEE_TITLE}
      >
        <div className="flex-shrink-0">
          <IconComponent className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {SETTINGS_STRINGS.PRIVACY_GUARANTEE_TITLE}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            {SETTINGS_STRINGS.PRIVACY_GUARANTEE_DESC}
          </p>
        </div>
      </div>
    );
  }

  // Standard variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              "bg-emerald-100 dark:bg-emerald-900/40",
              "text-emerald-700 dark:text-emerald-300",
              "border border-emerald-200 dark:border-emerald-800",
              className
            )}
            role="status"
          >
            <IconComponent className="h-3 w-3 flex-shrink-0" />
            {displayLabel && (
              <span className="truncate">
                {SETTINGS_STRINGS.PRIVACY_BADGE_TEXT}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs max-w-[200px]">
            {SETTINGS_STRINGS.PRIVACY_BADGE_TOOLTIP}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default PrivacyBadge;
