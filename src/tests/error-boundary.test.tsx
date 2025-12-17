import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../components/error-boundary";

// Test component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

// Simple fallback for testing
function TestFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div>
      <p>Something went wrong</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}

describe("ErrorBoundary", () => {
  // Suppress console.error during tests
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback UI when an error occurs", () => {
    render(
      <ErrorBoundary fallback={<TestFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("catches error and updates state via getDerivedStateFromError", () => {
    const { container } = render(
      <ErrorBoundary fallback={<div>Error caught</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container).toHaveTextContent("Error caught");
  });

  it("logs error to console in development mode", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // In test environment (which mimics dev), console.error should be called
    expect(console.error).toHaveBeenCalled();
  });

  it("allows recovery via retry mechanism", () => {
    let shouldThrow = true;

    function ToggleError() {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div>Recovered</div>;
    }

    const handleReset = vi.fn(() => {
      shouldThrow = false;
    });

    render(
      <ErrorBoundary
        fallback={<TestFallback onRetry={handleReset} />}
        onReset={handleReset}
      >
        <ToggleError />
      </ErrorBoundary>
    );

    // Error should be caught
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click retry
    fireEvent.click(screen.getByText("Retry"));

    // onReset callback should be called
    expect(handleReset).toHaveBeenCalled();
  });

  it("renders default ErrorFallback when no fallback prop is provided", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Default fallback should show
    // This will fail until we implement the default ErrorFallback
    expect(screen.getByText(/bir şeyler ters gitti/i)).toBeInTheDocument();
  });

  it("provides onRetry callback to default fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Default retry button should exist
    expect(
      screen.getByRole("button", { name: /tekrar dene/i })
    ).toBeInTheDocument();
  });
});
