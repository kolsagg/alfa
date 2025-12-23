import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { ROUTES } from "@/router/routes";

/**
 * Root Error Boundary for the Application
 *
 * Handles runtime crashes and 404s within the route context.
 * Provides a user-friendly error state with recovery options.
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  let title = "Bir şeyler yanlış gitti";
  let message = "Uygulama beklenmedik bir hata ile karşılaştı.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Sayfa bulunamadı";
      message = "Aradığınız sayfa taşınmış veya silinmiş olabilir.";
    } else {
      title = `${error.status} ${error.statusText}`;
      message = error.data?.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-12 w-12" />
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      <p className="mb-8 max-w-md text-muted-foreground">{message}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="default"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Yeniden Dene
        </Button>

        <Button variant="outline" asChild className="gap-2">
          <Link to={ROUTES.DASHBOARD}>
            <Home className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>

      <div className="mt-12 text-sm text-muted-foreground/60">
        Hata Kodu: {isRouteErrorResponse(error) ? error.status : "CRASH"}
      </div>
    </div>
  );
}
