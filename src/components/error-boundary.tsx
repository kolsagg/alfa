import { Component, type ReactNode } from "react";
import { ErrorFallback } from "./error-fallback";
import { logger } from "@/lib/event-logger";
import { scrubErrorMessage, canLogError } from "@/lib/debug-export";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - App-level error catching component
 *
 * Catches JavaScript errors in child component tree and displays fallback UI.
 * Implements React error boundary pattern with reset capability.
 *
 * Story 7.3: Error logging with throttling (AC5)
 * - Logs errors via EventLogger with type 'error_caught'
 * - Throttled to max 1 log per 10 seconds to prevent FIFO flooding
 * - PII scrubbing applied to error messages
 *
 * @see docs/architecture.md#Error-Handling-Pattern
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.error("App error:", error);
      console.error("Error info:", errorInfo);
    }

    // Story 7.3 AC5: Log error via EventLogger with throttling
    if (canLogError()) {
      // Scrub error message to remove PII
      const scrubbedMessage = scrubErrorMessage(error.message);

      // Truncate component stack to prevent excessive size
      const componentStack = errorInfo.componentStack
        ? scrubErrorMessage(errorInfo.componentStack.slice(0, 500))
        : undefined;

      logger.log("error_caught", {
        error_message: scrubbedMessage,
        component_stack: componentStack,
        error_name: error.name,
      });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default ErrorFallback
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return <ErrorFallback onRetry={this.handleReset} />;
    }

    return this.props.children;
  }
}
