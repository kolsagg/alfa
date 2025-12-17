# Story 1.6: Error Boundary and Fallback UI

Status: done

## Story

As a **user**,
I want **the app to handle crashes gracefully**,
So that **I don't lose my context when errors occur**.

## Acceptance Criteria

1. **Given** a runtime error occurs in a component
   **When** the error propagates
   **Then** the error boundary catches it
   **And** a friendly fallback UI is displayed ("Something went wrong")
   **And** user can click "Retry" to attempt recovery
   **And** error details are logged to console (dev) / suppressed (prod)

## Tasks / Subtasks

- [x] **Task 1: Create ErrorBoundary Component** (AC: #1)

  - [x] 1.1 Create `src/components/error-boundary.tsx` using React class component pattern
  - [x] 1.2 Implement `getDerivedStateFromError` for error catching
  - [x] 1.3 Implement `componentDidCatch` for error logging (dev only)
  - [x] 1.4 Render fallback UI when `hasError` is true
  - [x] 1.5 Include reset functionality via `key` prop or state reset

- [x] **Task 2: Create ErrorFallback Component** (AC: #1)

  - [x] 2.1 Create `src/components/error-fallback.tsx` with friendly UI
  - [x] 2.2 Include error message: "Bir şeyler ters gitti" (Turkish)
  - [x] 2.3 Add "Tekrar Dene" button with retry functionality (primary action)
  - [x] 2.4 Add "Sayfayı Yenile" link as secondary fallback action
  - [x] 2.5 Style with OKLCH colors and match app theme
  - [x] 2.6 Include error icon (lucide-react: AlertTriangle or similar)
  - [x] 2.7 Ensure 44x44px touch target on Retry button

- [x] **Task 3: Integrate ErrorBoundary in main.tsx** (AC: #1)

  - [x] 3.1 Wrap `<App />` with `<ErrorBoundary>` in `src/main.tsx`
  - [x] 3.2 Pass `<ErrorFallback />` as fallback prop
  - [x] 3.3 Ensure Toaster is within ErrorBoundary

- [x] **Task 4: Testing** (AC: #1)
  - [x] 4.1 Create `src/tests/error-boundary.test.tsx`
  - [x] 4.2 Test error catching with intentionally failing component
  - [x] 4.3 Test fallback UI rendering
  - [x] 4.4 Test retry functionality
  - [x] 4.5 Test console.error in dev mode (mock console)

## Dev Notes

### Architecture Requirements (from `architecture.md`)

**Error Handling Strategy - Layered:**
| Layer | Tool | Usage |
|-------|------|-------|
| **App Level** | ErrorBoundary | Catches render errors, shows fallback UI |
| **User Actions** | Sonner toast | Shows success/error for user actions |
| **Validation** | Inline errors | Shows field-level validation errors |
| **Development** | console.error | Logs errors (dev only) |

**Implementation Pattern from Architecture:**

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void; // NEW: Reset callback
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log in development
    if (import.meta.env.DEV) {
      console.error("App error:", error);
      console.error("Error info:", errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || <ErrorFallback onRetry={this.handleReset} />
      );
    }
    return this.props.children;
  }
}

// Usage in main.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

### Recovery Mechanism Options

**Retry Button Actions (choose one):**

1. **State Reset (Recommended):** `setState({ hasError: false })` - Component tree re-renders
2. **Page Reload (Secondary):** `window.location.reload()` - Full page refresh as fallback
3. **Both:** Primary = State reset, Secondary link = "Sayfayı yenile"

**Recommended Implementation:**

- Primary: State reset ile component recovery
- Secondary: "Hâlâ sorun yaşıyorsanız sayfayı yenileyin" link

### Graceful Degradation (from `ux-design-specification.md`)

| Failure Scenario     | Fallback UX                         |
| -------------------- | ----------------------------------- |
| **Runtime error**    | ErrorFallback with retry option     |
| **Retry fails**      | "Sayfayı Yenile" secondary action   |
| **Critical failure** | Reload page, localStorage preserved |

### Component States Pattern

**Error state, tüm component'lar için uygulanan pattern:**

- default → loading (skeleton) → error → success
- ErrorFallback, app-level error state'i temsil eder

### File Naming Conventions

- **File:** `error-boundary.tsx` (kebab-case)
- **Component:** `ErrorBoundary` (PascalCase)
- **Test:** `error-boundary.test.tsx` (co-located in src/tests/)

### Project Structure Context

```
src/
├── components/
│   ├── error-boundary.tsx       ← NEW
│   ├── error-fallback.tsx       ← NEW
│   ├── layout/...
│   ├── providers/...
│   └── ui/...
├── tests/
│   └── error-boundary.test.tsx  ← NEW
└── main.tsx                     ← MODIFIED
```

### Testing Framework

- **Framework:** Vitest
- **Testing Library:** @testing-library/react
- **Setup:** `src/tests/setup.ts` exists

### Previous Story Learnings (1-5)

- OKLCH color palette configured in `index.css`
- Plus Jakarta Sans font loaded
- 44x44px touch targets required for all interactive elements
- Tailwind CSS 4 with `@theme` syntax in use
- shadcn/ui components available (Button, Card, Dialog)
- Theme system via ThemeProvider in place

### Technical Specifications

**Libraries Available:**

- lucide-react: Icons (AlertTriangle, RefreshCw, etc.)
- sonner: Toast notifications (for action feedback)
- React 19.2.0: Class components still supported

**Environment Check:**

```typescript
// Dev vs Prod check
if (import.meta.env.DEV) {
  console.error("App error:", error);
}
```

### UX Design Notes

**ErrorFallback UI Should Include:**

1. AlertTriangle icon (OKLCH --color-urgent or --color-critical)
2. Heading: "Bir şeyler ters gitti"
3. Description: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
4. Retry Button: Primary style, minimum 44x44px touch target
5. Secondary Link: "Sayfayı Yenile" (calls `window.location.reload()`)
6. Centered layout, full viewport height for visibility

**Color Guidance:**

- Use `--color-urgent` (oklch(0.65 0.2 25)) for warning icon
- Use `--color-foreground` for text
- Use `--color-muted-foreground` for description

### Anti-Patterns to AVOID

❌ DO NOT modify shadcn/ui components in `components/ui/`
❌ DO NOT use console.log for user feedback - use toast
❌ DO NOT use inline styles - use Tailwind classes
❌ DO NOT use `any` type - properly type everything

### References

- [Source: docs/architecture.md#Error Handling Pattern]
- [Source: docs/architecture.md#Enforcement Guidelines]
- [Source: docs/ux-design-specification.md#Component States]
- [Source: docs/epics.md#Story 1.6]

## Dev Agent Record

### Context Reference

Story generated via create-story workflow with comprehensive context analysis.

### Agent Model Used

Claude (Antigravity) - Gemini Advanced Agentic Coding

### Debug Log References

- All 41 tests passing (7 ErrorBoundary-specific tests)
- Build TypeScript errors exist but NOT from this story (pre-existing issues)

### Completion Notes List

- ✅ ErrorBoundary class component implemented with React error boundary pattern
- ✅ getDerivedStateFromError catches render errors and updates state
- ✅ componentDidCatch logs errors only in DEV mode via `import.meta.env.DEV`
- ✅ handleReset method allows retry via state reset
- ✅ ErrorFallback displays user-friendly Turkish error message
- ✅ Primary action: "Tekrar Dene" with 44x44px touch target
- ✅ Secondary action: "Sayfayı Yenile" link for page reload
- ✅ AlertTriangle icon with OKLCH urgent color
- ✅ main.tsx wraps App with ErrorBoundary, Toaster inside boundary
- ✅ 7 comprehensive tests covering all AC scenarios
- ✅ [AI-Review] Accessibility: Removed duplicate aria-label from secondary link
- ✅ [AI-Review] Reusability: Changed from min-h-screen to flexible height constraint

### File List

- `src/components/error-boundary.tsx` (New)
- `src/components/error-fallback.tsx` (New)
- `src/tests/error-boundary.test.tsx` (New)
- `src/main.tsx` (Modified)

## Change Log

- 2025-12-18: Story created - ready-for-dev
- 2025-12-18: Implementation complete - all tasks done, 7/7 tests passing
- 2025-12-18: Code review passed - fixed accessibility (aria-label) and reusability (height) issues
