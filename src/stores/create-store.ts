import { create } from "zustand";
import { persist, devtools, PersistOptions } from "zustand/middleware";

export const getStorageName = (domain: string): string =>
  import.meta.env.PROD ? `subtracker-${domain}` : `subtracker-${domain}-dev`;

export type StoreFactoryOptions<T> = {
  name: string;
  version?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrate?: (persistedState: any, version: number) => T | Promise<T>;
  onRehydrateStorage?: (
    state: T
  ) => ((state?: T, error?: Error) => void) | void;
  skipPersist?: boolean;
};

// Generic store creator to enforce patterns
// straightforward wrapper to reduce boilerplate for standard stores
export const createStore = <T>(
  storeInitializer: (set: any, get: any, api: any) => T,
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
      } as PersistOptions<T>),
      { name: options.name, enabled: !import.meta.env.PROD }
    )
  );
};
