# Tech Context - SubTracker

**Son Güncelleme:** 2025-12-17

## Technology Stack

### Core Framework

- **React:** 19.0.0 (latest)
- **TypeScript:** 5.x (strict mode)
- **Vite:** 7.0.5 (build tool)
- **Node:** v22+ recommended

### State Management

- **Zustand:** 5.0.9
  - `zustand/middleware` → persist, devtools
  - React 19 compatible
  - ESM imports

### Validation & Types

- **Zod:** 3.24.1
  - Schema definitions
  - Runtime validation
  - Type inference

### UI & Styling

- **Tailwind CSS:** v4.0.0 (@next)
- **shadcn/ui:** Latest (via `components.json`)
- **Radix UI:** Primitives (via shadcn)
- **Class Variance Authority:** Button variants
- **clsx + tailwind-merge:** Class merging

### Testing

- **Vitest:** 4.0.16
- **@testing-library/react:** 16.1.0
- **@testing-library/jest-dom:** 6.6.3
- **@testing-library/user-event:** 14.5.2
- **jsdom:** 26.0.0
- **@vitest/coverage-v8:** Test coverage

### Development Tools

- **ESLint:** 9.x
  - `@eslint/js`
  - `typescript-eslint`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-react-refresh`
- **Prettier:** (implicit via ESLint)

### PWA (Gelecek)

- **vite-plugin-pwa:** TBD (Story 1.2'de kurulacak)
- **workbox:** Service worker management

## Development Setup

### Package Scripts

```json
{
  "dev": "vite", // Dev server
  "build": "tsc -b && vite build", // Production build
  "lint": "eslint .", // Lint check
  "preview": "vite preview", // Preview build
  "test": "vitest", // Run tests (watch)
  "test:ui": "vitest --ui", // Vitest UI
  "test:coverage": "vitest --coverage" // Coverage report
}
```

### Vite Configuration

**Path Alias:**

```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

**Test Config:**

```typescript
test: {
  globals: true,
  environment: "jsdom",
  setupFiles: "./src/tests/setup.ts",
  include: ["src/**/*.test.{ts,tsx}"],
  coverage: {
    reporter: ["text", "json", "html"],
    exclude: ["node_modules/", "src/tests/"],
  },
}
```

### TypeScript Configuration

**tsconfig.json highlights:**

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- Path mapping: `@/*` → `./src/*`

### Environment Variables

**Development:**

- `import.meta.env.DEV` → true
- `import.meta.env.PROD` → false
- Storage keys: `subtracker-{domain}-dev`

**Production:**

- `import.meta.env.PROD` → true
- Storage keys: `subtracker-{domain}`

## Technical Constraints

### Browser Support

- **Primary:** Chrome, Safari (iOS 16.4+)
- **PWA Install:** iOS Safari, Android Chrome
- **localStorage:** All modern browsers
- **Service Worker:** Progressive enhancement

### Data Storage

- **Max Size:** ~5-10MB (localStorage limit)
- **Format:** JSON serialized
- **Persistence:** Browser storage only (no backend)

### Offline Support

- **Required:** Full offline functionality
- **Strategy:** Service worker + cache-first
- **Sync:** Cross-tab via storage events

## Dependencies Rationale

### Why React 19?

- Latest features (use, optimistic updates)
- Better TypeScript support
- Concurrent rendering improvements

### Why Zustand over Redux?

- Minimal boilerplate
- No provider wrapper needed
- Built-in persistence
- Excellent TS support
- Perfect for localStorage-only apps

### Why Tailwind v4?

- New CSS-first engine
- Better performance
- Modern syntax
- Vite plugin support

### Why Vitest over Jest?

- Vite-native (faster)
- ESM support out of box
- Better watch mode
- UI mode built-in

## Tool Usage Patterns

### Zustand Best Practices

```typescript
// ✅ Good: Selector function
const theme = useSettingsStore((s) => s.theme);

// ❌ Bad: Whole store (unnecessary re-renders)
const store = useSettingsStore();
```

### Zod Best Practices

```typescript
// ✅ Good: safeParse with error handling
const result = schema.safeParse(data);
if (!result.success) {
  console.warn("Validation failed:", result.error);
  return defaults;
}

// ❌ Bad: parse (throws on error)
const data = schema.parse(untrustedData);
```

### Testing Best Practices

```typescript
// ✅ Good: Reset state before each test
beforeEach(() => {
  useMyStore.setState(initialState);
  localStorage.clear();
});

// ✅ Good: Wait for async persistence
await new Promise((r) => setTimeout(r, 100));

// ✅ Good: Spy cleanup
const spy = vi.spyOn(console, "warn");
// ... test
spy.mockRestore();
```

## Build & Deployment

### Development

```bash
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
npm run build
# → dist/
# - index.html
# - assets/
```

### Preview Build

```bash
npm run preview
# Test production build locally
```

## Known Issues & Workarounds

### Issue 1: shadcn ESLint Warnings

- **Problem:** `badge.tsx`, `button.tsx` - react-refresh/only-export-components
- **Workaround:** Ignore (shadcn read-only, can't fix)
- **Status:** Documented in architecture

### Issue 2: BMAD Framework ESLint

- **Problem:** `.bmad/` files have ESLint errors
- **Workaround:** Not our code, ignore
- **Status:** Acceptable

### Issue 3: Zustand StateCreator Type

- **Problem:** Generic `any` parameters needed for flexibility
- **Solution:** Use `StateCreator<T>` from zustand
- **Status:** Fixed in Story 1.1 code review

## Version Compatibility Matrix

| Package                | Version | React 19 | Vite 7 | Notes            |
| ---------------------- | ------- | -------- | ------ | ---------------- |
| zustand                | 5.0.9   | ✅       | ✅     | Tested, working  |
| zod                    | 3.24.1  | ✅       | ✅     | No issues        |
| vitest                 | 4.0.16  | ✅       | ✅     | Native Vite      |
| @testing-library/react | 16.1.0  | ✅       | ✅     | React 19 support |
| tailwindcss            | @next   | ✅       | ✅     | V4 beta          |

## Future Tech Debt

- [ ] PWA manifest (Story 1.2)
- [ ] Service worker setup (Story 1.2)
- [ ] IndexedDB fallback (if needed)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Performance monitoring
- [ ] Error boundary implementation
