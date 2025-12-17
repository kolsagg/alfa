---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments:
  - docs/prd.md
  - docs/ux-design-specification.md
  - docs/analysis/research/technical-subtracker-stack-research-2025-12-16.md
workflowType: "architecture"
lastStep: 7
workflowComplete: true
project_name: "SubTracker"
user_name: "kolsag"
date: "2025-12-17"
---

# Architecture Decision Document - SubTracker

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
SubTracker MVP'si 6 ana fonksiyonel alan içerir:

- Abonelik CRUD (oluşturma, okuma, güncelleme, silme)
- Quick-add ile popüler servislerin hızlı eklenmesi
- Countdown-based dashboard ile yaklaşan ödemelerin görselleştirilmesi
- PWA push bildirimleri ile proaktif hatırlatmalar
- localStorage tabanlı veri kalıcılığı
- Export/Import ile yedekleme

**Non-Functional Requirements:**

- Performance: FCP <1s, LCP <1.5s, TTI <2s
- Bundle: <350KB gzipped
- Lighthouse PWA: >90 score
- Accessibility: WCAG 2.1 AA compliance
- Offline: Full functionality without network

**Scale & Complexity:**

- Primary domain: Frontend PWA (React SPA)
- Complexity level: Medium
- Estimated architectural components: 16 (validated against PRD)
- Backend requirement: None (pure client-side)

### Technical Constraints & Dependencies

| Constraint      | Description                                        |
| --------------- | -------------------------------------------------- |
| No Backend      | All data persisted in localStorage                 |
| iOS Limitations | Notifications require PWA installation (iOS 16.4+) |
| TailwindCSS v4  | CSS-first configuration approach                   |
| Browser Support | Modern browsers, iOS 16.4+ for notifications       |

### Cross-Cutting Concerns Identified

1. **Notification Permission Management**

   - Just-in-time request pattern
   - iOS PWA detection and guidance
   - Permission state handling across app

2. **Urgency System**

   - Color palette (subtle → critical) with OKLCH
   - Animation states
   - **Accessibility:** Secondary indicators (icons, text) for color-blind users
   - Applies to: CountdownHero, SubscriptionCard, badges

3. **Data Persistence Layer**

   - Zustand stores with persist middleware
   - **Versioned schema for migrations (CRITICAL)**
   - **Environment-aware storage namespace** (dev vs prod)
   - Cross-tab synchronization

4. **Theme System**

   - OKLCH color palette
   - CSS variables for dark mode
   - System preference detection

5. **Accessibility**
   - 44x44px touch targets
   - ARIA labels and roles
   - Keyboard navigation support

### Party Mode Insights (Multi-Agent Review)

#### iOS Onboarding Architecture

> iOS kullanıcılar için "guided experience" component sorumluluğu architecture-level concern olarak tanımlandı.

**Architectural Decision:**

- `IOSInstallPrompt` component zorunlu (MVP)
- Safari detection → Modal → Screenshot'lı instruction

#### Offline Notification Recovery

> Service Worker sadece caching değil, "missed notifications" tracking için de kullanılmalı.

**Architectural Decision:**

- `missedNotifications` localStorage key
- App mount'ta check + toast notification

#### Schema Versioning Strategy

> Data loss en büyük risk. Zustand persist schema version'ı explicit olmalı.

**Architectural Decision:**

```typescript
persist(
  (set, get) => ({
    /* ... */
  }),
  {
    name: import.meta.env.PROD
      ? "subtracker-storage"
      : "subtracker-storage-dev",
    version: 2,
    migrate: (persisted, version) => {
      /* migrations */
    },
  }
);
```

#### Critical Path Testing Requirements

| Component                    | Risk   | Test Coverage           |
| ---------------------------- | ------ | ----------------------- |
| Zustand Persist + Migration  | HIGH   | 100% unit + integration |
| iOS PWA Detection            | HIGH   | Browser matrix testing  |
| Notification Permission Flow | MEDIUM | Happy + error paths     |
| Currency Conversion          | LOW    | Basic unit tests        |

#### Growth Phase Architecture Placeholders

MVP'de implement edilmeyecek ama architecture'da yer bırakılacak:

- Multi-device sync (future cloud integration point)
- Family/shared subscriptions
- Spending analytics dashboard
- Bank integration webhooks

---

## Starter Template Evaluation

### Primary Technology Domain

**PWA Web Application** — React SPA with offline capabilities, push notifications, and mobile-first design.

### Existing Project Foundation

Proje aşağıdaki teknolojilerle kurulmuş durumda:

| Technology       | Version | Purpose               | Status       |
| ---------------- | ------- | --------------------- | ------------ |
| React            | 19.2.0  | UI Framework          | ✅ Installed |
| Vite             | 7.2.4   | Build Tool            | ✅ Installed |
| TypeScript       | 5.9.3   | Type Safety           | ✅ Installed |
| TailwindCSS      | 4.1.18  | Styling (CSS-first)   | ✅ Installed |
| Radix UI         | Latest  | Accessible Primitives | ✅ Installed |
| date-fns         | 4.1.0   | Date Utilities        | ✅ Installed |
| lucide-react     | 0.561.0 | Icons                 | ✅ Installed |
| sonner           | 2.0.7   | Toast Notifications   | ✅ Installed |
| react-day-picker | 9.12.0  | Date Picker           | ✅ Installed |
| ESLint           | 9.39.1  | Code Quality          | ✅ Installed |

### PRD Alignment Note

> PRD'de "React 18" belirtilmiş ancak proje React 19 ile kurulmuş. Bu **olumlu bir sapma**:
>
> - React 19, React 18'in tüm özelliklerini içerir
> - Concurrent rendering varsayılan
> - `use()` hook ile daha temiz data fetching
> - Actions API for form handling

### Additional Setup Required

**P0 - MVP Critical:**

```bash
npm install zustand
npm install -D vite-plugin-pwa
```

**P1 - Testing (Party Mode: P0'a yükseltildi):**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Package Compatibility Matrix (Verified Dec 2025)

| Package                | Version | React 19 | Vite 7  | Status  |
| ---------------------- | ------- | -------- | ------- | ------- |
| zustand                | 5.0.9   | ✅       | ✅      | Install |
| vite-plugin-pwa        | 0.17+   | ✅       | ⚠️ Test | Install |
| vitest                 | 3.2+    | ✅       | ✅      | Install |
| @testing-library/react | 16.0+   | ✅       | N/A     | Install |

### PWA Strategy Selected

**vite-plugin-pwa (Standard)** seçildi:

| Criteria        | Decision            |
| --------------- | ------------------- |
| Strategy        | `generateSW` (auto) |
| Caching         | Workbox built-in    |
| Manifest        | Auto-generated      |
| Notifications   | SW event listeners  |
| Update Strategy | `autoUpdate`        |

### Vite Config Extension Required

```typescript
// vite.config.ts - Updated
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "SubTracker",
        short_name: "SubTracker",
        description: "Abonelik takip uygulaması",
        theme_color: "#0f766e",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
  },
});
```

### CSS Theme Setup Required

`src/index.css` dosyasına OKLCH color palette eklenmeli:

```css
@import "tailwindcss";

@theme {
  /* Primary Palette */
  --color-primary: oklch(0.75 0.12 180);
  --color-secondary: oklch(0.65 0.15 260);
  --color-background: oklch(0.98 0.01 80);
  --color-foreground: oklch(0.25 0.02 250);

  /* Urgency Crescendo */
  --color-subtle: oklch(0.85 0.05 220);
  --color-attention: oklch(0.8 0.15 85);
  --color-urgent: oklch(0.65 0.2 25);
  --color-critical: oklch(0.55 0.25 25);

  /* Success */
  --color-success: oklch(0.7 0.15 165);
}
```

### Implementation Priority

| Priority | Task                    | Package/File       |
| -------- | ----------------------- | ------------------ |
| P0       | Install zustand         | npm                |
| P0       | Install vite-plugin-pwa | npm                |
| P0       | Install vitest + RTL    | npm                |
| P0       | Update vite.config.ts   | PWA + test config  |
| P0       | Create test setup file  | src/tests/setup.ts |
| P1       | Add OKLCH theme         | src/index.css      |
| P1       | Create PWA icons        | public/icons/      |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Schema validation approach
- Storage architecture
- Error handling strategy

**Important Decisions (Shape Architecture):**

- Routing strategy
- Component patterns
- Hosting platform

**Deferred Decisions (Post-MVP):**

- Multi-device sync architecture
- Analytics integration
- Push notification backend (if needed)

---

### Data Architecture

#### Schema Validation: Zod

| Aspect    | Decision                                                      |
| --------- | ------------------------------------------------------------- |
| Library   | Zod 3.x                                                       |
| Strategy  | Runtime + Compile time validation                             |
| Rationale | Type inference, form validation, localStorage data validation |

**Implementation Pattern:**

```typescript
// types/subscription.ts
import { z } from "zod";

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.enum(["TRY", "USD", "EUR"]),
  billingCycle: z.enum(["monthly", "yearly", "weekly"]),
  nextPaymentDate: z.string().datetime(),
  isActive: z.boolean(),
  notificationDaysBefore: z.number().int().min(0).max(30),
  cardId: z.string().uuid().optional(),
  categoryId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// Validation helper
export function validateSubscription(data: unknown): Subscription {
  return SubscriptionSchema.parse(data);
}
```

#### Storage Namespace Strategy: Domain-Based

| Store             | Key                        | Purpose           |
| ----------------- | -------------------------- | ----------------- |
| subscriptionStore | `subtracker-subscriptions` | Subscription data |
| settingsStore     | `subtracker-settings`      | User preferences  |
| cardStore         | `subtracker-cards`         | Payment cards     |
| uiStore           | (no persist)               | Modal/toast state |

**Implementation Pattern:**

```typescript
// stores/subscriptionStore.ts
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      // ... actions
    }),
    {
      name: import.meta.env.PROD
        ? "subtracker-subscriptions"
        : "subtracker-subscriptions-dev",
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          // Migration logic for v0 → v1
        }
        return persisted as SubscriptionState;
      },
    }
  )
);
```

#### Data Validation on Load

localStorage'dan yüklenen veri her zaman validate edilecek:

```typescript
// lib/storage.ts
import { SubscriptionSchema } from "@/types/subscription";

export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem("subtracker-subscriptions");
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const result = z
      .array(SubscriptionSchema)
      .safeParse(parsed.state?.subscriptions);

    if (result.success) {
      return result.data;
    } else {
      console.warn("Invalid subscription data, resetting...");
      return [];
    }
  } catch {
    return [];
  }
}
```

---

### Frontend Architecture

#### Routing Strategy: State-Based (No Library)

| Aspect    | Decision                                                   |
| --------- | ---------------------------------------------------------- |
| Approach  | React state-based navigation                               |
| Library   | None (useState)                                            |
| Rationale | Single page app, modal-based UX, no URL persistence needed |

**Implementation Pattern:**

```typescript
// App.tsx
type View = "dashboard" | "settings" | "history";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={setCurrentView} currentView={currentView} />

      {currentView === "dashboard" && <Dashboard />}
      {currentView === "settings" && <Settings />}
      {currentView === "history" && <History />}

      {/* Modals render on top */}
      <AddSubscriptionModal />
      <EditSubscriptionModal />
    </div>
  );
}
```

#### Component Pattern: Composition

| Pattern                      | Usage                              |
| ---------------------------- | ---------------------------------- |
| **Composition**              | Primary pattern for all components |
| **Container/Presentational** | Complex data-fetching components   |
| **Compound Components**      | Form groups, card tabs             |

**Example:**

```typescript
// Composition pattern
<SubscriptionList>
  {subscriptions.map((sub) => (
    <SubscriptionCard
      key={sub.id}
      subscription={sub}
      onEdit={() => openEditModal(sub.id)}
      onDelete={() => handleDelete(sub.id)}
    />
  ))}
</SubscriptionList>
```

#### Error Handling Strategy: Layered

| Layer             | Tool           | Purpose                            |
| ----------------- | -------------- | ---------------------------------- |
| **App Level**     | Error Boundary | Catch render errors, show fallback |
| **User Feedback** | Sonner toast   | Actions, validation errors         |
| **Console**       | console.error  | Development debugging              |

**Implementation:**

```typescript
// App.tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Toaster position="top-center" />
  <App />
</ErrorBoundary>
```

#### Form Handling: Controlled Components

| Aspect     | Decision                |
| ---------- | ----------------------- |
| Approach   | useState for form state |
| Validation | Zod schema validation   |
| Submission | Direct action calls     |

**Rationale:** Forms are simple (5-10 fields max). React Hook Form overhead not justified.

```typescript
// components/AddSubscriptionForm.tsx
function AddSubscriptionForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const result = SubscriptionSchema.safeParse({
      id: crypto.randomUUID(),
      name,
      amount: parseFloat(amount),
      // ...
    });

    if (result.success) {
      onSubmit(result.data);
    } else {
      setError(result.error.errors[0].message);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### Infrastructure & Deployment

#### Hosting Platform: Vercel

| Aspect   | Decision                                       |
| -------- | ---------------------------------------------- |
| Platform | Vercel                                         |
| Reason   | Zero-config, auto-deploy, free tier sufficient |
| Domain   | Custom domain (subtracker.app veya benzeri)    |

#### CI/CD Strategy: Vercel Auto

| Trigger        | Action            |
| -------------- | ----------------- |
| Push to `main` | Production deploy |
| Pull Request   | Preview deploy    |
| Manual         | N/A               |

**vercel.json:**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Environment Configuration: Vite .env

| File              | Purpose                      |
| ----------------- | ---------------------------- |
| `.env`            | Default values               |
| `.env.local`      | Local overrides (gitignored) |
| `.env.production` | Production values            |

```env
# .env
VITE_APP_NAME=SubTracker
VITE_STORAGE_PREFIX=subtracker
```

---

### Decision Summary Table

| Category          | Decision          | Rationale                   |
| ----------------- | ----------------- | --------------------------- |
| Schema Validation | Zod               | Runtime + type safety       |
| Storage           | Domain-based keys | Isolation, easier debugging |
| Migration         | Zustand persist   | Built-in, simple            |
| Routing           | State-based       | No URL needed, simple       |
| Components        | Composition       | shadcn pattern              |
| Error Handling    | Boundary + Toast  | Layered approach            |
| Forms             | Controlled        | Simple forms                |
| Hosting           | Vercel            | Zero-config                 |
| CI/CD             | Vercel Auto       | Simplicity                  |

---

### Packages to Install

```bash
# P0 - Core
npm install zustand zod
npm install -D vite-plugin-pwa

# P0 - Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories where AI agents could make different choices

| Category  | Conflicts                             | Priority |
| --------- | ------------------------------------- | -------- |
| Naming    | File/component/variable naming        | HIGH     |
| Structure | Test location, component organization | HIGH     |
| Format    | Date format, localStorage schema      | MEDIUM   |
| State     | Store organization, action naming     | HIGH     |
| Process   | Error handling, loading states        | MEDIUM   |

---

### Naming Patterns

#### File Naming Conventions

| Type            | Pattern                       | Example                      |
| --------------- | ----------------------------- | ---------------------------- |
| Component files | kebab-case                    | `subscription-card.tsx`      |
| Hook files      | kebab-case with use- prefix   | `use-countdown.ts`           |
| Store files     | kebab-case with -store suffix | `subscription-store.ts`      |
| Type files      | kebab-case                    | `subscription.ts`            |
| Utility files   | kebab-case                    | `date-utils.ts`              |
| Test files      | same name + .test             | `subscription-card.test.tsx` |

#### Code Naming Conventions

| Type             | Pattern                   | Example                |
| ---------------- | ------------------------- | ---------------------- |
| Components       | PascalCase                | `SubscriptionCard`     |
| Hooks            | camelCase with use prefix | `useCountdown`         |
| Functions        | camelCase, verb+noun      | `getNextPayment()`     |
| Variables        | camelCase                 | `nextPaymentDate`      |
| Constants        | SCREAMING_SNAKE_CASE      | `MAX_SUBSCRIPTIONS`    |
| Types/Interfaces | PascalCase, singular      | `Subscription`         |
| Stores           | use + Domain + Store      | `useSubscriptionStore` |
| Zod Schemas      | PascalCase + Schema       | `SubscriptionSchema`   |

#### Examples

```typescript
// ✅ GOOD
const subscription = useSubscriptionStore((state) => state.subscriptions[0]);
const nextPaymentDate = subscription.nextPaymentDate;
const daysUntil = calculateDaysUntil(nextPaymentDate);

// ❌ BAD
const sub = useSubscriptionStore((state) => state.subscriptions[0]);
const next_payment = sub.next_payment_date;
const days = calc_days(next_payment);
```

---

### Structure Patterns

#### Project Organization

```
src/
├── components/
│   ├── ui/                     # shadcn components (DO NOT MODIFY)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── features/               # Feature-specific components
│   │   ├── CountdownHero/
│   │   │   ├── countdown-hero.tsx
│   │   │   ├── countdown-hero.test.tsx
│   │   │   ├── countdown-hero.skeleton.tsx
│   │   │   └── index.ts
│   │   ├── SubscriptionCard/
│   │   ├── QuickAddGrid/
│   │   └── SubscriptionForm/
│   └── layout/                 # Layout components
│       ├── header.tsx
│       ├── dashboard.tsx
│       └── empty-state.tsx
├── hooks/                      # Custom hooks
│   ├── use-countdown.ts
│   ├── use-countdown.test.ts
│   ├── use-notifications.ts
│   └── use-local-storage.ts
├── stores/                     # Zustand stores
│   ├── subscription-store.ts
│   ├── subscription-store.test.ts
│   ├── settings-store.ts
│   └── card-store.ts
├── types/                      # TypeScript types & Zod schemas
│   ├── subscription.ts
│   ├── settings.ts
│   ├── card.ts
│   └── index.ts
├── utils/                      # Pure utility functions
│   ├── urgency.ts
│   ├── date-utils.ts
│   └── formatters.ts
├── lib/                        # Third-party integrations
│   └── utils.ts                # shadcn cn() helper
├── tests/                      # Test setup & fixtures
│   ├── setup.ts
│   └── fixtures/
├── App.tsx
├── main.tsx
└── index.css
```

#### File Organization Rules

| Rule                      | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| **Co-located Tests**      | Test files next to source files: `component.tsx` + `component.test.tsx` |
| **Index Exports**         | Each feature folder has `index.ts` for clean imports                    |
| **No Deep Nesting**       | Max 3 levels deep in any directory                                      |
| **Single Responsibility** | One component/hook/store per file                                       |

---

### Format Patterns

#### Date & Time Formats

| Context                | Format          | Example                      |
| ---------------------- | --------------- | ---------------------------- |
| Storage (localStorage) | ISO 8601 string | `"2025-12-17T00:00:00.000Z"` |
| API (FX rates)         | ISO 8601 string | `"2025-12-17T00:00:00.000Z"` |
| Display (Turkish)      | date-fns format | `"17 Ara 2025"`              |
| Display (Short)        | date-fns format | `"17 Ara"`                   |

**Implementation:**

```typescript
// utils/date-utils.ts
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "d MMM yyyy", { locale: tr });
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { locale: tr, addSuffix: true });
}
```

#### Currency Formats

| Context | Format                                 | Example                               |
| ------- | -------------------------------------- | ------------------------------------- |
| Storage | `{ amount: number, currency: string }` | `{ amount: 149.99, currency: 'TRY' }` |
| Display | Intl.NumberFormat                      | `"₺149,99"`                           |

**Implementation:**

```typescript
// utils/formatters.ts
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amount);
}
```

#### ID Generation

```typescript
// Always use crypto.randomUUID() for IDs
const id = crypto.randomUUID(); // "550e8400-e29b-41d4-a716-446655440000"
```

---

### State Management Patterns

#### Store Structure Pattern

```typescript
// stores/subscription-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Subscription, SubscriptionSchema } from "@/types/subscription";

interface SubscriptionState {
  // Data
  subscriptions: Subscription[];

  // Actions (verb + noun)
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  // Bulk actions
  importSubscriptions: (subscriptions: Subscription[]) => void;
  clearAllSubscriptions: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, subscription],
        })),

      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          ),
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      importSubscriptions: (subscriptions) => set({ subscriptions }),

      clearAllSubscriptions: () => set({ subscriptions: [] }),
    }),
    {
      name: import.meta.env.PROD
        ? "subtracker-subscriptions"
        : "subtracker-subscriptions-dev",
      version: 1,
    }
  )
);
```

#### Selector Pattern

```typescript
// Always use selectors for derived data - prevents unnecessary re-renders
// ✅ GOOD - Only re-renders when active subscriptions change
const activeSubscriptions = useSubscriptionStore((state) =>
  state.subscriptions.filter((s) => s.isActive)
);

// ✅ GOOD - Computed value via selector
const monthlyTotal = useSubscriptionStore((state) =>
  state.subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + normalizeToMonthly(s.amount, s.billingCycle), 0)
);

// ❌ BAD - Subscribes to entire store
const store = useSubscriptionStore();
const active = store.subscriptions.filter((s) => s.isActive);
```

---

### Process Patterns

#### Error Handling Pattern

| Layer            | Tool          | Usage                                    |
| ---------------- | ------------- | ---------------------------------------- |
| **App Level**    | ErrorBoundary | Catches render errors, shows fallback UI |
| **User Actions** | Sonner toast  | Shows success/error for user actions     |
| **Validation**   | Inline errors | Shows field-level validation errors      |
| **Development**  | console.error | Logs errors (dev only)                   |

**Implementation:**

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("App error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />;
    }
    return this.props.children;
  }
}

// Usage in main.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

```typescript
// User action error handling pattern
import { toast } from "sonner";

function handleDelete(id: string) {
  try {
    deleteSubscription(id);
    toast.success("Abonelik silindi");
  } catch (error) {
    toast.error("Abonelik silinemedi");
    console.error("Delete failed:", error);
  }
}
```

#### Loading State Pattern

| Type                  | Implementation                 |
| --------------------- | ------------------------------ |
| **Component Loading** | Local useState + Skeleton      |
| **Global Loading**    | NOT USED (no API calls in MVP) |

```typescript
// Component loading pattern
function SubscriptionList() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate hydration delay
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SubscriptionListSkeleton />;
  }

  if (subscriptions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  );
}
```

---

### Enforcement Guidelines

**All AI Agents MUST:**

1. ✅ Follow file naming: kebab-case for files, PascalCase for exports
2. ✅ Co-locate tests: `*.test.tsx` next to source file
3. ✅ Use selectors: Never destructure entire store
4. ✅ Use Zod schemas: Validate all external/stored data
5. ✅ Use sonner for user feedback: Not console.log
6. ✅ Follow folder structure: features/, hooks/, stores/, types/, utils/
7. ✅ Export via index.ts: Clean imports from feature folders

**Anti-Patterns to AVOID:**

1. ❌ `console.log` for user feedback — use toast
2. ❌ Inline styles — use Tailwind classes
3. ❌ Modifying `components/ui/` — shadcn components are read-only
4. ❌ Deep nesting (>3 levels) — flatten structure
5. ❌ Global loading states — use per-component loading
6. ❌ Any type — always type properly
7. ❌ snake_case in TypeScript — use camelCase

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
subtracker/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .env
├── .env.example
├── .gitignore
├── vercel.json
├── index.html
│
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component, view routing
│   ├── index.css                   # Tailwind + OKLCH theme
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn components (READ-ONLY)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── features/               # Custom feature components
│   │   │   ├── CountdownHero/
│   │   │   │   ├── countdown-hero.tsx
│   │   │   │   ├── countdown-hero.test.tsx
│   │   │   │   ├── countdown-hero.skeleton.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SubscriptionCard/
│   │   │   │   ├── subscription-card.tsx
│   │   │   │   ├── subscription-card.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SubscriptionForm/
│   │   │   │   ├── subscription-form.tsx
│   │   │   │   ├── subscription-form.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── QuickAddGrid/
│   │   │   │   ├── quick-add-grid.tsx
│   │   │   │   ├── quick-add-presets.ts
│   │   │   │   └── index.ts
│   │   │   ├── CardManager/
│   │   │   │   ├── card-manager.tsx
│   │   │   │   └── index.ts
│   │   │   └── IOSInstallPrompt/
│   │   │       ├── ios-install-prompt.tsx
│   │   │       └── index.ts
│   │   │
│   │   └── layout/                 # Layout components
│   │       ├── header.tsx
│   │       ├── dashboard.tsx
│   │       ├── settings-view.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-fallback.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── use-countdown.ts
│   │   ├── use-countdown.test.ts
│   │   ├── use-notifications.ts
│   │   ├── use-ios-detection.ts
│   │   └── use-visibility.ts
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── subscription-store.ts
│   │   ├── subscription-store.test.ts
│   │   ├── settings-store.ts
│   │   ├── card-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/                      # TypeScript types + Zod schemas
│   │   ├── subscription.ts
│   │   ├── settings.ts
│   │   ├── card.ts
│   │   └── index.ts
│   │
│   ├── utils/                      # Pure utility functions
│   │   ├── urgency.ts
│   │   ├── urgency.test.ts
│   │   ├── date-utils.ts
│   │   ├── formatters.ts
│   │   └── export-import.ts
│   │
│   ├── lib/                        # Third-party integrations
│   │   └── utils.ts                # shadcn cn() helper
│   │
│   └── tests/                      # Test setup
│       ├── setup.ts
│       └── fixtures/
│           └── subscriptions.ts
│
└── docs/                           # Project documentation
    ├── prd.md
    ├── ux-design-specification.md
    └── architecture.md
```

### Requirements to Structure Mapping

| PRD Feature           | Primary Location                      | Related Files                   |
| --------------------- | ------------------------------------- | ------------------------------- |
| **Dashboard**         | `components/layout/dashboard.tsx`     | CountdownHero, SubscriptionCard |
| **CountdownHero**     | `components/features/CountdownHero/`  | use-countdown hook              |
| **Subscription CRUD** | `stores/subscription-store.ts`        | SubscriptionForm, Zod schema    |
| **Quick Add**         | `components/features/QuickAddGrid/`   | quick-add-presets.ts            |
| **Cards**             | `stores/card-store.ts`                | CardManager component           |
| **Notifications**     | `hooks/use-notifications.ts`          | IOSInstallPrompt                |
| **Settings**          | `components/layout/settings-view.tsx` | settings-store.ts               |
| **Export/Import**     | `utils/export-import.ts`              | Settings view integration       |

### Architectural Boundaries

#### Component Communication Flow

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Dashboard  │  │  Settings   │  │ History  │ │
│  └──────┬──────┘  └─────────────┘  └──────────┘ │
│         │                                        │
│  ┌──────┴──────────────────────────────────┐    │
│  │           Feature Components             │    │
│  │  CountdownHero │ SubscriptionCard │ ...  │    │
│  └──────────────────────────────────────────┘    │
│                      │                           │
│  ┌───────────────────┴───────────────────────┐  │
│  │              Zustand Stores               │  │
│  │  subscriptionStore │ settingsStore │ ...  │  │
│  └───────────────────────────────────────────┘  │
│                      │                           │
│  ┌───────────────────┴───────────────────────┐  │
│  │              localStorage                 │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### Data Flow Pattern

```
User Action (click, submit)
    │
    ▼
Component (SubscriptionForm)
    │ calls store action
    ▼
Zustand Store (addSubscription)
    │ persist middleware auto-saves
    ▼
localStorage (subtracker-subscriptions)
    │ Zustand notifies subscribers
    ▼
Components re-render (via selectors)
    │
    ▼
UI Update (SubscriptionCard list)
```

#### Layer Responsibilities

| Layer          | Responsibility                   | Example                             |
| -------------- | -------------------------------- | ----------------------------------- |
| **Components** | UI rendering, user interaction   | SubscriptionCard displays data      |
| **Hooks**      | Reusable logic, side effects     | useCountdown calculates time        |
| **Stores**     | State management, business logic | subscriptionStore.addSubscription   |
| **Types**      | Data shapes, validation          | SubscriptionSchema.parse()          |
| **Utils**      | Pure functions, calculations     | formatCurrency(), getUrgencyLevel() |

### Integration Points

| Integration           | Location                         | Purpose                       |
| --------------------- | -------------------------------- | ----------------------------- |
| **Service Worker**    | vite-plugin-pwa (auto-generated) | Caching, offline support      |
| **Notifications API** | `hooks/use-notifications.ts`     | Push notification permissions |
| **localStorage**      | Zustand persist middleware       | Data persistence              |
| **FX API (optional)** | `utils/fx-rates.ts`              | Currency conversion           |
| **Visibility API**    | `hooks/use-visibility.ts`        | Tab focus detection           |

### File Naming Quick Reference

| File Type                | Naming Pattern   | Example                       |
| ------------------------ | ---------------- | ----------------------------- |
| Feature component folder | PascalCase       | `CountdownHero/`              |
| Component file           | kebab-case       | `countdown-hero.tsx`          |
| Test file                | same + .test     | `countdown-hero.test.tsx`     |
| Skeleton file            | same + .skeleton | `countdown-hero.skeleton.tsx` |
| Index export             | always index.ts  | `index.ts`                    |
| Hook file                | use- prefix      | `use-countdown.ts`            |
| Store file               | -store suffix    | `subscription-store.ts`       |
| Type file                | domain name      | `subscription.ts`             |
| Util file                | descriptive      | `date-utils.ts`               |

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:

- React 19.2.0 ↔ Vite 7.2.4 ↔ TypeScript 5.9.3 ✅
- Zustand 5.0.9 ↔ React 19 concurrent mode ✅
- TailwindCSS 4.1.18 ↔ shadcn/ui (Radix) ✅
- vite-plugin-pwa ↔ Vite 7 (needs testing, low risk) ⚠️

**Pattern Consistency:**

- Naming conventions consistent across all areas ✅
- Structure patterns align with React + Vite conventions ✅
- State management patterns follow Zustand best practices ✅
- Error handling patterns support composition model ✅

**Structure Alignment:**

- Project structure supports all architectural decisions ✅
- Component boundaries properly defined ✅
- Integration points clearly specified ✅
- Test organization follows co-location pattern ✅

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR Category             | Architectural Support               | Status |
| ----------------------- | ----------------------------------- | ------ |
| Subscription Management | subscriptionStore + CRUD actions    | ✅     |
| Dashboard Display       | Dashboard component + CountdownHero | ✅     |
| Quick Add               | QuickAddGrid + presets data         | ✅     |
| Notifications           | useNotifications + IOSInstallPrompt | ✅     |
| Card Management         | cardStore + CardManager             | ✅     |
| Settings                | settingsStore + Settings view       | ✅     |
| Data Export/Import      | export-import utility               | ✅     |
| PWA Features            | vite-plugin-pwa                     | ✅     |

**Non-Functional Requirements Coverage:**

| NFR               | Target      | Architectural Support         | Status |
| ----------------- | ----------- | ----------------------------- | ------ |
| Performance - FCP | <1s         | Vite + code splitting         | ✅     |
| Performance - LCP | <1.5s       | Optimized bundle              | ✅     |
| Bundle Size       | <350KB      | Tree shaking, vendor split    | ✅     |
| Offline Support   | Full        | Service Worker + localStorage | ✅     |
| Accessibility     | WCAG 2.1 AA | shadcn/ui + ARIA              | ✅     |
| PWA Score         | >90         | Manifest + SW                 | ✅     |

### Implementation Readiness Validation ✅

**Decision Completeness:**

- [x] All critical decisions documented with exact versions
- [x] Technology stack fully specified and verified (Dec 2025)
- [x] Integration patterns defined with code examples
- [x] Performance considerations addressed

**Structure Completeness:**

- [x] Complete directory structure with all files
- [x] Component organization by feature
- [x] Test co-location pattern defined
- [x] Integration points mapped

**Pattern Completeness:**

- [x] Naming conventions comprehensive (5 categories)
- [x] Structure patterns defined with folder tree
- [x] State management patterns with selectors
- [x] Error handling patterns (3 layers)
- [x] Anti-patterns documented (7 items)

### Gap Analysis Results

| Priority        | Gap                                  | Resolution                              |
| --------------- | ------------------------------------ | --------------------------------------- |
| ⚠️ Important    | vite-plugin-pwa Vite 7 compatibility | Test during first implementation sprint |
| 📝 Nice-to-Have | FX API implementation details        | Deferred to Growth phase                |
| 📝 Nice-to-Have | Framer Motion for animations         | Optional, can add if needed             |

**No critical gaps identified.**

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (iOS, localStorage)
- [x] Cross-cutting concerns mapped (5 concerns)

**✅ Architectural Decisions**

- [x] All critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] State management patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** 🟢 READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

- All technology versions verified via web search (Dec 2025)
- Comprehensive patterns prevent AI agent conflicts
- PRD and UX spec requirements fully covered

**Key Strengths:**

1. Simple, focused architecture (no backend complexity)
2. Proven technology stack (React + Vite + Zustand)
3. Clear patterns for consistent implementation
4. Complete project structure with file mappings
5. Party Mode insights incorporated

**Areas for Future Enhancement:**

1. Multi-device sync (Growth phase)
2. Bank integration (Vision phase)
3. Advanced analytics (Growth phase)

---

## Implementation Handoff

### First Implementation Steps

```bash
# 1. Install core dependencies
npm install zustand zod

# 2. Install PWA plugin
npm install -D vite-plugin-pwa

# 3. Install testing tools
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 4. Create folder structure
mkdir -p src/{components/{features,layout},hooks,stores,types,utils,tests/fixtures}
```

### AI Agent Implementation Guidelines

1. **Follow all architectural decisions exactly as documented**
2. **Use implementation patterns consistently across all components**
3. **Respect project structure and boundaries**
4. **Never modify `components/ui/` directory** (shadcn read-only)
5. **Use selectors for all store access** (no full store destructuring)
6. **Co-locate tests** with source files
7. **Refer to this document for all architectural questions**

### Priority Order for Implementation

| Priority | Component           | Dependencies       |
| -------- | ------------------- | ------------------ |
| P0       | Types + Zod schemas | None               |
| P0       | Zustand stores      | Types              |
| P0       | Core hooks          | Stores             |
| P1       | Layout components   | Hooks              |
| P1       | Feature components  | Layout, Hooks      |
| P1       | PWA configuration   | Feature components |
| P2       | Tests               | All above          |

---

**Architecture Document Complete** ✅

_Last Updated: 17 Aralık 2025_
_Workflow: BMAD Architecture v2_
_Status: Ready for Implementation_
