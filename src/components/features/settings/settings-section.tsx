/**
 * SettingsSection Component
 *
 * Story 8.2, Task 1: Reusable section component for Settings page
 * AC3: Consistent card styling with icon, title, description
 * AC5: Accessibility with aria-labelledby linked to headings
 */

import { useId, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Section title - rendered as h2 */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Section content (toggles, forms, etc.) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  "data-testid"?: string;
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  className,
  "data-testid": testId,
}: SettingsSectionProps) {
  // Generate unique ID for aria-labelledby
  const headingId = useId();

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className={cn(
        // AC4: Card styling - bg-muted/50, p-4, rounded-xl
        "bg-muted/50 p-4 rounded-xl space-y-3",
        className
      )}
      data-testid={testId}
    >
      {/* Section Header with Icon and Title */}
      <h2
        id={headingId}
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
        {title}
      </h2>

      {/* Optional Description */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Section Content */}
      <div className="pt-1">{children}</div>
    </section>
  );
}
