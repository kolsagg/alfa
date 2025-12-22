import { create } from "zustand";
import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { PersistOptions } from "zustand/middleware";

export const getStorageName = (domain: string): string =>
  import.meta.env.PROD ? `subtracker-${domain}` : `subtracker-${domain}-dev`;

export type StoreFactoryOptions<T> = {
  name: string;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T | Promise<T>;
  onRehydrateStorage?: (
    state: T | undefined
  ) => ((state?: T, error?: Error) => void) | void;
  skipPersist?: boolean;
  partialize?: (state: T) => Partial<T>;
  merge?: (persistedState: unknown, currentState: T) => T;
  /**
   * Optional override for the persistence key (excluding prefix).
   * If not provided, defaults to name.toLowerCase().replace("store", "")
   */
  storageName?: string;
};

// Persist API interface
interface PersistApi<T> {
  rehydrate: () => Promise<void>;
  hasHydrated: () => boolean;
  onHydrate: (fn: (state: T) => void) => () => void;
  onFinishHydration: (fn: (state: T) => void) => () => void;
  getOptions: () => Partial<PersistOptions<T, Partial<T>>>;
  setOptions: (options: Partial<PersistOptions<T, Partial<T>>>) => void;
  clearStorage: () => void;
}

// Type for store with persist API exposed - extends UseBoundStore with persist
export type StoreWithPersist<T> = UseBoundStore<StoreApi<T>> & {
  persist: PersistApi<T>;
};

/**
 * Creates a Zustand store with standardized middleware configuration
 *
 * @template T - Store state type
 * @param storeInitializer - Function to initialize store state and actions
 * @param options - Configuration options for the store
 * @returns Configured Zustand store with persist (if enabled) and devtools
 *
 * @example
 * ```ts
 * const useMyStore = createStore<MyState>(
 *   (set) => ({ count: 0, increment: () => set(s => ({ count: s.count + 1 })) }),
 *   { name: 'MyStore', version: 1 }
 * );
 * ```
 */
export function createStore<T>(
  storeInitializer: StateCreator<T, [], []>,
  options: StoreFactoryOptions<T>
): StoreWithPersist<T> {
  if (options.skipPersist) {
    const store = create<T>()(
      devtools(storeInitializer, {
        name: options.name,
        enabled: !import.meta.env.PROD,
      })
    );
    // For non-persist stores, add a no-op persist API
    return Object.assign(store, {
      persist: {
        rehydrate: async () => {},
        hasHydrated: () => true,
        onHydrate: () => () => {},
        onFinishHydration: () => () => {},
        getOptions: () => ({}),
        setOptions: () => {},
        clearStorage: () => {},
      },
    }) as StoreWithPersist<T>;
  }

  const store = create<T>()(
    devtools(
      persist(storeInitializer, {
        name: getStorageName(
          options.storageName ?? options.name.toLowerCase().replace("store", "")
        ),
        version: options.version || 1,
        migrate: options.migrate,
        ...(options.partialize && { partialize: options.partialize }),
        ...(options.merge && { merge: options.merge }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error(`[${options.name}] Rehydration error:`, error);
          }
          if (options.onRehydrateStorage && state) {
            const validateData = options.onRehydrateStorage(state);
            if (typeof validateData === "function")
              validateData(state, error as Error | undefined);
          }
        },
      }),
      { name: options.name, enabled: !import.meta.env.PROD }
    )
  );

  // The persist middleware attaches the persist API to the store
  // We need to cast to access it since TypeScript doesn't know about it
  return store as unknown as StoreWithPersist<T>;
}
