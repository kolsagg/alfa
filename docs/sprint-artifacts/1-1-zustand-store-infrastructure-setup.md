# Story 1.1: Zustand Store Infrastructure Setup

Status: ready-for-review

## Story

As a **developer**,
I want **a properly configured Zustand store with persistence**,
So that **all future slices can use consistent storage patterns**.

## Acceptance Criteria

1. **Given** the application starts
   **When** the store initializes
   **Then** it connects to localStorage with environment-aware namespace (`subtracker-dev` vs `subtracker-prod`)

2. **Given** a store is configured with persist middleware
   **When** schema versioning is set
   **Then** version starts at `1` and migration function template is defined

3. **Given** persist middleware is configured
   **When** selective persistence is needed
   **Then** `partialize` option is available for filtering persisted state

4. **Given** the app runs in development mode
   **When** Zustand is used
   **Then** DevTools integration is enabled for debugging

5. **Given** stores are accessed in components
   **When** hooks are imported
   **Then** typed store hooks are exported for type-safe access

6. **Given** the persist/rehydrate cycle
   **When** tests run
   **Then** unit tests cover persist/rehydrate cycle with mock storage

7. **Given** migration logic is needed
   **When** schema changes occur
   **Then** migration function is testable with sample data

8. **Given** data is loaded from localStorage
   **When** rehydration completes
   **Then** `onRehydrateStorage` callback validates data integrity

## Tasks / Subtasks

- [x] **Task 1: Install Dependencies** (AC: #1-#8)

  - [x] 1.1 Install zustand: `npm install zustand`
  - [x] 1.2 Install zod for schema validation: `npm install zod`
  - [x] 1.3 Install testing packages: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
  - [x] 1.4 Add test scripts to package.json: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:coverage": "vitest --coverage"`

- [x] **Task 2: Create Base Store Infrastructure** (AC: #1, #2, #3, #4, #8)

  - [x] 2.1 Create `src/stores/` directory
  - [x] 2.2 Create `src/stores/create-store.ts` with base store factory
  - [x] 2.3 Implement environment-aware storage namespace logic
  - [x] 2.4 Configure persist middleware with version and migrate options
  - [x] 2.5 Enable Zustand DevTools for development
  - [x] 2.6 Add `onRehydrateStorage` callback for data validation

- [x] **Task 3: Create Settings Store (Persisted Slice)** (AC: #1, #2, #4, #5, #8)

  - [x] 3.1 Create `src/stores/settings-store.ts`
  - [x] 3.2 Define SettingsState interface (theme, notificationPermission, etc.)
  - [x] 3.3 Implement typed actions (setTheme, setNotificationPermission)
  - [x] 3.4 Configure persist with namespace `subtracker-settings`
  - [x] 3.5 Implement onRehydrateStorage with Zod validation

- [x] **Task 4: Create UI Store (Non-Persisted Slice)** (AC: #4, #5)

  - [x] 4.1 Create `src/stores/ui-store.ts` (NO persist middleware)
  - [x] 4.2 Define UIState interface (modals, toasts, loading states)
  - [x] 4.3 Implement actions (openModal, closeModal, setLoading)
  - [x] 4.4 Enable DevTools for debugging

- [x] **Task 5: Create Type Definitions** (AC: #5)

  - [x] 5.1 Create `src/types/` directory
  - [x] 5.2 Create `src/types/settings.ts` with Zod schemas
  - [x] 5.3 Create `src/types/subscription.ts` with skeleton schema (for Story 2.1)
  - [x] 5.4 Create `src/types/common.ts` with shared types (Currency, BillingCycle)
  - [x] 5.5 Export TypeScript types from Zod schemas
  - [x] 5.6 Create `src/types/index.ts` for clean exports

- [x] **Task 6: Setup Testing Infrastructure** (AC: #6, #7)

  - [x] 6.1 Create `src/tests/setup.ts` for Vitest configuration
  - [x] 6.2 Update `vite.config.ts` with test configuration
  - [x] 6.3 Create `src/stores/settings-store.test.ts`
  - [x] 6.4 Test persist/rehydrate cycle with mock localStorage
  - [x] 6.5 Test migration function with sample v0 → v1 data
  - [x] 6.6 Test onRehydrateStorage validation with invalid data

- [x] **Task 7: Cross-Tab Sync Preparation** (AC: #1)

  - [x] 7.1 Create `src/hooks/use-storage-sync.ts` hook skeleton
  - [x] 7.2 Add storage event listener for future cross-tab sync

- [x] **Task 8: Documentation & Validation** (AC: #1-#8)
  - [x] 8.1 Verify store works in browser with DevTools
  - [x] 8.2 Verify localStorage namespace switches between dev/prod
  - [x] 8.3 Run all tests and confirm passing
  - [x] 8.4 Verify onRehydrateStorage logs validation errors

## Dev Notes

### Architecture Compliance

**CRITICAL - Follow These Patterns:**

- **File Naming:** kebab-case → `settings-store.ts`, `create-store.ts`, `ui-store.ts`
- **Export Naming:** Hooks use `use` prefix → `useSettingsStore`, `useUIStore`
- **Store Key Pattern:** `subtracker-{domain}-{env}` → `subtracker-settings-dev`
- **DO NOT modify** `src/components/ui/` (shadcn read-only)
- **Co-locate tests:** `settings-store.ts` → `settings-store.test.ts`

### Technical Requirements

**Zustand Version:** 5.0.9 (latest compatible with React 19)

**Package.json Scripts (MUST ADD):**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Storage Namespace Strategy (CRITICAL):**

```typescript
// src/stores/create-store.ts
export const getStorageName = (domain: string): string =>
  import.meta.env.PROD ? `subtracker-${domain}` : `subtracker-${domain}-dev`;
```

**Persist Middleware Configuration with onRehydrateStorage:**

```typescript
import { create } from "zustand";
import { persist, devtools, PersistOptions } from "zustand/middleware";
import { SettingsSchema } from "@/types/settings";

type SettingsState = {
  theme: "light" | "dark" | "system";
  // ... other fields
  setTheme: (theme: "light" | "dark" | "system") => void;
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        theme: "system",
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: getStorageName("settings"),
        version: 1,
        migrate: (persisted, version) => {
          if (version === 0) {
            // Migration logic v0 → v1
            console.log("[SettingsStore] Migrating from v0 to v1");
          }
          return persisted as SettingsState;
        },
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error("[SettingsStore] Rehydration error:", error);
            return;
          }
          // Validate rehydrated data
          const result = SettingsSchema.safeParse(state);
          if (!result.success) {
            console.warn(
              "[SettingsStore] Invalid data, using defaults:",
              result.error
            );
          }
        },
      }
    ),
    { name: "SettingsStore", enabled: !import.meta.env.PROD }
  )
);
```

**UI Store (Non-Persisted) Pattern:**

```typescript
// src/stores/ui-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ModalType =
  | "addSubscription"
  | "editSubscription"
  | "confirmDelete"
  | null;

interface UIState {
  activeModal: ModalType;
  editingSubscriptionId: string | null;
  isLoading: boolean;

  // Actions
  openModal: (modal: ModalType, subscriptionId?: string) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      activeModal: null,
      editingSubscriptionId: null,
      isLoading: false,

      openModal: (modal, subscriptionId) =>
        set({
          activeModal: modal,
          editingSubscriptionId: subscriptionId ?? null,
        }),
      closeModal: () =>
        set({
          activeModal: null,
          editingSubscriptionId: null,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "UIStore", enabled: !import.meta.env.PROD }
  )
);
```

### Type Definitions

**Settings Schema:**

```typescript
// src/types/settings.ts
import { z } from "zod";

export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const SettingsSchema = z.object({
  theme: ThemeSchema.default("system"),
  notificationPermission: z
    .enum(["default", "granted", "denied"])
    .default("default"),
  notificationDaysBefore: z.number().int().min(1).max(30).default(3),
  notificationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default("09:00"),
  lastBackupDate: z.string().datetime().optional(),
  onboardingCompleted: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;
```

**Common Types (Shared across stores):**

```typescript
// src/types/common.ts
import { z } from "zod";

export const CurrencySchema = z.enum(["TRY", "USD", "EUR"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const BillingCycleSchema = z.enum([
  "monthly",
  "yearly",
  "weekly",
  "custom",
]);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const CategorySchema = z.enum([
  "entertainment", // Eğlence
  "productivity", // İş
  "tools", // Araçlar
  "education", // Eğitim
  "health", // Sağlık
  "other", // Diğer
]);
export type Category = z.infer<typeof CategorySchema>;
```

**Subscription Schema Skeleton (for Story 2.1):**

```typescript
// src/types/subscription.ts
import { z } from "zod";
import { CurrencySchema, BillingCycleSchema, CategorySchema } from "./common";

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: CurrencySchema,
  billingCycle: BillingCycleSchema,
  nextPaymentDate: z.string().datetime(),
  isActive: z.boolean().default(true),
  categoryId: CategorySchema.optional(),
  cardId: z.string().uuid().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// Partial schema for updates
export const SubscriptionUpdateSchema = SubscriptionSchema.partial().omit({
  id: true,
  createdAt: true,
});
export type SubscriptionUpdate = z.infer<typeof SubscriptionUpdateSchema>;
```

### Cross-Tab Sync Preparation

```typescript
// src/hooks/use-storage-sync.ts
import { useEffect } from "react";

/**
 * Hook to sync Zustand stores across browser tabs
 * Listens for localStorage changes and triggers store rehydration
 *
 * Usage: Call in App.tsx or root component
 * Implementation will be extended in future stories
 */
export function useStorageSync() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith("subtracker-")) {
        // For now, just log. Full implementation in future story.
        console.log("[StorageSync] External change detected:", event.key);
        // TODO: Trigger store rehydration
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
}
```

### Testing Configuration

**Vitest Config (add to vite.config.ts):**

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/tests/"],
    },
  },
});
```

**Test Setup File:**

```typescript
// src/tests/setup.ts
import "@testing-library/jest-dom";
import { afterEach } from "vitest";

// Mock localStorage for Zustand persist tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Clear localStorage between tests
afterEach(() => {
  localStorage.clear();
});
```

**Example Test:**

```typescript
// src/stores/settings-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({ theme: "system" });
  });

  it("should initialize with system theme", () => {
    const { theme } = useSettingsStore.getState();
    expect(theme).toBe("system");
  });

  it("should update theme", () => {
    useSettingsStore.getState().setTheme("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("should persist to localStorage", async () => {
    useSettingsStore.getState().setTheme("dark");

    // Wait for persist middleware
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stored = localStorage.getItem("subtracker-settings-dev");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).state.theme).toBe("dark");
  });

  it("should rehydrate from localStorage", async () => {
    // Pre-populate localStorage
    localStorage.setItem(
      "subtracker-settings-dev",
      JSON.stringify({
        state: { theme: "light" },
        version: 1,
      })
    );

    // Trigger rehydration
    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().theme).toBe("light");
  });
});
```

### Project Structure After This Story

```
src/
├── stores/
│   ├── create-store.ts          # Base store factory + getStorageName helper
│   ├── settings-store.ts        # Theme, notification settings (PERSISTED)
│   ├── settings-store.test.ts   # Unit tests for settings store
│   └── ui-store.ts              # Modal, loading states (NON-PERSISTED)
├── types/
│   ├── common.ts                # Currency, BillingCycle, Category
│   ├── settings.ts              # Zod schemas for settings
│   ├── subscription.ts          # Zod schema skeleton (for Story 2.1)
│   └── index.ts                 # Clean exports
├── hooks/
│   └── use-storage-sync.ts      # Cross-tab sync preparation
├── tests/
│   └── setup.ts                 # Vitest setup + localStorage mock
└── ...existing files
```

### References

- [Source: docs/architecture.md#Data-Architecture] - Schema validation, storage namespace
- [Source: docs/architecture.md#State-Management-Patterns] - Store structure, selector pattern
- [Source: docs/architecture.md#Line-1133] - UI store non-persisted
- [Source: docs/architecture.md#Line-79] - Cross-tab synchronization requirement
- [Source: docs/epics.md#Story-1.1] - Acceptance criteria
- [Source: docs/prd.md#FR17] - localStorage data storage
- [Source: docs/prd.md#NFR05] - All data in localStorage only

---

### Dev Agent Record

### Context Reference

This story establishes the foundation for all future Zustand stores. Critical for:

- Epic 2: Subscription slice (uses subscription.ts skeleton)
- Epic 4: Notification settings slice (extends settings-store.ts)
- Epic 6: Cards slice (follows same patterns)

### Key Dependencies Created

| File                    | Used By                                      |
| ----------------------- | -------------------------------------------- |
| `create-store.ts`       | All future stores                            |
| `settings-store.ts`     | Theme (Story 1.3), Notifications (Story 2.9) |
| `ui-store.ts`           | All modals, dialogs                          |
| `types/subscription.ts` | Story 2.1 directly                           |
| `types/common.ts`       | All stores needing Currency, Category        |
| `use-storage-sync.ts`   | Multi-tab support (future)                   |

### Agent Model Used

PLACEHOLDER_M8

### Debug Log References

- Initial RED phase for settings-store failed as expected.
- GREEN phase implemented store and tests passed (Persistence, Rehydration, Migration, Validation).
- Configured Vitest setup to properly mock localStorage.

### Completion Notes List

- ✅ All dependencies installed (Zustand, Zod, Vitest).
- ✅ Base store infrastructure created with `createStore` factory.
- ✅ Environment-aware storage naming implemented (`subtracker-*-dev` vs prod).
- ✅ `SettingsStore` implemented with persistence and Zod validation.
- ✅ `UIStore` implemented without persistence.
- ✅ Type definitions created for all planned entities.
- ✅ Testing infrastructure set up and verified with unit tests.
- ✅ Tests cover: initialization, updates, persistence, rehydration, migration, validation.

### File List

- `package.json` (modified)
- `vite.config.ts` (modified)
- `src/stores/create-store.ts` (new)
- `src/stores/settings-store.ts` (new)
- `src/stores/settings-store.test.ts` (new)
- `src/stores/ui-store.ts` (new)
- `src/types/common.ts` (new)
- `src/types/settings.ts` (new)
- `src/types/subscription.ts` (new)
- `src/types/index.ts` (new)
- `src/hooks/use-storage-sync.ts` (new)
- `src/tests/setup.ts` (new)

---

## Validation Checklist (Pre-Development)

- [x] All dependencies listed in Task 1 are correct versions
- [x] Storage namespace follows environment pattern
- [x] onRehydrateStorage validates with Zod
- [x] UI store has NO persist middleware
- [x] Test scripts added to package.json
- [x] Cross-tab sync hook is created as skeleton
- [x] Subscription schema skeleton ready for Story 2.1
