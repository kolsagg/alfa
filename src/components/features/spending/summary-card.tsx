import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value?: string;
  subtext?: string;
  isLoading?: boolean;
  className?: string;
}

export function SummaryCard({
  label,
  value,
  subtext,
  isLoading,
  className,
}: SummaryCardProps) {
  return (
    <Card
      className={cn("overflow-hidden border-border/50", className)}
      aria-label={label}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          {isLoading ? (
            <Skeleton className="h-10 w-32 my-1" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-jakarta text-5xl font-extrabold tracking-tight tabular-nums text-foreground">
                {value}
              </span>
            </div>
          )}

          {subtext && !isLoading && (
            <p className="text-[10px] text-muted-foreground/80 italic">
              {subtext}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
