import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorFallbackProps {
  onRetry?: () => void;
}

/**
 * ErrorFallback - User-friendly error state UI component
 *
 * Displays when ErrorBoundary catches an error.
 * Provides retry button (state reset) and page reload link as fallback.
 *
 * @see docs/ux-design-specification.md#Component-States
 */
export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center gap-6 p-6 text-center">
      {/* Error Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-urgent/10">
        <AlertTriangle className="h-8 w-8 text-urgent" aria-hidden="true" />
      </div>

      {/* Error Message */}
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground font-jakarta">
          Bir şeyler ters gitti
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {/* Primary: Retry Button */}
        <Button
          onClick={onRetry}
          className="min-h-[44px] min-w-[44px] gap-2"
          aria-label="Tekrar Dene"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Tekrar Dene
        </Button>

        {/* Secondary: Reload Page Link */}
        <button
          onClick={handleReload}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors min-h-[44px] flex items-center"
        >
          Hâlâ sorun yaşıyorsanız sayfayı yenileyin
        </button>
      </div>
    </div>
  );
}
