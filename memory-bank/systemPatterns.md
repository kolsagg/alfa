# System Patterns - SubTracker

**Son Güncelleme:** 2025-12-17

## Mimari Kararlar

### State Management Architecture

**Teknoloji:** Zustand 5.0.9 + persist + devtools

**Kritik Pattern: Store Factory**

```typescript
// src/stores/create-store.ts
export const createStore = <T>(
  storeInitializer: StateCreator<T>,
  options: StoreFactoryOptions<T>
) => {
  /* ... */
};
```

**Avantajları:**

- Tutarlı middleware stack (persist + devtools)
- Environment-aware naming otomatik
- Migration ve validation merkezi
- Type-safe pattern enforcement

### Persistence Strategy

**localStorage Tabanlı (Backend yok):**

- Key pattern: `subtracker-{domain}[-dev]`
- Version management: Schema version tracking
- Migration: version 0 → 1 → 2... upgrade path
- Validation: Zod ile rehydration sırasında kontrol

**Kritik Pattern: Environment Awareness**

```typescript
export const getStorageName = (domain: string): string =>
  import.meta.env.PROD ? `subtracker-${domain}` : `subtracker-${domain}-dev`;
```

### Type Safety Architecture

**Zod-First Approach:**

1. Zod schema tanımla (`SettingsSchema`)
2. TypeScript type türet (`type Settings = z.infer<typeof SettingsSchema>`)
3. Runtime validation yap (`schema.safeParse()`)

**Avantajları:**

- Single source of truth
- Runtime + compile-time güvenlik
- Migration validation kolay

## Component Architecture

### UI Component Library

**shadcn/ui Pattern:**

- Components: `src/components/ui/` (READ-ONLY)
- Customization: Extend değil, wrap et
- Theme: CSS variables ile

**Kritik Kural:** shadcn components'ları ASLA düzenleme!

### Custom Components

_Henüz oluşturulmadı - Story 2+ ile gelecek_

## Data Flow Patterns

### Store → Component Flow

```typescript
// Component'te kullanım
const theme = useSettingsStore((s) => s.theme);
const setTheme = useSettingsStore((s) => s.setTheme);

// Selector pattern (re-render optimize)
const notification = useSettingsStore((s) => ({
  permission: s.notificationPermission,
  time: s.notificationTime,
}));
```

### Persist Flow

```
User Action → setState → Zustand → Persist Middleware → localStorage
                                  ↓
                            Partialize (optional)
                                  ↓
                            JSON.stringify
                                  ↓
                        localStorage.setItem(key, value)
```

### Rehydration Flow

```
App Start → create store → persist.rehydrate() → localStorage.getItem()
                                                       ↓
                                                  JSON.parse
                                                       ↓
                                              onRehydrateStorage
                                                       ↓
                                              Zod validation
                                                       ↓
                                           ✓ Valid → setState
                                           ✗ Invalid → warn + reset
```

## Testing Architecture

### Test Strategy

**Unit Tests:**

- Store logic (state + actions)
- Persistence behavior
- Migration logic
- Validation logic

**Test Location:** Co-located (`settings-store.test.ts`)

**Kritik Pattern: localStorage Mock**

```typescript
// src/tests/setup.ts
const localStorageMock = {
  /* ... */
};
global.localStorage = localStorageMock as Storage;
```

### Test Coverage Requirements

- ✅ All store actions
- ✅ Persist/rehydrate cycle
- ✅ Migration scenarios
- ✅ Validation edge cases
- ✅ Environment-specific behavior

## Critical Implementation Paths

### Path 1: Adding New Store

```typescript
// 1. Define Zod schema
// src/types/my-domain.ts
export const MySchema = z.object({
  /* ... */
});
export type MyType = z.infer<typeof MySchema>;

// 2. Create store
// src/stores/my-store.ts
interface MyState extends MyType {
  someAction: () => void;
}

export const useMyStore = createStore<MyState>(
  (set) => ({
    /* initial state + actions */
  }),
  {
    name: "MyStore",
    version: 1,
    migrate: (persisted, version) => {
      /* ... */
    },
    onRehydrateStorage: (state) => {
      /* Zod validate */
    },
  }
);

// 3. Write tests
// src/stores/my-store.test.ts
describe("useMyStore", () => {
  /* ... */
});
```

### Path 2: Schema Migration

```typescript
// Version upgrade: v1 → v2
migrate: (persistedState: unknown, version: number) => {
  if (version === 1) {
    const oldState = persistedState as Record<string, unknown>;
    return {
      ...oldState,
      newField: defaultValue,
    } as MyState;
  }
  return persistedState as MyState;
};
```

### Path 3: Selective Persistence

```typescript
// Sadece bazı field'ları persist et
createStore<MyState>(
  (set) => ({
    /* ... */
  }),
  {
    name: "MyStore",
    partialize: (state) => ({
      // Sadece bunları kaydet
      field1: state.field1,
      field2: state.field2,
      // actions'ları ve geçici state'i kaydetme
    }),
  }
);
```

## Key Technical Decisions

### Decision 1: Zustand vs Redux vs Context

- **Neden Zustand?** Basit API, minimal boilerplate, React 19 compatible
- **Persist:** Built-in middleware
- **DevTools:** Built-in support
- **Type Safety:** Excellent TypeScript support

### Decision 2: localStorage vs IndexedDB

- **Neden localStorage?** Basitlik, senkron API, cross-browser
- **Limitation:** 5-10MB limit (yeterli abonelik verisi için)
- **Future:** IndexedDB migration gerekirse migrate pattern hazır

### Decision 3: Zod vs Yup vs TypeScript-only

- **Neden Zod?** Runtime validation, type inference, migration validation
- **Kullanım:** Schema tanımı + safeParse pattern
- **Avantaj:** localStorage'dan gelen corrupt data'yı catch eder

### Decision 4: Co-located Tests vs Separate /tests

- **Neden Co-located?** Proximity, easy refactoring, clear ownership
- **Pattern:** `my-store.ts` + `my-store.test.ts` yan yana
- **Exception:** Setup dosyası `src/tests/setup.ts`

## Performance Considerations

### Store Design

- Küçük, focused store'lar (settings, ui, subscription ayrı)
- Selector pattern ile re-render optimize
- Non-persisted store'lar için `skipPersist: true`

### Persistence

- Partialize ile sadece gerekli alanları kaydet
- Debounce yok (Zustand persist default behavior yeterli)

## Security Patterns

_localStorage tabanlı olduğu için XSS koruması critical:_

- User input'u sanitize et
- CSP headers (future - deployment)
- No sensitive data in localStorage (passwords, tokens yok zaten)
