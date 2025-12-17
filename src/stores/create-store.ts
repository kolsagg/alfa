import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export const getStorageName = (domain: string): string =>
  import.meta.env.PROD ? `subtracker-${domain}` : `subtracker-${domain}-dev`;

export type StoreFactoryOptions<T> = {
  name: string;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T | Promise<T>;
  onRehydrateStorage?: (
    state: T
  ) => ((state?: T, error?: Error) => void) | void;
  skipPersist?: boolean;
  partialize?: (state: T) => Partial<T>;
  merge?: (persistedState: unknown, currentState: T) => T;
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
export const createStore = <T>(
  storeInitializer: (
    set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void,
    get: () => T,
    api: unknown
  ) => T,
  options: StoreFactoryOptions<T>
) => {
  if (options.skipPersist) {
    return create<T>()(
      devtools(storeInitializer, {
        name: options.name,
        enabled: !import.meta.env.PROD,
      })
    );
  }

  return create<T>()(
    devtools(
      persist(storeInitializer, {
        name: getStorageName(options.name.toLowerCase().replace("store", "")),
        version: options.version || 1,
        migrate: options.migrate,
        ...(options.partialize && { partialize: options.partialize }),
        ...(options.merge && { merge: options.merge }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error(`[${options.name}] Rehydration error:`, error);
          }
          if (options.onRehydrateStorage && state) {
            // We need to cast here because of how zustand types work internally with middleware
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const validateData = options.onRehydrateStorage(state) as any;
            if (typeof validateData === "function") validateData(state, error);
          }
        },
      }),
      { name: options.name, enabled: !import.meta.env.PROD }
    )
  );
};
