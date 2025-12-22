/**
 * Notification Schedule Store
 *
 * Persists the calculated notification schedule to localStorage.
 * Story 4.3 - Notification Scheduling Logic
 *
 * This store holds the SCHEDULE data.
 * Story 4.4 will consume this for actual notification dispatch.
 */

import { createStore } from "./create-store";
import {
  NotificationScheduleSchema,
  type NotificationScheduleEntry,
} from "@/types/notification-schedule";

export interface NotificationScheduleStoreState {
  /** Array of scheduled notification entries */
  schedule: NotificationScheduleEntry[];
  /** ISO datetime of last schedule calculation */
  lastCalculatedAt: string | undefined;
}

export interface NotificationScheduleStoreActions {
  /** Replace entire schedule with new entries */
  updateSchedule: (entries: NotificationScheduleEntry[]) => void;
  /** Mark a specific entry as notified */
  markAsNotified: (subscriptionId: string) => void;
  /** Clear all scheduled entries */
  clearSchedule: () => void;
  /** Get pending (not yet notified) entries */
  getPendingNotifications: () => NotificationScheduleEntry[];
  /** Get entry by subscription ID */
  getEntryBySubscriptionId: (
    subscriptionId: string
  ) => NotificationScheduleEntry | undefined;
}

export type NotificationScheduleState = NotificationScheduleStoreState &
  NotificationScheduleStoreActions;

export const useNotificationScheduleStore =
  createStore<NotificationScheduleState>(
    (set, get) => ({
      // Initial State
      schedule: [],
      lastCalculatedAt: undefined,

      // Actions
      updateSchedule: (entries) => {
        // Validate entries before updating
        const result = NotificationScheduleSchema.safeParse(entries);
        if (!result.success) {
          console.warn(
            "[NotificationScheduleStore] Invalid schedule entries rejected:",
            result.error.flatten()
          );
          return;
        }

        set({
          schedule: result.data,
          lastCalculatedAt: new Date().toISOString(),
        });
      },

      markAsNotified: (subscriptionId) => {
        const now = new Date().toISOString();
        set((state) => ({
          schedule: state.schedule.map((entry) =>
            entry.subscriptionId === subscriptionId
              ? { ...entry, notifiedAt: now }
              : entry
          ),
        }));
      },

      clearSchedule: () => {
        set({
          schedule: [],
          lastCalculatedAt: new Date().toISOString(),
        });
      },

      getPendingNotifications: () => {
        return get().schedule.filter((entry) => !entry.notifiedAt);
      },

      getEntryBySubscriptionId: (subscriptionId) => {
        return get().schedule.find(
          (entry) => entry.subscriptionId === subscriptionId
        );
      },
    }),
    {
      name: "NotificationScheduleStore",
      storageName: "notification-schedule",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<NotificationScheduleState>;

        if (version === 0) {
          // Migration from v0 to v1: Initialize with defaults
          console.log("[NotificationScheduleStore] Migrating from v0 to v1");
          state.schedule = state.schedule ?? [];
          state.lastCalculatedAt = state.lastCalculatedAt ?? undefined;
        }

        return state as NotificationScheduleState;
      },
      partialize: (state) => ({
        schedule: state.schedule,
        lastCalculatedAt: state.lastCalculatedAt,
      }),
      merge: (
        persistedState: unknown,
        currentState: NotificationScheduleState
      ) => {
        // Handle undefined persisted state (first load or cleared storage)
        if (!persistedState) {
          return currentState;
        }

        const persisted = persistedState as Partial<NotificationScheduleState>;

        // Validate schedule entries on rehydration
        const validSchedule = (persisted.schedule ?? []).filter((entry) => {
          const result = NotificationScheduleSchema.element.safeParse(entry);
          if (!result.success) {
            console.warn(
              "[NotificationScheduleStore] Invalid entry removed during rehydration:",
              entry
            );
            return false;
          }
          return true;
        });

        return {
          ...currentState,
          schedule: validSchedule,
          lastCalculatedAt: persisted.lastCalculatedAt,
        };
      },
    }
  );
